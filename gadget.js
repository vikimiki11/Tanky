gadgetIDCounter = 0;
class Gadget {
	constructor(name, shortName, defaultAmount, cost, buyAmount) {
		this.id = gadgetIDCounter++;
		this.name = name;
		this.shortName = shortName;
		this.img = "img/gadget/" + shortName + ".png";
		this.defaultAmount = defaultAmount;
		this.cost = cost;
		this.buyAmount = buyAmount;
	}
	get html() {
		return `<div class="gadgetRow gadget${this.id}" gadget="${this.id}">
					<div class="gadgetIcon">
						<img src="${this.img}">
					</div>
					<div class="gadgetName">
						${this.name}
					</div>
					<div class="gadgetCost">
						${this.cost}
					</div>
					<div class="gadgetBuyAmount">
						${this.buyAmount}
					</div>
					<div class="gadgetAmount">
					</div>
				</div>`;
	}
}
gadgetList = [];
gadgetList.push(new Gadget("Weak shield", "weakShield", 8, 5000, 2))
gadgetList.push(new Gadget("Shield", "shield", 8, 10000, 1))
gadgetList.push(new Gadget("Strong shield", "strongShield", 8, 15000, 1))
gadgetList.push(new Gadget("Super shield", "superShield", 8, 20000, 1))
gadgetList.push(new Gadget("Repair kit", "repairKit", 8, 20000, 1))
gadgetList.push(new Gadget("Fuel", "fuel", 200, 2000, 50))
gadgetList.push(new Gadget("Parachute", "parachute", 8, 20000, 1))
gadgetList.push(new Gadget("Teleport", "teleport", 8, 20000, 1))

function repairKit() {
	if (game.blockControls && !ignoreBlockControl) return;
	if ((game.actualPlayer.gadget[4] > 0 || infinityGadgetsAndAmmoCheck) && game.actualPlayer.tank.maxFirePower < 100) {
		if (!infinityGadgetsAndAmmoCheck) game.actualPlayer.gadget[4]--;
		game.actualPlayer.tank.maxFirePower = game.actualPlayer.tank.maxFirePower + 20;
		game.actualPlayer.updateCSS();
	}
}
function fuel() {
	if (game.blockControls && !ignoreBlockControl) return;
	if (game.actualPlayer.gadget[5] >= 50 || infinityGadgetsAndAmmoCheck) {
		if (!infinityGadgetsAndAmmoCheck) game.actualPlayer.gadget[5] -= 50;
		game.actualPlayer.tank.fuel += 50;
		game.actualPlayer.updateCSS();
	}
}

let teleportActive = false;
const gamePlane = document.querySelector("#gamePlane");
gamePlane.addEventListener("click", teleportClick);
function teleport() {
	if (game.blockControls && !ignoreBlockControl) return;
	if (!teleportActive && (game.actualPlayer.gadget[7] > 0 || infinityGadgetsAndAmmoCheck)) {
		game.blockControls = true;
		if (!infinityGadgetsAndAmmoCheck) game.actualPlayer.gadget[7]--;
		gamePlane.style.cursor = "crosshair";
		teleportActive = true;
		game.actualPlayer.updateCSS();
	}
}
function teleportClick(e) {
	if (teleportActive) {
		game.blockControls = false;
		game.actualPlayer.tank.x = e.layerX / gamePlane.clientWidth * terrain.width;
		game.actualPlayer.tank.y = min((1 - (e.layerY / gamePlane.clientHeight)) * terrain.height, terrain.height - Tank.DriveBaseWidth);
		teleportActive = false;
		gamePlane.style.cursor = "auto";
	}
}