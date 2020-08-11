connected=false
zpravy={g:[]}
playing=false
ammo={kulka:[0.98851402035289613535686750493829,0.98851402035289613535686750493829,1,25,10/50],glider:[0.99767334516076867649202696642422,0.99767334516076867649202696642422,0,25,10/50]}//sablona:[slowx,slowy,gravitymultiplayer,radius,speed],
clearbum=[]
fuel=300
for(let i=0;i<50*50;i++){
  clearbum[i]=[0,0,0,0]
}
function simplexnoise(){
  return noise.simplex2(Math.random()*999,Math.random()*999)*0.5+0.5
}
function resize(){
  document.querySelector("aside").style.height=window.innerHeight-1+"px"
  if(connected){
    document.querySelector('.hracipole').style.fontSize=(document.querySelector('.hracipole').offsetWidth/1600)+'px';
    document.querySelector('body').style.left=((window.innerWidth-document.querySelector('main').offsetWidth-document.querySelector('aside').offsetWidth)/2)+'px'
  }
}
function switchchat() {
  sa=document.querySelector("#rs").className
  if(document.querySelector("#rs").className=="switchg"){
    if(membersact[username].room!=""){
      document.querySelector("#rs").className="switchl";document.querySelector("#rs").innerHTML="Local chat"
    }
  }else{
    document.querySelector("#rs").className="switchg";document.querySelector("#rs").innerHTML="Global chat"
  }
  if(document.querySelector("#rs").className!=sa){
    document.querySelector(".chat").innerHTML=""
    rs=document.querySelector("#rs").className.split("switch")[1]
    if(rs!="g"){rs=membersact[username].room;if(typeof zpravy[membersact[username].room]=="undefined"){zpravy[membersact[username].room]=[]}}
    for(let i of zpravy[rs]){
      addChatMessage(i,false)
    }
  }
}
if (window.location.hostname == "localhost") {
  socket = io("localhost:8080");
} else {
  socket = io(window.location.hostname);
}
if (localStorage.getItem('name')) {
  document.querySelector(".usernameInput").value = localStorage.getItem('name');
}
username = false
var mapas = []
var mapax = 1600
var mapay = 800
seed = 1
tick = 1000 / 60
errory = []
tanky = []
kulky = []
for (let i = 0; i < mapax; i++) {
  mapas[i] = []
  for (let y = 0; y < mapay; y++) {
      mapas[i][y] = true
  }
}
canvas = document.getElementById('Canvas');
context = canvas.getContext('2d');
context.imageSmoothingEnabled = false
canvas.width = mapax;
canvas.height = mapay;
pohyb = ""
pal = ""
window.addEventListener('keydown', function(event) {
    if (pohyb == "" && playing==true) {
        if (event.keyCode == 37) {
            pohyb = setInterval(function() {
                brm(-1, tanky[mujtank])
            }, tick)
        } else {
            if (event.keyCode == 39) {
                pohyb = setInterval(function() {
                    brm(1, tanky[mujtank])
                }, tick)
            }
        }
    }
    if (pal == "" && playing==true) {
        if (event.keyCode == 38) {
            pal = setInterval(function() {
                mir(-1, tanky[mujtank])
            }, tick)
        } else {
            if (event.keyCode == 40) {
                pal = setInterval(function() {
                    mir(1, tanky[mujtank])
                }, tick)
            }
        }
    }
})
window.addEventListener('keyup', function(event) {
    if (event.keyCode == 37 || event.keyCode == 39) {
        clearInterval(pohyb)
        pohyb = ""
    }
    if (event.keyCode == 38 || event.keyCode == 40) {
        clearInterval(pal)
        pal = ""
    }
    if (event.keyCode == 32) {
      fire(tanky[mujtank], document.querySelector('#vybava').value,true,parseFloat(document.querySelector("#power").value))
    }
})

function aktualizace() {
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  terain(imageData.data);
  context.putImageData(imageData, 0, 0);
}

function terain(data) {
  for (let i = 0; i < data.length; i++) {
      data[i] = 0
  }
  for (let i = 0; i < data.length; i += 4) {
      z = i / 4
      if (mapa[z % mapax][Math.floor(z / mapax)]) {
          let n = noise.simplex2(seed + ((z % mapax) / 14), seed + (z / mapax / 14))
          if (n < 0.5) {
              data[i + 1] = 255 + 100 * (n + 0.25)
          } else {
              data[i + 1] = 255
          }
          data[i + 3] = 255
      }
  }
}

