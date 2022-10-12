let selectedTerrain;
let generateCaves;
let players = [];
let maxPlayers;
let game;
function selectTerrain(terrain/* undefined: try to fatch it, 0:random, 1:mountains, 2: forest, 3:desert */, caves/* undefined: try to fatch it, 0:no, 1:yes */, players = parseInt(document.querySelector("#playerCount").value)) {
	if(terrain === undefined) {
		for(let element of document.querySelectorAll("input[name='terrain']")) {
			if(element.checked) {
				terrain = element.value;
				break;
			}
		}
	}
	selectedTerrain = terrain;

	const checkboxQS = "#setupBasic > div > input[type=checkbox]"
	if (caves === undefined && document.querySelector(checkboxQS)) caves = document.querySelector(checkboxQS).checked;
	generateCaves = caves;

	maxPlayers = players;

	return [terrain, caves];
}




class Player {
	constructor(id, name, color, AI) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.AI = AI;
		this.money = 1000;
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
		if(this.selected) {
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

		${this.tank?`:root{
			--aim: ${this.tank.aim};
			--firePower: ${this.tank.firePower};
		}

		#playerName{
			color: ${this.color};
		}

		`: ""
			}`;
		for (let ammo in this.ammo) {
			document.querySelector("style#playerStyle").innerHTML += `
		.ammoRow.ammo${ammo} > .ammoAmount::after, .${ammoList[ammo].shortName}DisplayAfter::after{
			content: "${this.ammo[ammo] == "Infinity"?"Inf.":this.ammo[ammo]}";
		}`;
		}
		for (let gadget in this.gadget) {
			document.querySelector("style#playerStyle").innerHTML += `
		.${gadgetList[gadget].shortName}DisplayAfter::after{
			content: "${this.gadget[gadget] == "Infinity" ?"Inf.":this.gadget[gadget]}";
		}`;
		}
	}
}

function addPlayer(name, color, AI) {
	if (name === undefined) name = document.querySelector("#playerNameInput").value;
	if (color === undefined) color = document.querySelector("#playerColorInput").value;
	if (AI === undefined) AI = document.querySelector("#AICheckbox").checked;

	players.push(new Player(players.length, name, color, AI));

	if (maxPlayers > players.length) {
		document.querySelector("#playerNameInput").value = "";
		document.querySelector("#playerColorInput").value = "#000000";
		document.querySelector("#setupPlayer  h2").innerHTML = (players.length + 1) + ". Hráč";
	} else {
		game = new Game(players, selectedTerrain, generateCaves);
		console.log(game);
		game.start()
	}

	return players[players.length - 1];
}




class Game {
	constructor(players, terrain, caves) {
		this.players = players;
		this.terrain = terrain;
		this.caves = caves;
		this._actualPlayerID = -1;
		this.blockControls = false;
	}
	set actualPlayerID(id) {
		if (this.actualPlayer)this.actualPlayer.selected = false;
		if (id >= this.players.length) {
			this._actualPlayerID = 0
		} else {
			this._actualPlayerID = id;
		};
		this.actualPlayer.selected = true;
	}
	get actualPlayerID() {
		return this._actualPlayerID;
	}
	get actualPlayer() {
		return this.players[this.actualPlayerID];
	}

	start() {
		this.spawnTanks();
		this.nextPlayer();
		this.blockControls = true;
		switchScreen("gameScreen");
		setTimeout(this.spawnTanks, switchScreen());
	}

	spawnTanks() {
		for (let playerID in this.players) {
			let player = this.players[playerID];
			player.tank = new Tank(player);
		}
	}

	nextPlayer() {
		this.actualPlayerID++;
		let player = this.actualPlayer;
		document.querySelector("#playerName").innerHTML = player.name;
		game.setAim(player.tank.aim)
		document.querySelector("#firePowerControll input").value = player.tank.firePower;
	}

	setFirePower(power) {
		this.actualPlayer.tank.firePower = parseFloat(power);
		document.querySelector("#firePowerControll input").value = power;
		this.actualPlayer.updateCSS();
	}

	setAim(angle) {
		this.actualPlayer.tank.aim = parseFloat(angle);
		document.querySelector("#aimControll").value = angle;
		this.actualPlayer.updateCSS();
	}

	nextAmmo() {
		do {
			this.actualPlayer.selectedAmmo++;
			if (this.actualPlayer.selectedAmmo >= ammoList.length) this.actualPlayer.selectedAmmo = 0;
		} while (this.actualPlayer.ammo[this.actualPlayer.selectedAmmo] <= 0);
	}

	previousAmmo() {
		do {
			this.actualPlayer.selectedAmmo--;
			if (this.actualPlayer.selectedAmmo < 0) this.actualPlayer.selectedAmmo = ammoList.length - 1;
		} while (this.actualPlayer.ammo[this.actualPlayer.selectedAmmo] <= 0);
	}

	fire() {
		
	}
}

class Tank {
	constructor(player) {
		this.player = player;
		this.aim = 0;
		this.firePower = 0;
		this.x = 0;
		this.y = 0;
	}
}