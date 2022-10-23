let selectedTerrain;
let generateCaves;
let game;
const windJump = 0.125;
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


	let multiplayer = 160;
	ter = new Terrain(16 * multiplayer, Math.round(9 / 25 * 21 * multiplayer), selectedTerrain);
	ter.generate();

	return [terrain, caves];
}








class Game {
	constructor(players, terrain, caves) {
		this.players = players;
		this.terrainSettings = terrain;
		this.cavesSettings = caves;
		this._actualPlayerID = -1;
		this.blockControls = true;
		this.windSeed = Math.random();
		this._windStep = 0;
		this.windCurrent = 0;
	}
	set actualPlayerID(id) {
		if (this.actualPlayer) this.actualPlayer.selected = false;
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
		document.querySelector("#windDirection").innerHTML = this.windCurrent > 0 ? "↪" : "↩";
	}
	get windStep() {
		return this._windStep;
	}

	start() {
		this.windSeed = Math.random();
		this.spawnTanks();
		this.nextPlayer();
		switchScreen("gameScreen");
		setTimeout(this.spawnTanks, switchScreen());
		for (let i = 0; i < 6; i++){
			generateCloud(Math.floor(Math.random() * 2560));
		}
	}

	end() {
		switchScreen("shopScreen");
		this.blockControls = true;
	}

	shopNextPlayer() {
		this.actualPlayerID++;
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
		game.setAim(player.tank.aim);
		game.setFirePower(player.tank.firePower);
	}

	setFirePower(power) {
		power = Math.min(parseFloat(power), this.actualPlayer.tank.maxFirePower);
		power = Math.max(power, 0);
		this.actualPlayer.tank.firePower = power;
		document.querySelector("#firePowerControll input").value = power;
		this.actualPlayer.updateCSS();
	}

	setAim(angle) {
		angle = Math.min(parseFloat(angle), 180);
		angle = Math.max(angle, 0);
		this.actualPlayer.tank.aim = angle;
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
		//ToDo:FIRE
		this.nextPlayer();
	}
}

