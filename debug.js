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
			terrain.canvasData.setPixel(Math.round(cannonTip[0]), Math.round(cannonTip[1]), [255, 0, 0, 255]);
			terrain.canvasData.setPixel(Math.round(cannonBase[0]), Math.round(cannonBase[1]), [0, 255, 0, 255]);
			terrain.canvasData.update();
		}, 100)
	};
}

let infinityGadgetsAndAmmoCheck = false;
function infinityGadgetsAndAmmo() {
	infinityGadgetsAndAmmoCheck = !infinityGadgetsAndAmmoCheck;
}