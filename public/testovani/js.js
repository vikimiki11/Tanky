smoothingindex = 4
var mapas = []
var mapax = 1600
var mapay = 800
seed=1
tick = 1000 / 60
errory=[]
tanky = []
kulky = []
for (i = 0; i < mapax; i++) {
  mapas[i] = []
  for (y = 0; y < mapay; y++) {
    mapas[i][y] = true
  }
}

function init() {
  canvas = document.getElementById('Canvas');
  context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false
  canvas.width = mapax;
  canvas.height = mapay;
  pohyb=""
  pal=""
  window.addEventListener('keydown', function(event) {
    if (pohyb == "") {
      if (event.keyCode == 37) {
        pohyb = setInterval(function() { brm(-1,tanky[0])},tick)
      }else{
      if (event.keyCode == 39) {
        pohyb = setInterval(function() { brm(1,tanky[0])},tick)
      }}}
    if (pal == "") {
      if (event.keyCode == 38) {
        pal = setInterval(function() { mir(-1, tanky[0]) }, tick)
      }else{
      if (event.keyCode == 40) {
        pal = setInterval(function() { mir(1, tanky[0]) }, tick)
      }}}
  })
  window.addEventListener('keyup', function(event) {
    if (event.keyCode == 37 || event.keyCode == 39) {
      clearInterval(pohyb)
      pohyb=""
    }
    if (event.keyCode == 38 || event.keyCode == 40) {
      clearInterval(pal)
      pal=""
    }
    if (event.keyCode == 32){
      fire(tanky[0], "viki", 8)
    }
  })
  createterain(Math.random() * 99);
  aktualizace();
}

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
      let n=noise.simplex2(seed+((z % mapax)/14), seed+(z / mapax/14))
      if(n<0.5){
        data[i+1] = 255+100*(n+0.25)
      }else{
        data[i+1] = 255
      }
      data[i + 3] = 255
    }
  }
}

function createterain(iseed) {
  seed=iseed
  mapa = JSON.parse(JSON.stringify(mapas));
  x = seed
  y = seed * 9
  for (xt = 0; xt < mapa.length; xt++) {
    n = mapay - ((noise.simplex2(x, y) + 1) / 10 + 0.2) * mapay
    for (i = 0; i < n; i++) {
      mapa[xt][i] = false
    }
    x = x + 0.002
  }
  return mapa
}

function spawntank(x, owner) {
  pos = tanky.length
  tanky[pos] = {}
  tanky[pos].x = x
  tanky[pos].y = 0
  tanky[pos].aim = 0
  tanky[pos].rotate = 0
  tanky[pos].own = owner
  document.querySelector(".tanky").innerHTML += '<div class="tank" id="' + owner + '" style="left:' + x + 'em;top:0em"><div class="cannon"></div></div>'
  tanky[pos].gravity = gravity(0, tanky[pos],true)
  tanky[pos].gravity
}

function rtd(rad) {
  return rad * (180 / Math.PI)
}

function dtr(deg) {
  return Math.PI / 180 * deg
}

function gravity(jump, ob, up) {
  if (mapa[Math.round(ob.x)][Math.round(ob.y)] == false) {
    ob.y += jump
    jump += 10/(1000/tick)
    document.querySelector("#" + ob.own).style.top = ob.y + "em"
    if(jump>2){
      up=true
    }
    setTimeout(function() { gravity(jump, ob, up) }, tick)
  } else {
    rotation(ob)
    if(up){
      p = 1
      while (mapa[Math.round(ob.x)][Math.round(ob.y - p)] == true) {
        p++
      }
      ob.y = ob.y - p
    }
    document.querySelector("#" + ob.own).style.top = (ob.y) + "em"
  }
}

function rotation(ob) {
  zmena = 0
  forpm = [1, -1]
  for (i = 0; i < 2; i++) {
    found = false
    smer = mapa[Math.round(ob.x + (25 * forpm[i]))][Math.round(ob.y)]
    krok = 0;
    while (!found) {
      if (smer != mapa[Math.round(ob.x + (25 * forpm[i]))][Math.round(ob.y) + krok]) {
        found = true
      } else {
        if (smer) {
          krok = (krok-1)
        } else {
          krok++
        }
      }
    }
    zmena += krok * forpm[i] * (-1)
  }
  if(zmena>0){
    posun=-90
  }else{
    posun=90
  }
  if (zmena != 0) {
    xsus=posun+rtd(Math.atan(50 / zmena))
    document.querySelector("#" + ob.own).style.transform = "rotate(" + xsus + "deg)translate(-37.5em, -37.5em)"
    ob.rotate = xsus
  }
}

