let selectedTerrain;
let generateCaves;
let game;
const windJump = 0.125;
const windMax = 50;
let terrain;
function selectTerrain(terrainType/* undefined: try to fetch it, 0:random, 1:mountains, 2: forest, 3:desert */, caves/* undefined: try to fetch it, 0:no, 1:yes */, players = parseInt(document.querySelector("#playerCount").value)) {
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
		this.lastPlayerID = 0;
		this.inGame = false;
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
		this.inGame = true;
		this.windSeed = random();
		this.spawnTanks();
		switchScreen("gameScreen");
		this.nextPlayer();
		for (let i = 0; i < 6; i++){
			generateCloud(floor(random() * terrain.width));
		}
		for (let player in this.players) {
			this.players[player].firstRound = true;
		}
	}

	end() {
		this.inGame = false;
		switchScreen("shopScreen");
		this.blockControls = true;
		for (let p in this.players) {
			this.players[p].money += 5000;
			if (this.players[p].tank) this.players[p].money += 5000;
		}
		if (this.actualPlayer.AI) {
			AI.autoShop(this.actualPlayer.AI);
			this.shopNextPlayer();
		}
		this.globalCSS();
		setTimeout(() => {
			document.querySelector("#gamePlane .tank")?.remove();
			removeProjectiles();
			terrain.generate();
		}, switchScreen());
	}

	shopNextPlayer() {
		this.actualPlayerID++;
		if (this.lastPlayerID == this.actualPlayerID)
			this.start();
		else {
			if (this.actualPlayer.AI) {
				AI.autoShop(this.actualPlayer.AI);
				this.shopNextPlayer();
			}
		}
	}

	spawnTanks() {
		for (let playerID in this.players) {
			let player = this.players[playerID];
			player.tank = new Tank(player);
			player.tank.spawn();
		}
		this.globalCSS();
	}

	nextPlayer() {
		if (this.inGame) {
			this.lastPlayerID = this.actualPlayerID;
			let alivePlayersCount = 0;
			for (let p in this.players) {
				if (this.players[p].tank) alivePlayersCount++;
			}
			if (alivePlayersCount <= 1) {
				this.end();
				return;
			} else {
				do {
					this.actualPlayerID++;
				} while (!this.actualPlayer.tank);
			}
			this.windStep = this.windStep + 1;

			this.blockControls = false;
			this.setAim(this.actualPlayer.tank?.aim);
			this.setFirePower(this.actualPlayer.tank?.firePower);
			this.blockControls = true;
			
			document.querySelector("#gameTopBar .tank").id = "tank" + this.actualPlayer.id;
			if (this.actualPlayer.AI) {
				setTimeout((AILevel) => {
					AI.autoAim(AILevel);
				}, 3000 + max(switchScreen(), 0), this.actualPlayer.AI);
			} else {
				setTimeout(() => { game.blockControls = false }, switchScreen());
			}
		}
	}

	setFirePower(power) {
		if (this.blockControls && !ignoreBlockControl) return;
		power = min(parseFloat(power), this.actualPlayer.tank?.maxFirePower);
		power = max(power, 0);
		this.actualPlayer.tank.firePower = power;
		document.querySelector("#firePowerControl input").value = power;
		this.actualPlayer.updateCSS();
		this.globalCSS();
	}

	setAim(angle) {
		if (this.blockControls && !ignoreBlockControl) return;
		angle = min(parseFloat(angle), PI);
		angle = max(angle, 0);
		this.actualPlayer.tank.aim = angle;
		document.querySelector("#aimControl").value = angle;
		this.actualPlayer.updateCSS();
		this.globalCSS();
	}

	tankDrive(x) {
		if (this.blockControls && !ignoreBlockControl) return;
		this.actualPlayer.tank.drive(x);
		this.globalCSS();
	}

	nextAmmo() {
		if (this.blockControls && !ignoreBlockControl) return;
		do {
			this.actualPlayer.selectedAmmo++;
			if (this.actualPlayer.selectedAmmo >= ammoList.length) this.actualPlayer.selectedAmmo = 0;
		} while (this.actualPlayer.ammo[this.actualPlayer.selectedAmmo] <= 0);
	}

	previousAmmo() {
		if (this.blockControls && !ignoreBlockControl) return;
		do {
			this.actualPlayer.selectedAmmo--;
			if (this.actualPlayer.selectedAmmo < 0) this.actualPlayer.selectedAmmo = ammoList.length - 1;
		} while (this.actualPlayer.ammo[this.actualPlayer.selectedAmmo] <= 0);
	}

	fire() {
		if (this.blockControls && !ignoreBlockControl) return;
		this.blockControls = true;
		if (this.actualPlayer.ammo[this.actualPlayer.selectedAmmo] <= 0 && !infinityGadgetsAndAmmoCheck) return;
		if (!infinityGadgetsAndAmmoCheck)this.actualPlayer.ammo[this.actualPlayer.selectedAmmo]--;
		ammoList[this.actualPlayer.selectedAmmo].fire()
			.then(() => { this.nextPlayer() });
		this.actualPlayer.firstRound = false;
	}

	globalCSS() {
		let CSS = "";
		for (let playerID in this.players) {
			let player = this.players[playerID];
			CSS += player.tank ? player.tank.CSS : "";
			CSS += player.globalCSS;
		}
		document.querySelector("#globalStyle").innerHTML = CSS;
	}

	tick() {
		for (let playerID in this.players) {
			let player = this.players[playerID];
			player.tank?.tick();
		}
		this.globalCSS();

		let projectile = 0;
		while (projectiles[projectile]) {
			projectiles[projectile].tick();
			if (projectiles[projectile].end)
				projectiles.splice(projectile, 1);
			else
				projectile++;
		}
	}

	checkForTankCollision(x, y) {
		let tankCollision = false;
		for (let i = 0; i < game.players.length; i++) {
			tankCollision = game.players[i].tank?.controlCollision(x, y);
			if (tankCollision) break;
		}
		return tankCollision;
	}
}