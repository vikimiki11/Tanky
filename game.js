let selectedTerrain;
let game;
const windJump = 0.125;
const windMax = 50;
let terrain;
function selectTerrain(terrainType/* undefined: try to fetch it, 0:random, 1:mountains, 2: forest, 3:desert */, players = parseInt(document.querySelector("#playerCount").value)) {
	if(terrainType === undefined) {
		for(let element of document.querySelectorAll("input[name='terrain']")) {
			if(element.checked) {
				terrainType = element.value;
				break;
			}
		}
	}
	selectedTerrain = parseInt(terrainType);

	maxPlayers = players;

	terrain = new Terrain(2560, 1210, selectedTerrain);
	terrain.generate();
}








class Game {
	constructor(players, terrain) {
		this.players = players;
		this.terrainSettings = terrain;
		this._actualPlayerID = -1;
		this.blockControls = true;
		this.windSeed = random();
		this._windStep = 0;
		this.windCurrent = 0;
		this.lastPlayerID = 0;
		this.inGame = false;
		setTimeout((game) => { setInterval((game) => { game.tick() }, 1000 / 60, game) }, 100, this);
	}
	set actualPlayerID(id) {
		if (this.actualPlayer) this.actualPlayer.selected = false;
		if (id >= this.players.length) {
			this._actualPlayerID = 0;
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


		windSound.volume(min(abs(this.windCurrent) / 45, 1));
		if (abs(this.windCurrent) > 45)
			strongWindSound.volume(abs(this.windCurrent) / 5 - 9);
		else
			strongWindSound.volume(0);
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
		windSound.play();
		strongWindSound.play();
	}

	end() {
		this.inGame = false;
		switchScreen("shopScreen");
		this.blockControls = true;
		for (let p in this.players) {
			this.players[p].money += 5000;
			if (this.players[p].tank) this.players[p].money += 5000;
		}
		setTimeout(() => {
			this._actualPlayerID--;
			this.shopNextPlayer(true);
			document.querySelector("#gamePlane .tank")?.remove();
			removeProjectiles();
			terrain.generate();
		}, switchScreen() + 100);
		windSound.pause();
		strongWindSound.pause();
	}

	shopNextPlayer(donCheckStart) {
		this.actualPlayerID++;
		if (!donCheckStart && this.lastPlayerID == this.actualPlayerID)
			this.start();
		else {
			if (this.actualPlayer.AI) {
				AI.autoShop(this.actualPlayer.AI);
				this.shopNextPlayer();
			}
		}
	}

	nextPlayer() {
		if (!this.inGame) return;
		if (this.checkGameOver()) {
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

	checkGameOver() {
		this.lastPlayerID = this.actualPlayerID;
		let alivePlayersCount = 0;
		for (let p in this.players) {
			if (this.players[p].tank) alivePlayersCount++;
		}
		if (alivePlayersCount <= 1) {
			this.end();
			return true;
		}
		return false; 
	}

	spawnTanks() {
		let i = 0;
		let playerListCopy = [...this.players];
		while (i < this.players.length) {
			let playerID = floor(random() * playerListCopy.length);
			if (!playerListCopy[playerID]) continue;
			playerListCopy[playerID] = undefined;

			let player = this.players[playerID];
			let x = terrain.width / this.players.length * (i + random());
			player.tank = new Tank(player, x );
			i++;
		}
	}








	tick() {
		for (let playerID in this.players) {
			let player = this.players[playerID];
			player.tank?.tick();
		}

		let projectile = 0;
		while (projectiles[projectile]) {
			projectiles[projectile].tick();
			if (projectiles[projectile].end)
				projectiles.splice(projectile, 1);
			else
				projectile++;
		}

		this.globalCSS();
		this.actualPlayer.updateCSS();
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

	nextAmmo() {
		this.actualPlayer.nextAmmo();
	}

	previousAmmo() {
		this.actualPlayer.previousAmmo();
	}

	fire() {
		this.actualPlayer.tank?.fire();
	}

	setFirePower(power) {
		this.actualPlayer.tank?.setFirePower(power);
	}

	setAim(angle) {
		this.actualPlayer.tank?.setAim(angle);
	} 	

	tankDrive(x) {
		this.actualPlayer.tank?.drive(x);
	}
}