function createterain(iseed) {
  seed = iseed
  mapa = JSON.parse(JSON.stringify(mapas));
  x = seed
  y = seed * 9
  for (let xt = 0; xt < mapa.length; xt++) {
      n = mapay - ((noise.simplex2(x, y) + 1) / 10 + 0.2) * mapay
      for (let i = 0; i < n; i++) {
          mapa[xt][i] = false
      }
      x = x + 0.002
  }
  return mapa
}

function spawntank(x, owner) {
  if(owner==username){
    mujtank=tanky.length
  }
  pos = tanky.length
  tanky[pos] = {}
  tanky[pos].pos = pos
  tanky[pos].x = x
  tanky[pos].y = 0
  tanky[pos].aim = 180 - x / mapax * 180
  tanky[pos].rotate = 0
  tanky[pos].own = owner
  tanky[pos].health =100
  tanky[pos].def = 1
  tanky[pos].attackmul = 1
  document.querySelector(".tanky").innerHTML += '<div class="tank" id="' + owner + '" style="left:' + x + 'em;top:0em;background-image: url(\'img/'+ getUsernameColor(owner)+'.png\');"><div class="cannon"></div></div>'      
  mir(1, tanky[pos])
  mir(-1, tanky[pos])
  tanky[pos].gravity = function(jump, pos, up) {
      if (mapa[Math.round(this.x)][Math.round(this.y)] == false) {
          this.y += jump
          jump += 10 / (1000 / tick)
          document.querySelector("#" + this.own).style.top = this.y + "em"
          if (jump > 2) {
              up = true
          }
          setTimeout(function() {
            tanky[pos].gravity(jump, pos, true)
          }, tick,jump, pos)
          send()
      } else {
          rotation(this)
          if (up) {
              p = 1
              while (mapa[Math.round(this.x)][Math.round(this.y - p)] == true) {
                  p++
              }
              this.y = this.y - p + 2
          }
          document.querySelector("#" + this.own).style.top = (this.y) + "em"
          send()
      }
  }
  tanky[pos].gravity(0, pos, true)
}

function spawntrees() {
  var z = 0
  x = Math.abs(noise.simplex2(seed + z, 0)) * 250 + 25
  z = z + 1000
  while (x < mapax) {
      y = 0
      while (!mapa[Math.round(x)][y]) {
          y++
      }
      document.querySelector(".stromy").innerHTML += '<img src="img/tree.gif" class="tree" style="left:' + x + 'em;top:' + y + 'em">'
      x += Math.abs(noise.simplex2(seed + z, 0)) * 250 + 25
      z = z + 1000
  }
}

function rtd(rad) {
  return rad * (180 / Math.PI)
}

function dtr(deg) {
  return Math.PI / 180 * deg
}

function rotation(ob) {
  zmena = 0
  forpm = [1, -1]
  for (let i = 0; i < 2; i++) {
      found = false
      smer = mapa[Math.round(ob.x + (25 * forpm[i]))][Math.round(ob.y)]
      krok = 0;
      while (!found) {
          if (smer != mapa[Math.round(ob.x + (25 * forpm[i]))][Math.round(ob.y) + krok]) {
              found = true
          } else {
              if (smer) {
                  krok = (krok - 1)
              } else {
                  krok++
              }
          }
      }
      zmena += krok * forpm[i] * (-1)
  }
  if (zmena > 0) {
      posun = -90
  } else {
      posun = 90
  }
  if (zmena != 0) {
      xsus = posun + rtd(Math.atan(50 / zmena))
      document.querySelector("#" + ob.own).style.transform = "rotate(" + xsus + "deg)translate(-37.5em, -37.5em)"
      ob.rotate = xsus
  }
}

