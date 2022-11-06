let selectedTerrain;
let generateCaves;
let game;
const windJump = 0.125;
const windMax = 50;
let terrain;
function selectTerrain(terrainType/* undefined: try to fatch it, 0:random, 1:mountains, 2: forest, 3:desert */, caves/* undefined: try to fatch it, 0:no, 1:yes */, players = parseInt(document.querySelector("#playerCount").value)) {
	if(terrainType === undefined) {
		for(let element of document.querySelectorAll("input[name='terrain']")) {
			if(element.checked) {
				terrainType = element.value;
				break;
			}
		}
	}
	selectedTerrain = parseInt(terrainType);

	const checkboxQS = "#setupBasic > div > input[type=checkbox]"
	if (caves === undefined && document.querySelector(checkboxQS)) caves = document.querySelector(checkboxQS).checked;
	generateCaves = caves;

	maxPlayers = players;


	let multiplayer = 160;
	terrain = new Terrain(16 * multiplayer, round(9 / 25 * 21 * multiplayer), selectedTerrain);
	terrain.generate();
}








class Game {
	constructor(players, terrain, caves) {
		this.players = players;
		this.terrainSettings = terrain;
		this.cavesSettings = caves;
		this._actualPlayerID = -1;
		this.blockControls = true;
		this.windSeed = random();
		this._windStep = 0;
		this.windCurrent = 0;
		setTimeout(() => { setInterval(() => { game.tick() }, 1000 / 60) },100);
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
		document.querySelector("#windCurrent").innerHTML = abs(round(this.windCurrent));
		document.querySelector("#windDirection").innerHTML = this.windCurrent > 0 ? "↪" : "↩";
	}
	get windStep() {
		return this._windStep;
	}

	start() {
		this.windSeed = random();
		this.spawnTanks();
		this.nextPlayer();
		switchScreen("gameScreen");
		for (let i = 0; i < 6; i++){
			generateCloud(floor(random() * terrain.width));
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
			player.tank.spawn();
		}
		this.tankCSS();
	}

	nextPlayer() {
		game.windStep = game.windStep + 1;
		game.actualPlayerID++;
		let player = game.actualPlayer;
		game.setAim(player.tank.aim);
		game.setFirePower(player.tank.firePower);
		document.querySelector("#gameTopBar .tank").id = "tank" + player.id;
	}

	setFirePower(power) {
		power = min(parseFloat(power), this.actualPlayer.tank.maxFirePower);
		power = max(power, 0);
		this.actualPlayer.tank.firePower = power;
		document.querySelector("#firePowerControll input").value = power;
		this.actualPlayer.updateCSS();
		this.tankCSS();
	}

	setAim(angle) {
		angle = min(parseFloat(angle), PI);
		angle = max(angle, 0);
		this.actualPlayer.tank.aim = angle;
		document.querySelector("#aimControll").value = angle;
		this.actualPlayer.updateCSS();
		this.tankCSS();
	}

	tankDrive(x) {
		/* if (this.blockControls) return; */
		this.actualPlayer.tank.drive(x);
		this.tankCSS();
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
		if (this.actualPlayer.ammo[this.actualPlayer.selectedAmmo] <= 0 && !infinityGadgetsAndAmmoCheck) return;
		if (!infinityGadgetsAndAmmoCheck)this.actualPlayer.ammo[this.actualPlayer.selectedAmmo]--;
		ammoList[this.actualPlayer.selectedAmmo].fire()
			.then(this.nextPlayer);
	}

	tankCSS() {
		let CSS = "";
		for (let playerID in this.players) {
			let player = this.players[playerID];
			CSS += player.tank.CSS;
		}
		document.querySelector("#tankStyle").innerHTML = CSS;
	}

	tick() {
		for (let playerID in this.players) {
			let player = this.players[playerID];
			player.tank.tick();
		}
		this.tankCSS();

		let projectile = 0;
		while (projectiles[projectile]) {
			projectiles[projectile].tick();
			if (projectiles[projectile].end)
				projectiles.splice(projectile, 1);
			else
				projectile++;
		}

	}
}