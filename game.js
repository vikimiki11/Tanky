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
		}`;
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
		game = setupGame(players, selectedTerrain, generateCaves);
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
		this.nextPlayer();
		this.blockControls = true;
		switchScreen("gameScreen");
		setTimeout(this.spawnTanks, switchScreen());
	}

	spawnTanks() {

	}

	nextPlayer() {
		this.actualPlayerID++;
		document.querySelector("#playerName").innerHTML = this.actualPlayer.name;

	}
}
function setupGame(players, terrain, caves) {
	return new Game(players, terrain, caves);
}
function setFirePower(power) {
	document.querySelector("#firePowerControll").value = power;
	game.pla
}