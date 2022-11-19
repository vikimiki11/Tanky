let debug = false;
document.body.addEventListener("keydown", function (e) {
	if (e.keyCode == 192) {
		debug = !debug;
		document.querySelector("#debugMenu").style.display = debug ? "flex" : "none";
	}
});

let debugCannonDrawInterval = null;
function debugCannonDraw() {
	if (game) if(debugCannonDrawInterval){
		clearInterval(debugCannonDrawInterval);
		debugCannonDrawInterval = null;
		return;
	} else {
		let cannonTip, cannonBase;
		debugCannonDrawInterval = setInterval(() => {
			cannonTip = game.actualPlayer.tank.cannonTip;
			cannonBase = game.actualPlayer.tank.cannonBase;
			terrain.canvasData.setPixel(round(cannonTip[0]), round(cannonTip[1]), [255, 0, 0, 255]);
			terrain.canvasData.setPixel(round(cannonBase[0]), round(cannonBase[1]), [0, 255, 0, 255]);
			terrain.canvasData.update();
		}, 100)
	};
}

let infinityGadgetsAndAmmoCheck = true;
function infinityGadgetsAndAmmo() {
	infinityGadgetsAndAmmoCheck = !infinityGadgetsAndAmmoCheck;
}

gamePlane.addEventListener("mousemove", showPointerPosition);
debugX = 0;
debugY = 0;
function showPointerPosition(e) {
	if (debug) {
		debugX = e.layerX / gamePlane.clientWidth * terrain.width;
		debugY = terrain.height - e.layerY / gamePlane.clientHeight * terrain.height;
		terrainCollision = terrain.controlCollision(debugX, debugY)[0];
		tankCollision = game.checkForTankCollision(debugX, debugY);
		document.querySelector("#pointerPosition").innerHTML = `Terrain C.: ${terrainCollision} Tank C.: ${tankCollision} X: ${debugX.toFixed(4)} Y: ${debugY.toFixed(4)}`;
	}
}


let ignoreBlockControl = false;
function ignoreBlockControlToggle() {
	ignoreBlockControl = !ignoreBlockControl;
}


let paintEnable = false;
let brushSize = document.querySelector("#brushSize");
function enablePaint() {
	paintEnable = !paintEnable;
};
gamePlane.addEventListener("mousemove", paint);
function paint(e) {
	if (paintEnable) {
		e.preventDefault();
		let x = e.layerX / gamePlane.clientWidth * terrain.width;
		let y = terrain.height - e.layerY / gamePlane.clientHeight * terrain.height;
		let leftButton = Boolean(e.buttons % 2);
		let rightButton = Boolean(floor(e.buttons / 2));
		let xy = [round(x), round(y)];
		let radius = parseInt(brushSize.value);
		if (leftButton) terrain.destroyTerrain(xy, radius);
		if (rightButton) terrain.buildTerrain(xy, radius);
	}
}
gamePlane.addEventListener("contextmenu", (e) => { if (paintEnable)e.preventDefault() });

function setAirSpeed() {
	value = parseInt(document.querySelector("#airSpeed").value);
	while (abs(value) < 50 && round(game.windCurrent) != value) {
		game.windStep++;
	}
}

setInterval(() => {
	let pos = game?.actualPlayer?.tank.getCurrentProjectileLandLocation() || [0, 0,{x:0,y:0}];
	document.querySelector("#debugAim").innerHTML = pos ? `
	X: ${pos[0].toFixed(2)} Y: ${pos[1].toFixed(2)} Vector: X: ${pos[2].x.toFixed(2)} Y: ${pos[2].y.toFixed(2)}` : "";
}, 1000);