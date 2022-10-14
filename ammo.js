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
ammoList.push(new Ammo("Small missile", "smallMissile", "smallMissile.png", Infinity, 1000, 10, console.log))
ammoList.push(new Ammo("Missile", "missile", "missile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("1", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("2", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("3", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("4", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("5", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("6", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("7", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("8", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("9", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("10", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("11", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("12", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("13", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("14", "xd", "smallMissile.png", 0, 1000, 10, console.log))
ammoList.push(new Ammo("15", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("16", "xd", "smallMissile.png", 10, 1000, 10, console.log))
ammoList.push(new Ammo("17", "xd", "smallMissile.png", 10, 1000, 10, console.log))




for(let ammo of ammoList) {
	let html = ammo.html;
	document.querySelector("#selectedAmmo").innerHTML += html;
	document.querySelector("#allAmmo").innerHTML += html;
}

for (let el of document.querySelectorAll("#allAmmo .ammoRow")) {
	el.addEventListener("click", function() {
		game.actualPlayer.selectedAmmo = el.getAttribute("ammo");
	});
}