updown = [-2, -1, 0, 1, 2, 3, 4]
function brm(smer, ob) {
  if(document.querySelector(".glider")==null&&document.querySelector(".kulka")==null){
    fuel+=(-1)
    if(playing==false || fuel<1){clearInterval(pohyb)}
    if(fuel>-1){
      document.querySelector("#fuel").innerHTML=fuel
      mem = ob.x
      for (let i = 0; i < updown.length; i++) {
          if (mapa[Math.round(ob.x + smer)][Math.round(ob.y + updown[i])] != mapa[Math.round(ob.x + smer)][Math.round(ob.y + updown[i] - 1)]) {
              if (updown[i] < 0) {
                  ob.x += (smer / (2 - updown[i]))
              } else {
                  ob.x += smer
              }
              ob.y += updown[i]
              document.querySelector("#" + ob.own).style.top = ob.y + "em"
              document.querySelector("#" + ob.own).style.left = ob.x + "em"
          }
      }
      if (mem == ob.x && !mapa[Math.round(ob.x + smer)][Math.round(ob.y)]) {
          ob.x += smer
          clearInterval(pohyb)
          pohyb = ""
          ob.gravity(0, ob.pos, false)
      } else {
          rotation(ob)
      }
      send()
    }
  }
}

function mir(smer, ob) {
  if(playing==false){clearInterval(pal)}
  ob.aim += smer
  if (ob.aim < 0) {
      ob.aim = 0
  } else {
      if (ob.aim > 180) {
          ob.aim = 180
      }
  }
  document.querySelector("#" + ob.own + " .cannon").style.transform = "rotate(" + ob.aim + "deg)translate(10.5em,6em)"
  send()
}

function fire(ob, typ, cansend, speed) {
  if((playing==true || cansend==false)&&document.querySelector(".glider")==null&&document.querySelector(".kulka")==null){
    clearInterval(pal)
    clearInterval(pohyb)
    pos = kulky.length
    kulky[pos] = {}
    kulky[pos].typ = typ
    kulky[pos].damagemulti = ob.attackmul
    xcan = Math.cos(dtr(ob.rotate + ob.aim - 180) * -1)
    ycan = Math.sin(dtr(ob.rotate + ob.aim - 180) * -1)
    kulky[pos].x = ob.x - Math.sin(dtr(ob.rotate) * -1) * 30.5 + xcan * 27
    kulky[pos].y = ob.y - Math.cos(dtr(ob.rotate) * -1) * 30.5 - ycan * 27
    if(typeof document.querySelector(typ)==null){removeElement(document.querySelector(typ))}
    document.querySelector(".tanky").innerHTML += '<div class="' + typ + '" id="' + typ + '" style="left:' + kulky[pos].x + 'em;top:' + kulky[pos].y + 'em"></div>'
    hore = (xcan * xcan + ycan * ycan) * ammo[typ][4] * ammo[typ][4] * speed * speed
    ys = Math.sqrt(hore / ((xcan * xcan / (ycan * ycan)) + 1))
    xs = Math.sqrt(hore / ((ycan * ycan / (xcan * xcan)) + 1))
    if (ob.rotate + ob.aim < 180 && 0 < ob.rotate + ob.aim) {
      ys = ys * (-1)
    }
    if (ob.rotate + ob.aim < 90 && -90 < ob.rotate + ob.aim) {
      xs = xs * (-1)
    }
    if(roomdata.player[roomdata.activeid]==username && playing==true && cansend==true){
      socket.emit("fire",[[mujtank,typ, speed],[JSON.parse(JSON.stringify(tanky)),new Date().getTime()]])
    }
    playing=false
    letim(xs, ys, kulky[pos])
  }
}

function letim(speedx, speedy, ob) {
  ob.x += speedx
  ob.y += speedy
  document.querySelector("."+ob.typ).style.top = ob.y + "em"
  document.querySelector("."+ob.typ).style.left = ob.x + "em"
  speedx = speedx * ammo[ob.typ][0]
  speedy = speedy * ammo[ob.typ][1] + (10 / (1000 / tick) * ammo[ob.typ][2])
  if (Math.round(ob.x) > -1 && Math.round(ob.x) < mapax + 1 && Math.round(ob.y) < mapay + 1) {
      if (!mapa[Math.round(ob.x)][Math.round(ob.y)]) {
          setTimeout(function() {
              letim(speedx, speedy, ob, ob.typ)
          }, tick)
      } else {
          removeElement(document.querySelector("#" + ob.typ))
          removeter(Math.round(ob.x), Math.round(ob.y), ammo[ob.typ][3])
          damagetanks(Math.round(ob.x), Math.round(ob.y), ammo[ob.typ][3], ob.damagemulti)
          bum(Math.round(ob.x), Math.round(ob.y))
      }
  } else {
      removeElement(document.querySelector("#" + ob.typ))
  }
}

