let players = [];
let maxPlayers;

function addPlayer(name, color, AI) {
	if (name === undefined) name = document.querySelector("#playerNameInput").value;
	if (color === undefined) color = document.querySelector("#playerColorInput").value;
	if (AI === undefined) AI = document.querySelector("#AICheckbox").checked;

	players.push(new Player(players.length, name, color, AI));

	if (maxPlayers > players.length) {
		document.querySelector("#playerNameInput").value = "";
		document.querySelector("#playerColorInput").value = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"][players.length];
		document.querySelector("#setupPlayer  h2").innerHTML = (players.length + 1) + ". Hráč";
	} else {
		game = new Game(players, selectedTerrain, generateCaves);
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
		this.money = 1000000;
		this.tank = null;
		this._selected = false;
		this._selectedAmmo = 0;
		this.ammo = [];
		for (let ammo of ammoList) {
			this.ammo.push(ammo.defaultAmount);
		}
		this.gadget = [];
		for (let gadget of gadgetList) {
			this.gadget.push(gadget.defaultAmount);
		}
	}

	get selected() {
		return this._selected;
	}
	set selected(value) {
		this._selected = value;
		if (value) this.updateCSS();
	}

	get selectedAmmo() {
		return this._selectedAmmo;
	}
	set selectedAmmo(value) {
		this._selectedAmmo = parseInt(value);
		if (this.selected) {
			this.updateCSS();
		}
	}
	updateCSS() {
		document.querySelector("style#playerStyle").innerHTML = `		#selectedAmmo .ammo${this.selectedAmmo} {
			display: grid;
		}
		
		#allAmmo .ammo${this.selectedAmmo} {
			display: none;
		}

		:root{
			--aim: ${Math.round(this.tank.aim*180/Math.PI)};
			--firePower: ${Math.round(this.tank.firePower)};
			--maxFirePower: ${this.tank.maxFirePower};
			--money: "${this.money.toLocaleString()}";
			--color: ${this.color};
			--name: "${this.name}";
			--fuel: "${this.tank.fuel}";
			--tankColor: ${this.color};
			--tankAim: ${this.tank.aim}rad;
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
}