smoothingindex=4
var mapas=[]
var mapax=500
var mapay=500
tanks=[]
for(i=0;i<mapax;i++){
    mapas[i]=[]
    for(y=0;y<mapax;y++){
        mapas[i][y]=true
    }
}
var effectButton;
var paintButton;
var canvas;
var context;

function init() {
  effectButton = document.getElementById('EffectButton');
  canvas = document.getElementById('Canvas');
  context = canvas.getContext('2d');
  context.imageSmoothingEnabled=false
  
  // Set the canvas the same width and height of the image
  canvas.width = 500;
  canvas.height = 500;  
  effectButton.addEventListener('click', addEffect);
}

function addEffect() {
    mapa=createterain(Math.random()*99)
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    terain(imageData.data);
    context.putImageData(imageData, 0, 0);
}

function terain(data) {
  for (let i = 0; i < data.length; i++ ) {
    data[i]=255
  }
  for (let i = 0; i < data.length; i+=4 ) {
    z=i/4
        if(mapa[Math.floor((z)%500)][Math.floor((z)/500)]){
            data[i]=0
            data[i+2]=0
        }
  }
}
function createterain(seed){
    mapa=JSON.parse(JSON.stringify(mapas));
    x=seed
    y=seed*9
    for(xt=0;xt<mapa.length;xt++){
        n=500-((noise.simplex2(x,y)+1)/10+0.2)*500
        for(i=0;i<n;i++){
            mapa[xt][i]=false
        }
        x=x+0.003
    }
    console.log("mapa vytvořená")
    return mapa
}
init()
