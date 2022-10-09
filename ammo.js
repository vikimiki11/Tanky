ammoIDCounter = 0;
class Ammo{
	constructor(name, img, defaultAmount, cost, buyAmount, onDestroy, onHit) {
		this.id = ammoIDCounter++;
		this.name = name;
		this.img = "img/ammo/" + img;
		this.defaultAmount = defaultAmount;
		this.cost = cost;
		this.buyAmount = buyAmount;
		this.onHit = onHit;
		this.onDestroy = onDestroy;
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
ammoList.push(new Ammo("Small missile", "smallMissile.png", Infinity, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("Missile", "missile.png", 0, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("1", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("2", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("3", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("4", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("5", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("6", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("7", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("8", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("9", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("10", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("11", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("12", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("13", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("14", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("15", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("16", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("17", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("18", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("19", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("20", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("21", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("22", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("23", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("24", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("25", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("26", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("27", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("28", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("29", "smallMissile.png", 10, 1000, 10, console.log, console.log))
ammoList.push(new Ammo("30", "smallMissile.png", 10, 1000, 10, console.log, console.log))



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