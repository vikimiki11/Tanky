let selectedTerrain;
let generateCaves;
let game;
const windJump = 0.025;
const windMax = 50;
function selectTerrain(terrain/* undefined: try to fatch it, 0:random, 1:mountains, 2: forest, 3:desert */, caves/* undefined: try to fatch it, 0:no, 1:yes */, players = parseInt(document.querySelector("#playerCount").value)) {
	if(terrain === undefined) {
		for(let element of document.querySelectorAll("input[name='terrain']")) {
			if(element.checked) {
				terrain = element.value;
				break;
			}
		}
	}
	selectedTerrain = parseInt(terrain);

	const checkboxQS = "#setupBasic > div > input[type=checkbox]"
	if (caves === undefined && document.querySelector(checkboxQS)) caves = document.querySelector(checkboxQS).checked;
	generateCaves = caves;

	maxPlayers = players;

	return [terrain, caves];
}









class Game {
	constructor(players, terrain, caves) {
		this.players = players;
		this.terrainSettings = terrain;
		this.cavesSettings = caves;
		this._actualPlayerID = -1;
		this.blockControls = false;
		this.windSeed = Math.random();
		this._windStep = 0;
		this.windCurrent = 0;
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
	set windStep(step) {
		this._windStep = step;

		noise.seed(this.windSeed);
		this.windCurrent = noise.simplex2(this.windStep * windJump, 1000) * windMax;
		document.querySelector("#windCurrent").innerHTML = Math.abs(Math.round(this.windCurrent));
	}
	get windStep() {
		return this._windStep;
	}

	start() {
		this.windSeed = Math.random();
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
		this.windStep = this.windStep + 1;
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