function damagetanks(x,y,radius,damagemulti) {
  for(let i=0;i<tanky.length;i++){
    dis=Math.sqrt((tanky[i].x-x)*(tanky[i].x-x)+(tanky[i].y-y)*(tanky[i].y-y))
    if(dis<radius*2){
      tanky[i].health+=-(Math.abs(radius*2-dis)*damagemulti/tanky[i].def);
      if(tanky[i].health<=0){
        if(i<mujtank){mujtank+=-1}
        bum(tanky[i].x,tanky[i].y)
        removeElement(document.querySelector("#"+tanky[i].own))
        haha=[]
        for(let y=0;y<tanky.length;y++){
          if(i!=y){
            haha[haha.length]=tanky[y]
          }
        }
        tanky=haha
        if(inqgame){
          if(username==tanky[0].own){
            document.querySelector("#win").style.top="50vh"
          }else{
            document.querySelector("#lost").style.top="50vh"
          }
        }
      }else{
        if(i==mujtank){document.querySelector("#power").max=Math.ceil(tanky[mujtank].health).toString()}
        document.querySelector("#poweruk").innerHTML=document.querySelector("#power").value
      }
    }
  }
}

bumnum=0
bumy=[]
function bum(x, y) {
  //document.querySelector(".tanky").innerHTML+='<canvas class="bum" id="Canvas'+bumnum+'" style="left:'+x+'em;top:'+y+'em;"></canvas>'
  document.querySelector(".vybuchy").innerHTML+='<svg class="bum" id="SVG'+bumnum+'" viewBox="0 0 50 60" style="left:'+x+'em;top:'+y+'em;"></svg>'
  bumy[bumnum] = {};
  bumy[bumnum].kroky = 0;
  bumy[bumnum].id = bumnum;
  bumy[bumnum].canvas = function(){return document.querySelector("#SVG"+this.id)};
  bumy[bumnum].radius=2;
  bumy[bumnum].flame=[];
  bumy[bumnum].smoke=[];
  bumy[bumnum].sharp=[];
  bumy[bumnum].vitr=(Math.random()-0.5)*0.5;
  for(let i=0;i<30;i++){
    bumy[bumnum].sharp[i]=[25,50,Math.random()*2-1,Math.random()*-1]//creating sharp
    multipli=Math.sqrt(2.5/(bumy[bumnum].sharp[i][2]*bumy[bumnum].sharp[i][2]+bumy[bumnum].sharp[i][3]*bumy[bumnum].sharp[i][3]))*2
    bumy[bumnum].sharp[i][2]=bumy[bumnum].sharp[i][2]*multipli
    bumy[bumnum].sharp[i][3]=bumy[bumnum].sharp[i][3]*multipli
  }
  bumy[bumnum].Interval=setInterval(function(ob){postupbum(ob)},tick*2,bumy[bumnum])
  bumnum++
}
function postupbum(ob){
  ob.kroky++
  print=""
  for(let i=0;i<ob.sharp.length;i++){
    ob.sharp[i][0]+=ob.sharp[i][2]+ob.vitr
    ob.sharp[i][1]+=ob.sharp[i][3]
  }
  for(let i=0;i<ob.flame.length;i++){
    let barva=Math.random()
    ob.smoke[ob.smoke.length]=[ob.flame[i][0],ob.flame[i][1],noise.simplex2(Math.random()*456431,9645624)*0.2+ob.vitr,"rgb("+barva*75+","+barva*75+","+barva*75+")",ob.kroky-15,Math.random()*9963]//x,y,posunx,barva(0-1),kdyspawn,seed stoupání
  }
  ob.flame=[]
  if(ob.kroky<30){
    if(ob.kroky<15){
      x=Math.sin(ob.kroky*0.15707963267948966192313216916398)
      for(let i=0;i<20;i++){
        ob.flame[i]=[simplexnoise()*(10+x*7)+20-x/2*7,simplexnoise()*(5+x*4)+47.5-(x*4),Math.random()]//rozšířený výbuch
      }
      if(ob.kroky==14){ob.sharp=[]}
    }else{
      for(let i=0;i<3;i++){
        ob.flame[i]=[simplexnoise()*10+20,simplexnoise()*5+47.5,Math.random()]//x,y,barva(0-1)
      }
    }
  }
  //ob.context.clearRect(0, 0, ob.canvas.width, ob.canvas.height);
  
  for(let i=0;i<ob.smoke.length;i++){
    ob.smoke[i][1]+=-24/(ob.kroky-ob.smoke[i][4]+15)+noise.simplex2(ob.smoke[i][5],419654)*0.8
    ob.smoke[i][5]++
    ob.smoke[i][0]+=ob.smoke[i][2]
    print+='<circle cx="'+ob.smoke[i][0]+'" cy="'+ob.smoke[i][1]+'" r="'+ob.radius+'" fill="'+ob.smoke[i][3]+'" />'
  }

  for(let i=0;i<ob.flame.length;i++){
    print+='<circle cx="'+ob.flame[i][0]+'" cy="'+ob.flame[i][1]+'" r="2.5" fill="rgb(255,'+(235-ob.flame[i][2]*84)+','+(235-ob.flame[i][2]*235)+')" />'
  }

  for(let i=0;i<ob.sharp.length;i++){
    print+='<circle cx="'+ob.sharp[i][0]+'" cy="'+ob.sharp[i][1]+'" r="1" fill="#FFAC00" />'
  }
  ob.canvas().innerHTML=print
  if(ob.kroky>45){
    savesussprojusus=[]
    if(ob.smoke.length>10){
      for(let i=10;i<ob.smoke.length;i++){
        savesussprojusus[savesussprojusus.length]=ob.smoke[i]
      }
    }else{
      for(let i=0;i<ob.smoke.length;i++){
        savesussprojusus[savesussprojusus.length]=ob.smoke[i]
      }
    }
    ob.smoke=savesussprojusus
    ob.radius=ob.radius-2/45+0.00000000000001
  }
  if(ob.kroky>90){
    clearInterval(ob.Interval)
    removeElement(ob.canvas())
  }
}