updown=[-2,-1,0,1,2,3,4]
function brm(smer,ob) {
  mem=ob.x
  for(i=0;i<updown.length;i++){
    if(mapa[Math.round(ob.x+smer)][Math.round(ob.y+updown[i])]!=mapa[Math.round(ob.x+smer)][Math.round(ob.y+updown[i]-1)]){
      if(updown[i]<0){
        ob.x+=(smer/(2-updown[i]))
      }else{
        ob.x+=smer
      }
      ob.y+=updown[i]
      document.querySelector("#" + ob.own).style.top = ob.y + "em"
      document.querySelector("#" + ob.own).style.left = ob.x + "em"
    }
  }
  if(mem==ob.x && !mapa[Math.round(ob.x+smer)][Math.round(ob.y)]){
    ob.x+=smer
    clearInterval(pohyb)
    pohyb=""
    gravity(0,ob)
  }else{
    rotation(ob)
  }
}

function mir(smer, ob) {
  ob.aim+=smer
  if(ob.aim<0){
    ob.aim=0
  }else{
    if (ob.aim > 180) {
      ob.aim = 180
    }}
  document.querySelector("#" + ob.own+" .cannon").style.transform = "rotate(" + ob.aim + "deg)translate(10.5em,6em)"
}

function fire(ob, typ, speed){
 pos = kulky.length
 kulky[pos] = {}
 kulky[pos].typ = typ
 xcan=Math.cos(dtr(ob.rotate+ob.aim-180)*-1)
 ycan=Math.sin(dtr(ob.rotate+ob.aim-180)*-1)
 kulky[pos].x = ob.x-Math.sin(dtr(ob.rotate)*-1)*30.5+xcan*27
 kulky[pos].y = ob.y-Math.cos(dtr(ob.rotate)*-1)*30.5-ycan*27
 document.querySelector(".tanky").innerHTML += '<div class="kulka" id="' + typ + '" style="left:' + kulky[pos].x + 'em;top:'+ kulky[pos].y +'em"></div>'
 hore=(xcan*xcan+ycan*ycan)*speed*speed
 ys=Math.sqrt(hore/((xcan*xcan/(ycan*ycan))+1))
 xs=Math.sqrt(hore/((ycan*ycan/(xcan*xcan))+1))
 if(ob.rotate+ob.aim<180&&0<ob.rotate+ob.aim){
   ys=ys*(-1)
 }
 if(ob.rotate+ob.aim<90&&-90<ob.rotate+ob.aim){
  xs=xs*(-1)
}
 letim(xs ,ys ,kulky[pos])
}

function letim(speedx,speedy,ob){
  ob.x+=speedx
  ob.y+=speedy
  document.querySelector(".kulka").style.top=ob.y+"em"
  document.querySelector(".kulka").style.left=ob.x+"em"
  speedx=speedx*0.98851402035289613535686750493829
  speedy=speedy*0.98851402035289613535686750493829+10/(1000/tick)
  if(Math.round(ob.x) > -1 && Math.round(ob.x) < mapax + 1  && Math.round(ob.y) < mapay + 1){
    if (!mapa[Math.round(ob.x)][Math.round(ob.y)]) {
      setTimeout(function(){letim(speedx,speedy,ob)},tick)
    }else {
      removeElement(document.querySelector("#" + ob.typ))
      removeter(Math.round(ob.x),Math.round(ob.y),15)
    }
  }else{
    removeElement(document.querySelector("#" + ob.typ))
  }
}

function bum(x,y,ob){
 imageData = context.getImageData(0, 0, canvas.width, canvas.height);
 imageData.data
 context.putImageData(imageData, 0, 0); 
}

function removeter(xp,yp,r){
  qd=[]
  x=0
  while(x<=r){
    outof=false
    y=0
    while(!outof){
      if(Math.sqrt(x*x+y*y)>r){
        outof=true
      }else{
        qd[qd.length]=[x,y]
        y++
      }
    }
    x++
  }
  qtf=[-1,1]
  for(i=0;i<qd.length;i++){
    for(x=0;x<2;x++){
      for(y=0;y<2;y++){
        try{
          mapa[xp+qd[i][0]*qtf[x]][yp+qd[i][1]*qtf[y]]=false
        }catch(err){
          var d = new Date();
          var n = d.getUTCMinutes();
          errory[errory.length]={err,n}
        }
      }
    }
  }
  aktualizace()
  for(i=0;i<tanky.length;i++){
    gravity(0, tanky[i])
  }
}

function removeElement(element) {
  element.parentNode.removeChild(element);
}

setTimeout(function() { spawntank(200, "ahoj") }, 1000)
init()