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

gamePlane.addEventListener("mousemove", showPoinerPosition);
debugX = 0;
debugY = 0;
function showPoinerPosition(e) {
	debugX = e.layerX / gamePlane.clientWidth * terrain.width;
	debugY = terrain.height - e.layerY / gamePlane.clientHeight * terrain.height;
	document.querySelector("#pointerPosition").innerHTML = `X: ${debugX.toFixed(4)} Y: ${debugY.toFixed(4)}`;
}


let ignoreBlockControl = false;
function ignoreBlockControlToggle() {
	ignoreBlockControl = !ignoreBlockControl;
}
