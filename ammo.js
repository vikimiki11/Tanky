ammoIDCounter = 0;
class Ammo{
	constructor(name, shortName, img, defaultAmount, cost, buyAmount, fire) {
		this.id = ammoIDCounter++;
		this.name = name;
		this.img = "img/ammo/" + img;
		this.defaultAmount = defaultAmount;
		this.cost = cost;
		this.buyAmount = buyAmount;
		this.fire = fire;
	}
	get html() {
		return `<div class="ammoRow ammo${this.id}" ammo="${this.id}">
					<div class="ammoIcon">
						<img src="${this.img}">
					</div>
					<div class="ammoName">
						${this.name}
					</div>
					<div class="ammoCost">
						${this.cost}
					</div>
					<div class="ammoBuyAmount">
						${this.buyAmount}
					</div>
					<div class="ammoAmount">
					</div>
				</div>`;
	}
}
ammoList = [];
ammoList.push(new Ammo("Small missile", "smallMissile", "smallMissile.png", Infinity, 0, 10, console.log))
ammoList.push(new Ammo("Missile", "missile", "missile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("Volcano Bomb", "volcanoBomb", "volcanoBomb.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("Shower", "shower", "shower.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("Hot Shower", "hotShower", "hotShower.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("004", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("005", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("006", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("007", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("008", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("009", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("010", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("011", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("012", "xd", "smallMissile.png", 0, 1000, 10, console.log))