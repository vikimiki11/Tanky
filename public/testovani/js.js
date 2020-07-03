connected=false
zpravy={g:[]}
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
    for(i=0;i<zpravy[rs].length;i++){
      addChatMessage(zpravy[rs][i],false)
    }
  }
}
if (window.location.hostname == "localhost") {
  socket = io("localhost:3000");
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
  pohyb = ""
  pal = ""
  window.addEventListener('keydown', function(event) {
      if (pohyb == "") {
          if (event.keyCode == 37) {
              pohyb = setInterval(function() {
                  brm(-1, tanky[0])
              }, tick)
          } else {
              if (event.keyCode == 39) {
                  pohyb = setInterval(function() {
                      brm(1, tanky[0])
                  }, tick)
              }
          }
      }
      if (pal == "") {
          if (event.keyCode == 38) {
              pal = setInterval(function() {
                  mir(-1, tanky[0])
              }, tick)
          } else {
              if (event.keyCode == 40) {
                  pal = setInterval(function() {
                      mir(1, tanky[0])
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
          fire(tanky[0], "viki", 8)
      }
  })
  createterain(Math.random() * 99);
  aktualizace();
  spawntrees();
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
  tanky[pos].pos = pos
  tanky[pos].x = x
  tanky[pos].y = 0
  tanky[pos].aim = 180 - x / mapax * 180
  tanky[pos].rotate = 0
  tanky[pos].own = owner
  document.querySelector(".tanky").innerHTML += '<div class="tank" id="' + owner + '" style="left:' + x + 'em;top:0em"><div class="cannon"></div></div>'
  mir(true, tanky[pos])
  mir(false, tanky[pos])
  tanky[pos].gravity = function(jump, pos, up) {
      if (mapa[Math.round(this.x)][Math.round(this.y)] == false) {
          this.y += jump
          jump += 10 / (1000 / tick)
          document.querySelector("#" + this.own).style.top = this.y + "em"
          if (jump > 2) {
              up = true
          }
          this.gravityt(jump, pos, true)
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
      }
  }
  tanky[pos].gravityt = function(jump, pos, up) {
      setTimeout(function() {
          tanky[pos].gravity(jump, pos, true)
      }, tick)
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
  for (i = 0; i < 2; i++) {
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
  mem = ob.x
  for (i = 0; i < updown.length; i++) {
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
}

function mir(smer, ob) {
  ob.aim += smer
  if (ob.aim < 0) {
      ob.aim = 0
  } else {
      if (ob.aim > 180) {
          ob.aim = 180
      }
  }
  document.querySelector("#" + ob.own + " .cannon").style.transform = "rotate(" + ob.aim + "deg)translate(10.5em,6em)"
}

function fire(ob, typ, speed) {
  pos = kulky.length
  kulky[pos] = {}
  kulky[pos].typ = typ
  xcan = Math.cos(dtr(ob.rotate + ob.aim - 180) * -1)
  ycan = Math.sin(dtr(ob.rotate + ob.aim - 180) * -1)
  kulky[pos].x = ob.x - Math.sin(dtr(ob.rotate) * -1) * 30.5 + xcan * 27
  kulky[pos].y = ob.y - Math.cos(dtr(ob.rotate) * -1) * 30.5 - ycan * 27
  document.querySelector(".tanky").innerHTML += '<div class="kulka" id="' + typ + '" style="left:' + kulky[pos].x + 'em;top:' + kulky[pos].y + 'em"></div>'
  hore = (xcan * xcan + ycan * ycan) * speed * speed
  ys = Math.sqrt(hore / ((xcan * xcan / (ycan * ycan)) + 1))
  xs = Math.sqrt(hore / ((ycan * ycan / (xcan * xcan)) + 1))
  if (ob.rotate + ob.aim < 180 && 0 < ob.rotate + ob.aim) {
      ys = ys * (-1)
  }
  if (ob.rotate + ob.aim < 90 && -90 < ob.rotate + ob.aim) {
      xs = xs * (-1)
  }
  letim(xs, ys, kulky[pos])
}

function letim(speedx, speedy, ob, typ) {
  ob.x += speedx
  ob.y += speedy
  document.querySelector(".kulka").style.top = ob.y + "em"
  document.querySelector(".kulka").style.left = ob.x + "em"
  speedx = speedx * 0.98851402035289613535686750493829
  speedy = speedy * 0.98851402035289613535686750493829 + 10 / (1000 / tick)
  if (Math.round(ob.x) > -1 && Math.round(ob.x) < mapax + 1 && Math.round(ob.y) < mapay + 1) {
      if (!mapa[Math.round(ob.x)][Math.round(ob.y)]) {
          setTimeout(function() {
              letim(speedx, speedy, ob)
          }, tick)
      } else {
          removeElement(document.querySelector("#" + ob.typ))
          removeter(Math.round(ob.x), Math.round(ob.y), 25)
      }
  } else {
      removeElement(document.querySelector("#" + ob.typ))
  }
}

function bum(x, y, ob) {
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData.data
  context.putImageData(imageData, 0, 0);
}

function removeter(xp, yp, r) {
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
  for (i = 0; i < qd.length; i++) {
      for (x = 0; x < 2; x++) {
          for (y = 0; y < 2; y++) {
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
}

function removeElement(element) {
  element.parentNode.removeChild(element);
}

init()
setTimeout(function() {
  spawntank(200, "ahoj")
}, 1000)
setTimeout(function() {
  spawntank(500, "aho2")
}, 1000)
opal = 0
function malert(mes) {
  document.querySelector(".alert").innerHTML = mes;
  opal = 1
}
setInterval(function() {
  opal = opal * 0.97;
  document.querySelector(".alert").style.opacity = opal
}, 100)
membersact = {}
var COLORS = ['#e21400', '#91580f', '#f8a700', '#f78b00', '#58dc00', '#287b00', '#a8f07a', '#4ae8c4', '#3b88eb', '#3824aa', '#a700ff', '#d300e7'];
inqgame = false
invites = []
socket.on('players', data=>{
  membersact = data
  if (inqgame) {
      if (membersact[rival].active == 0) {
          socket.emit('leave')
          malert("Odešel ti sploluhráč")
      }
  }
  document.querySelector("#members").innerHTML = ""
  for (i in membersact) {
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
  for (i = 0; i < invites.length; i++) {
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
socket.on('login', (data)=>{
  connected = true;
  // Display the welcome message
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
  location.reload();
}
)

socket.on('in queue', ()=>{
  //idiooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooot
  malert("Jsi v pořadí počkej.")
  if (window.location.hostname != "localhost") {
      $('.priprava').hide()
  }
}
)

socket.on('in room', (coplayername)=>{
  rival = coplayername
  document.querySelector("#rs").className="switchl";document.querySelector("#rs").innerHTML="Local chat"
  document.querySelector(".chat").innerHTML=""
  if(typeof zpravy[membersact[username].room]=="undefined"){zpravy[membersact[username].room]=[]}
  for(i=0;i<zpravy[membersact[username].room].length;i++){
    addChatMessage(zpravy[rs][i],false)
  }
  log("Začal jsi hru s: " + rival)
  $(".hiscreen").hide()
  $(".hracipole").show()
  $('.gamelobby').hide()
  inqgame = true
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
  document.querySelector(".chat").innerHTML += '<p class="message" style="display: block;"><span class="username" style="color: ' + getUsernameColor(data.username) + ';">' + data.username + '</span><span class="messageBody">' + data.message + '</span></p>'}
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
quckread = true
document.querySelector("#Quckgame").addEventListener("click", ()=>{
  if (quckread || window.location.hostname == "localhost") {
      socket.emit('quickgame', )
      quckread = false
      setTimeout(function() {
          quckread = true
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
  for (i = 0; i < invites.length; i++) {
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
  location.reload()
}
);

socket.on('reconnect', ()=>{
  log('Připojení bylo obnoveno');
  if (username) {
      socket.emit('add user', username);
  } else {
      location.reload()
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
