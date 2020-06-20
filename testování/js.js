smoothingindex = 4
var mapas = []
var mapax = 800
var mapay = 400
tick = 1000 / 60  
spawnntank = {
  x: 0,
  y: 0,
  own: "",
}
tanky = []
for (i = 0; i < mapax; i++) {
  mapas[i] = []
  for (y = 0; y < mapay; y++) {
    mapas[i][y] = true
  }
}
var effectButton;
var paintButton;
var canvas;
var context;

function init() {
  canvas = document.getElementById('Canvas');
  context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false

  // Set the canvas the same width and height of the image
  canvas.width = mapax;
  canvas.height = mapay;
  document.getElementById('Generace').addEventListener('click', function() { createterain(Math.random() * 99) });
  document.getElementById('Akt').addEventListener('click', function() { aktualizace() });
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
    data[i] = 255
  }
  for (let i = 0; i < data.length; i += 4) {
    z = i / 4
    if (mapa[Math.floor((z) % mapax)][Math.floor((z) / mapax)]) {
      data[i] = 0
      data[i + 2] = 0
    }
  }
}

function createterain(seed) {
  mapa = JSON.parse(JSON.stringify(mapas));
  x = seed
  y = seed * 9
  for (xt = 0; xt < mapa.length; xt++) {
    n = mapay - ((noise.simplex2(x, y) + 1) / 10 + 0.2) * mapay
    for (i = 0; i < n; i++) {
      mapa[xt][i] = false
    }
    x = x + 0.003
  }
  console.log("mapa vytvořená")
  return mapa
}

function spawntank(x, owner) {
  pos = tanky.length
  tanky[pos]={}
  tanky[pos].x = x
  tanky[pos].y = 0
  tanky[pos].own = owner
  document.querySelector(".tanky").innerHTML += '<div class="tank" id="' + owner + '" style="left:' + x + 'px;top:0px"></div>'
  tanky[pos].gravity = gravity(0, tanky[pos])
  tanky[pos].gravity
}
function rtd(rad){
  return rad * (180 / Math.PI)
}
function gravity(jump,ob) {
  if (mapa[Math.round(ob.x)][Math.round(ob.y)] == false) {
    ob.y += jump
    jump += 0.1
    document.querySelector("#" + ob.own).style.top = ob.y + "px"
    setTimeout(function() { gravity(jump,ob) }, tick)
  }else{
    p = 1
    while (mapa[Math.round(ob.x)][Math.round(ob.y - p)] == true) {
      p++
    }
    ob.y = ob.y - p + 2
    document.querySelector("#" + ob.own).style.top = (ob.y) + "px"
    alert("ahoj")
    rotation(jump,ob)
  }
}
function rotation(jump,ob){
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
          krok++
        } else {
          krok += (-1)
        }
      }
    }
    zmena += krok * forpm[i] * (-1)
  }
  console.log("block zmena"+zmena)
  console.log(rtd(Math.atan(50 / zmena)) + "deg")
  if (zmena != 0) {document.querySelector("#" + ob.own).style.transform = "rotate(" + rtd(Math.atan(50 / zmena)) + "deg)translate(-25px, -25px)"
  document.querySelector("#" + ob.own).style.transformOrigin = "50% 100%";}
}
setTimeout(function(){spawntank(200,"ahoj")},1000)
init()    