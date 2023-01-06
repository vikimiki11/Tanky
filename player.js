let players = [];
let maxPlayers;

function addPlayer(name, color, AI) {
	if (game) return;
	if (name === undefined) name = document.querySelector("#playerNameInput").value;
	if (color === undefined) color = document.querySelector("#playerColorInput").value;
	if (AI === undefined) {
		for (let element of document.querySelectorAll("input[name='AIDificulty']")) {
			if (element.checked) {
				AI = parseInt(element.value);
				break;
			}
		}
		AI = document.querySelector("#AICheckbox").checked ? AI : false;
	}

	players.push(new Player(players.length, name, color, AI));
	document.querySelector("#scoreDisplay").innerHTML += `
	<div id="score${players.length - 1}">${name}</div>
	<div class="score" id="score${players.length - 1}"></div>`;
	if (maxPlayers > players.length) {
		document.querySelector("#playerNameInput").value = "";
		document.querySelector("#playerColorInput").value = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"][players.length];
		document.querySelector("#setupPlayer  h2").innerHTML = (players.length + 1) + ". Hráč";
		document.querySelector("#AICheckbox").checked = false;
		document.querySelector("#AICheckbox").value = "false";
	} else {
		game = new Game(players, selectedTerrain);
		console.log(game);
		game.start()
	}

	return players[players.length - 1];
}

class Player {
	constructor(id, name, color, AI) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.AI = AI;
		this.money = 0;
		this.score = 0;
		this.tank = null;
		this.selected = false;
		this._selectedAmmo = 0;
		this.ammo = [];
		for (let ammo of ammoList) {
			this.ammo.push(ammo.defaultAmount);
		}
		this.gadget = [];
		for (let gadget of gadgetList) {
			this.gadget.push(gadget.defaultAmount);
		}
		this.firstRound = false;
	}

	get selectedAmmo() {
		return this._selectedAmmo;
	}
	set selectedAmmo(value) {
		this._selectedAmmo = parseInt(value);
	}
	updateCSS() {
		document.querySelector("style#playerStyle").innerHTML = `		#selectedAmmo .ammo${this.selectedAmmo} {
			display: grid;
		}
		
		#allAmmo .ammo${this.selectedAmmo} {
			display: none;
		}

		:root{
${this.tank ?`			--aim: ${round(this.tank.aim * 180 / PI)};
			--firePower: ${round(this.tank.firePower)};
			--maxFirePower: ${this.tank.maxFirePower};
			--fuel: "${round(this.tank.fuel)}";
			--tankAim: ${this.tank.aim}rad;`:""}
			--money: "${floor(this.money).toLocaleString() }";
			--color: ${this.color};
			--name: "${this.name}";
			--tankColor: ${this.color};
		}

		`;
		for (let ammo in this.ammo) {
			document.querySelector("style#playerStyle").innerHTML += `
		.ammoRow.ammo${ammo} > .ammoAmount::after, .${ammoList[ammo].shortName}DisplayAfter::after{
			content: "${this.ammo[ammo] == "Infinity" ? "Inf." : this.ammo[ammo]}";
		}`;
		}
		for (let gadget in this.gadget) {
			document.querySelector("style#playerStyle").innerHTML += `
		.gadgetRow.gadget${gadget} > .gadgetAmount::after, .${gadgetList[gadget].shortName}DisplayAfter::after{
			content: "${this.gadget[gadget] == "Infinity" ? "Inf." : this.gadget[gadget]}";
		}`;
		}
	}
	get globalCSS() {
		return `.score#score${this.id}::after{
			content: "${round(this.score)}";
		}
		#score${this.id}{
			color: ${this.color};
		}`;
	}

	nextAmmo() {
		if (game.blockControls && !ignoreBlockControl) return;
		do {
			this.selectedAmmo++;
			if (this.selectedAmmo >= ammoList.length) this.selectedAmmo = 0;
		} while (this.ammo[this.selectedAmmo] <= 0);
	}

	previousAmmo() {
		if (game.blockControls && !ignoreBlockControl) return;
		do {
			this.selectedAmmo--;
			if (this.selectedAmmo < 0) this.selectedAmmo = ammoList.length - 1;
		} while (this.ammo[this.selectedAmmo] <= 0);
	}
}