function removeter(xp, yp, r) {
  // for(let i=0;i<document.querySelectorAll(".stromy img").length;i++){
  //   if(Math.sqrt((parseFloat(document.querySelectorAll(".stromy img")[i].style.left)-xp)*(parseFloat(document.querySelectorAll(".stromy img")[i].style.left)-xp)+(parseFloat(document.querySelectorAll(".stromy img")[i].style.top)-yp)*(parseFloat(document.querySelectorAll(".stromy img")[i].style.top)-yp))<r){removeElement(document.querySelectorAll(".stromy img")[i])}
  // }
  yp = yp - 15
  qd = []
  x = 0
  while (x <= r) {
      outof = false
      y = 0
      while (!outof) {
          if (Math.sqrt(x * x + y * y) > r) {
              outof = true
          } else {
              qd[qd.length] = [x, y]
              y++
          }
      }
      x++
  }
  qtf = [-1, 1]
  for (let i = 0; i < qd.length; i++) {
      for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 2; y++) {
              try {
                  mapa[xp + qd[i][0] * qtf[x]][yp + qd[i][1] * qtf[y]] = false
              } catch (err) {
                  var d = new Date();
                  var n = d.getUTCMinutes();
                  errory[errory.length] = {
                      err,
                      n
                  }
              }
          }
      }
  }
  aktualizace()
  for (let i = 0; i < tanky.length; i++) {
      tanky[i].gravity(0, i, true)
  }
  for(let i=0;i<document.querySelectorAll(".stromy img").length;i++){
    if(!(mapa[Math.round(parseFloat(document.querySelectorAll(".stromy img")[i].style.left))][Math.round(parseFloat(document.querySelectorAll(".stromy img")[i].style.top+1))])){removeElement(document.querySelectorAll(".stromy img")[i])}
  }
}

function removeElement(element) {
  element.parentNode.removeChild(element);
}

