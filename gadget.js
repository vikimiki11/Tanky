class Gadget extends InventoryItem {
	static gadgetIDCounter = 0;
	constructor(name, shortName, defaultAmount, cost, buyAmount) {
		super(name, shortName, "img/gadget/" + shortName + ".png", defaultAmount, cost, buyAmount, "gadget", Gadget);
		this.id = Gadget.gadgetIDCounter++;
	}
}
gadgetList = [];
new Gadget("Weak shield", "weakShield", 8, 5000, 2);
new Gadget("Shield", "shield", 8, 10000, 1);
new Gadget("Strong shield", "strongShield", 8, 15000, 1);
new Gadget("Super shield", "superShield", 8, 20000, 1);
new Gadget("Repair kit", "repairKit", 8, 20000, 1);
new Gadget("Fuel", "fuel", 200, 2000, 50);
new Gadget("Parachute", "parachute", 8, 20000, 1);
new Gadget("Teleport", "teleport", 8, 20000, 1);
new Gadget("Firepower upgrade", "firePowerUpgrade", 0, 5000, 1);
new Gadget("Armor upgrade", "armorUpgrade", 0, 5000, 1);
new Gadget("Engine upgrade", "engineUpgrade", 0, 5000, 1);
new Gadget("Climb upgrade", "climbUpgrade", 0, 5000, 1);

function repairKit() {
	if (game.blockControls && !ignoreBlockControl) return;
	if (game.actualPlayer.tank.maxFirePower < 100 && GlobalInventory["repairKit"].use()) {
		game.actualPlayer.tank.maxFirePower = game.actualPlayer.tank.maxFirePower + 20;
	}
}
function fuel() {
	if (game.blockControls && !ignoreBlockControl) return;
	if (GlobalInventory["fuel"].use(50)) {
		game.actualPlayer.tank.fuel += 50;
	}
}

let teleportActive = false;
const gamePlane = document.querySelector("#gamePlane");
gamePlane.addEventListener("click", teleportClick);
function teleport() {
	if (game.blockControls && !ignoreBlockControl) return;
	if (!teleportActive && GlobalInventory["teleport"].use()) {
		game.blockControls = true;
		gamePlane.style.cursor = "crosshair";
		teleportActive = true;
	}
}
function teleportClick(e) {
	if (teleportActive) {
		teleportSound.play();
		game.blockControls = false;
		game.actualPlayer.tank.x = e.layerX / gamePlane.clientWidth * terrain.width;
		game.actualPlayer.tank.y = min((1 - (e.layerY / gamePlane.clientHeight)) * terrain.height, terrain.height - Tank.DriveBaseWidth);
		game.actualPlayer.tank.rotate = 0;
		teleportActive = false;
		gamePlane.style.cursor = "auto";
	}
}

const shieldColorLevels = [0, 100, 200, 400, 800];
const shieldLevelNames = ["", "weakShield", "shield", "strongShield", "superShield"];
function shield(level) {
	if ((game.blockControls && !ignoreBlockControl) || game.actualPlayer.tank.shield >= shieldColorLevels[shieldColorLevels.length - 1]) return;
	if (GlobalInventory[shieldLevelNames[level]].use()) {
		game.actualPlayer.tank.shield += shieldColorLevels[level];
		game.actualPlayer.tank.shield = Math.min(game.actualPlayer.tank.shield, shieldColorLevels[shieldColorLevels.length - 1]);
	}
}
function shieldGradient(shieldHP) {
	const colors = [[255, 255, 0, 0], [255, 255, 0, 0.8], [0, 187, 255, 0.8], [0, 0, 255, 0.8], [128, 0, 128, 0.8]];
	let level = 0;
	while (shieldHP > shieldColorLevels[level + 1]) level++;
	let distanceFromColor = (shieldHP - shieldColorLevels[level]) / (shieldColorLevels[level + 1] - shieldColorLevels[level]);
	let color = [...colors[level]];
	for (let i = 0; i <= 3; i++)
		color[i] = color[i] + (colors[level + 1][i] - color[i]) * distanceFromColor;
	return "rgba(" + color.join(", ") + ")";
}

function useParachute(tank) {
	if (GlobalInventory["parachute"].use(1, tank.player)) {
		tank.parachute = true;
	}
}