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
	if (game.actualPlayer.gadget[4] > 0 && game.actualPlayer.tank.maxFirePower < 100) {
		game.actualPlayer.gadget[4]--;
		game.actualPlayer.tank.maxFirePower = Math.min(game.actualPlayer.tank.maxFirePower + 20, 100);
		game.actualPlayer.updateCSS();
	}
}
function fuel() {
	if (game.actualPlayer.gadget[5] >= 50) {
		game.actualPlayer.gadget[5] -= 50;
		game.actualPlayer.tank.fuel += 50;
		game.actualPlayer.updateCSS();
	}
}