opal = 0
function malert(mes) {
  document.querySelector(".alert").innerHTML = mes+'<button onclick="document.querySelector(\'p.alert\').style.display=\'none\'">✗</button>';
  opal = 1
  visal=true
  document.querySelector("p.alert").style.display='block'
}
visal=false
setInterval(function() {
  opal = opal * 0.97;
  if(opal<0.001 || !visal){
    visal=false;
    document.querySelector("p.alert").style.display='none'
  }else{
    document.querySelector("p.alert").style.opacity = opal
  }
}, 100)
membersact = {}
var COLORS = ['0F0', '0EE', '22F', 'EE0', 'E00', 'E0E'];
inqgame = false
invites = []
socket.on('players', data=>{
  membersact = data
  if (inqgame) {
      if (membersact[rival].active == 0) {
        leave()
        malert("Odešel ti sploluhráč")
      }
  }
  document.querySelector("#members").innerHTML = ""
  for (let i in membersact) {
      if (i != username && membersact[i].active === 0) {
          document.querySelector("#members").innerHTML = document.querySelector("#members").innerHTML + "<li value='" + i + "'>" + i + "</li>"
      }
  }
  document.querySelectorAll("#members li").forEach(item=>{
      item.addEventListener('click', event=>{
          malert("Poslal jsi pozvánku do hry pro uživatele " + item.innerText + ".")
          socket.emit('sendinvite', item.innerText)

      }
      )
  }
  )

  invites = invites.filter(function(el) {
      return membersact[el].active === 0;
  });
  document.querySelector("#members").innerHTML = ""
  for (let i = 0; i < invites.length; i++) {
      if (invites[i] != username && membersact[invites[i]].active === 0) {
          document.querySelector("#members").innerHTML = "<li value='" + invites[i] + "'>" + invites[i] + "</li>" + document.querySelector("#invites").innerHTML
      }
  }
  document.querySelectorAll("#members li").forEach(item=>{
      item.addEventListener('click', event=>{
          if (onceacc === true) {
              socket.emit('acceptinvite', item.innerText)
              onceacc = false
              setTimeout(function() {
                  onceacc = true
              }, 1000)
          }
      }
      )
  }
  )

}
)
function leave(){
  socket.emit('leave')
  document.querySelector('.tanky').innerHTML=""
  document.querySelector('.stromy').innerHTML=""
  document.querySelector('#power').max=100
  document.querySelector('#poweruk').innerHTML=100
  document.querySelector("#win").style.top="-50vh"
  document.querySelector("#lost").style.top="-50vh"
  membersact[username].room=""
  switchchat()
  tanky=[]
  if(roomdata.player[roomdata.activeid]==username){
    playing=false
  }
  rival = ""
  $(".hracipole").hide()
  $('.gamelobby').hide()
  $(".hiscreen").show()
  resize()
  ingame = false
  inqgame = false
}
socket.on('login', (data)=>{
  connected = true;
  var message = "Chat pro hráče lodí:";
  log(message);
  addParticipantsMessage(data);
  removeElement(document.querySelector(".login.page"))
  resize()
  //idiooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooot
}
);

socket.on('denied', ()=>{
  alert("již použité jméno")
  if (window.location.hostname != "localhost") {
    location.reload();
  }
}
)

socket.on('in queue', ()=>{
  //idiooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooot
  malert("Jsi v pořadí počkej.")
  if (window.location.hostname != "localhost") {
      $('.Quickgame').hide()
  }
}
)

socket.on('in room', (data)=>{
  mujtank = undefined
  roomdata = data[1]
  console.log("Vstup do roomy")
  console.log(data)
  if(roomdata.player[roomdata.activeid]==username){
    playing=true
  }
  rival = data[0]
  document.querySelector("#rs").className="switchl";document.querySelector("#rs").innerHTML="Local chat"
  document.querySelector(".chat").innerHTML=""
  if(typeof zpravy[membersact[username].room]=="undefined"){zpravy[membersact[username].room]=[]}
  for(let i=0;i<zpravy[membersact[username].room].length;i++){
    addChatMessage(zpravy[rs][i],false)
  }
  tanky=[]
  createterain(roomdata.seed);
  aktualizace();
  spawntrees();
  if(roomdata.player[roomdata.activeid]==username){
    for(let i=0;i<roomdata.sp.length;i++){
      spawntank(roomdata.sp[i][0],roomdata.sp[i][1]);
    }
  }else{
    let i = 0
    while(typeof mujtank=="undefined"){
      if(roomdata.sp[i][1]==username){
        mujtank=i
      }
      i++
    }
  }
  if(data[2]){
    log("Začal jsi hru s: " + rival)
    inqgame = true
    $(".hracipole").show()
    document.querySelector("#fuel").innerHTML=fuel
    $('.gamelobby').hide()
    resize()
  }
  $(".hiscreen").hide()
  ingame=true
  //idiooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooot
}
);

