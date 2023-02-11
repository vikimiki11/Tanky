class Demo {
	constructor(terrain, AIs) {
		this.terrain = terrain;
		this.players = [];
		for (let i = 0; i < AIs.length; i++) {
			this.players.push(new Player(i, "AI", DefaultTanksColors[i], AIs[i]));
		}
		this._actualPlayerID = -1;
		this.blockControls = true;
		this.windSeed = random();
		this._windStep = 0;
		this.windCurrent = 0;
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
	}
	get windStep() {
		return this._windStep;
	}







	start() {
		this.inGame = true;
		this.windSeed = random();
		this.spawnTanks();
		this.nextPlayer();
		terrain.generate();
		for (let i = 0; i < 6; i++) {
			generateCloud(floor(random() * terrain.width));
		}
		for (let player in this.players) {
			this.players[player].firstRound = true;
		}
		this.tick();
		this.intervalID = setInterval((game) => { game.tick() }, 1000 / 60, this);
		windSound.play();
	}

	end(removeDOM) {
		clearInterval(this.intervalID);
		if (removeDOM) {
			setTimeout(() => {
				document.querySelectorAll("#gamePlane .tank").forEach((tank) => { tank.remove() });
				removeProjectiles();
			}, 1000)
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
		setTimeout((AILevel) => {
			AI.autoAim(AILevel);
		}, 1000 + max(switchScreen(), 0), this.actualPlayer.AI);
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
			player.tank = new Tank(player, x);
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

	nextAmmo() {}
	previousAmmo() {}

	fire() {
		this.actualPlayer.tank?.fire();
	}

	setFirePower(power) {
		this.actualPlayer.tank?.setFirePower(power);
	}

	setAim(angle) {
		this.actualPlayer.tank?.setAim(angle);
	}
	tankDrive() {}
}