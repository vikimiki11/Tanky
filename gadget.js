gadgetIDCounter = 0;
class Gadget {
	constructor(name, shortName, defaultAmount, cost, buyAmount, onUse) {
		this.id = gadgetIDCounter++;
		this.name = name;
		this.shortName = shortName;
		this.img = "img/gadget/" + shortName + ".png";
		this.defaultAmount = defaultAmount;
		this.cost = cost;
		this.buyAmount = buyAmount;
		this.use = onUse;
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
gadgetList.push(new Gadget("Weak shield", "weakShield", 8, 5000, 2, console.log))
gadgetList.push(new Gadget("Shield", "shield", 8, 10000, 1, console.log))
gadgetList.push(new Gadget("Strong shield", "strongShield", 8, 15000, 1, console.log))
gadgetList.push(new Gadget("Super shield", "superShield", 8, 20000, 1, console.log))
gadgetList.push(new Gadget("Repair kit", "repairKit", 8, 20000, 1, console.log))
gadgetList.push(new Gadget("Fuel", "fuel", 200, 2000, 50, console.log))
gadgetList.push(new Gadget("Parachute", "parachute", 8, 20000, 1, console.log))
gadgetList.push(new Gadget("Teleport", "teleport", 8, 20000, 1, console.log))



for (let gadget of gadgetList) {
	let html = gadget.html;
}