socket.on('jj', (data)=>{
  socket.emit('jj', (data))
}
)

const addParticipantsMessage = (data)=>{
  var message = '';
  if (data.numUsers == 1) {
      message += "Jsi tu sám";
  } else {
      if (data.numUsers == 2) {
          message += "Máš tu jednoho kamaráda";
      } else {
          message += "Máš tu " + (data.numUsers - 1) + " kamarády";
      }
  }
  log(message);
}
const setUsername = ()=>{
  username = cleanInput($(".usernameInput").val().trim());
  // If the username is valid
  if (username) {
      // Tell the server your username
      socket.emit('add user', username);
      localStorage.setItem('name', username);
      console.log(socket)
  }
}

// Sends a chat message
const sendMessage = ()=>{
  var message = $("#mes").val();
  // Prevent markup from being injected into the message
  message = cleanInput(message);
  // if there is a non-empty message and a socket connection
  if (message && connected) {
      $("#mes").val('');
      rs=document.querySelector("#rs").className.split("switch")[1]
      if(rs=="g"){
      addChatMessage({
          username: username,
          message: message,
          skupina: "g"
      },true);socket.emit('new message', [message,"g"]);}else{addChatMessage({
        username: username,
        message: message,
        skupina: membersact[username].room
    },true);socket.emit('new message', [message,membersact[username].room]);}
  }
}
const log = (message)=>{
  document.querySelector(".chat").innerHTML += '<p class="log" style="display: block;">' + message + '</p>'
}
const addChatMessage = (data,save)=>{
  rs=document.querySelector("#rs").className.split("switch")[1]
  if(rs==data.skupina || (rs=="l" && typeof data.skupina=="number")){
  document.querySelector(".chat").innerHTML += '<p class="message" style="display: block;"><span class="username" style="color: #' + getUsernameColor(data.username) + ';">' + data.username + '</span><span class="messageBody">' + data.message + '</span></p>'}
  if(typeof zpravy[data.skupina]=="undefined"){zpravy[data.skupina]=[]}
  if(save==true){zpravy[data.skupina][zpravy[data.skupina].length]=data}
}
const cleanInput = (input)=>{
  return $('<div/>').text(input).html();
}
const getUsernameColor = (username)=>{
  // Compute hash code
  var hash = 7;
  for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
  }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
}

$(window).keydown(event=>{
  if (event.which === 13) {
      if (!username) {
          $(".usernameInput").focus();
          setUsername();
      } else {
          sendMessage()
      }
  }
}
);
quickread = true
document.querySelector("#Quickgame").addEventListener("click", ()=>{
  if (quickread || window.location.hostname == "localhost") {
      socket.emit('quickgame', )
      quickread = false
      setTimeout(function() {
          quickread = true
      }, 1000)
  }
}
);
document.querySelector("#inviteinput").addEventListener("keyup", ()=>{
  if (document.querySelector("#inviteinput").value != "") {
      document.querySelector("#invitestyle").innerHTML = "ul#members li[value*='" + document.querySelector("#inviteinput").value + "']{display:block}"
  } else {
      document.querySelector("#invitestyle").innerHTML = "ul#members li{display:block !important}"
  }
}
);
socket.on('recieveinvite', data=>{
  if (data[1] == username) {
      invites = invites.filter(function(el) {
          return el != data[0];
      });
      malert("Přišel ti invite od " + data[0] + ".")
      invites[invites.length] = data[0]
  }
  document.querySelector("#invites").innerHTML = ""
  for (let i = 0; i < invites.length; i++) {
      if (invites[i] != username && membersact[invites[i]].active === 0) {
          document.querySelector("#invites").innerHTML = "<li value='" + invites[i] + "'>" + invites[i] + "</li>" + document.querySelector("#invites").innerHTML
      }
  }
  document.querySelectorAll("#invites li").forEach(item=>{
      item.addEventListener('click', event=>{
          if (onceacc === true) {
              socket.emit('acceptinvite', item.innerText)
              onceacc = false
              setTimeout(function() {
                  onceacc = true
              }, 1000)
          }
      }
      )
  }
  )
}
)
socket.on('new message', (data)=>{
  addChatMessage(data,true);
}
);

socket.on('disconnect', ()=>{
  log('you have been disconnected');
  alert("Byl jsi odpojen")
  if (window.location.hostname != "localhost" && !connected) {
    location.reload();
  }
}
);

socket.on('reconnect', ()=>{
  log('Připojení bylo obnoveno');
  if (username) {
    socket.emit('add user', username);
  } else {
    location.reload();
  }
}
);
socket.on('denied', ()=>{
  alert("již použité jméno")
}
)
socket.on('waiting for accept', ()=>{
  malert("Invite byl poslán")
}
)
sendqueue=[]
sendinprogress=false
function send(){
  if(roomdata.player[roomdata.activeid]==username){
    if(!sendinprogress){
      setTimeout(function(){actualsend()},200)
      sendinprogress=true
    }
    sendqueue[sendqueue.length]=[JSON.parse(JSON.stringify(tanky)),new Date().getTime()]
  }
}
function actualsend(){
  if(roomdata.player[roomdata.activeid]==username){
    socket.emit("sendstate",sendqueue)
  }
  sendinprogress=false
  sendqueue=[]
}
firsttimehe=false
socket.on("sendstate",(movequeue)=>{
  for(let i=0;i<movequeue.length;i++){
    if(firsttimehe==false){
      firsttimemy=new Date().getTime()
      firsttimehe=movequeue[0][1]
    }
    setTimeout(write,movequeue[i][1]-firsttimehe-(new Date().getTime()-firsttimemy)+300,movequeue[i][0])
  }
})
function write(movequeue){
  tanky=movequeue;
  for(pos=0;pos<tanky.length;pos++){
    tanky[pos].gravity = function(jump, pos, up) {
      if (mapa[Math.round(this.x)][Math.round(this.y)] == false) {
          this.y += jump
          jump += 10 / (1000 / tick)
          document.querySelector("#" + this.own).style.top = this.y + "em"
          send()
          if (jump > 2) {
              up = true
          }
          setTimeout(function() {
            tanky[pos].gravity(jump, pos, true)
          }, tick,jump, pos)
      } else {
          rotation(this)
          if (up) {
              p = 1
              while (mapa[Math.round(this.x)][Math.round(this.y - p)] == true) {
                  p++
              }
              this.y = this.y - p + 2
          }
          document.querySelector("#" + this.own).style.top = (this.y) + "em"
          send()
      }
  }
  }
  settotanks=""
  for(let y=0;y<tanky.length;y++){
    settotanks+='<div class="tank" id="'+tanky[y].own+'" style="left: '+tanky[y].x+'em; top: '+tanky[y].y+'em; transform: rotate('+tanky[y].rotate+'deg) translate(-37.5em, -37.5em);background-image: url(\'img/'+ getUsernameColor(tanky[y].own)+'.png\');"><div class="cannon" style="transform: rotate('+tanky[y].aim+'deg) translate(10.5em, 6em);"></div></div>'
  }
  document.querySelector(".tanky").innerHTML=settotanks
}
socket.on("fire",(data)=>{
  if(firsttimehe==false){
    firsttimemy=new Date().getTime()
    firsttimehe=data[0][1][1]
  }
  if(roomdata.player[roomdata.activeid]!=username){
    setTimeout(function(){
    fire(tanky[data[0][0][0]],data[0][0][1],false,data[0][0][2])
    },data[0][1][1]-firsttimehe-(new Date().getTime()-firsttimemy)+300)
    write(data[0][1][0])
  }
  setTimeout(function(data){
    roomdata=data[1]
    if(roomdata.player[roomdata.activeid]==username){
      playing=true
    }},data[0][1][1]-firsttimehe-(new Date().getTime()-firsttimemy)+1300,data)
})