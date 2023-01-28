class Tank {
	static DriveBaseWidth = 65;
	static TankHeight = 25;
	static TankHeadWidth = 25 / 175 * 250;
	static TankHeadHeight = 25 / 175 * 75;

	constructor(player, x) {
		this.player = player;
		this._aim = 20 / 180 * PI;
		this.rotate = 0;
		this.firePower = 100;
		this._maxFirePower = 100;
		this.fuel = 200;
		this.x = x || random() * 2000 + 200;
		this.y = 800;
		this.onGround = false;
		this.inertia = [0, 0];
		this.shield = 0;
		this.parachute = true;
		this.spawn();
	}
	get aim() {
		return this._aim;
	}
	set aim(value) {
		this._aim = value;
		document.querySelector("#aimControl").value = value;
	}
	set aimFast(value) {
		this._aim = value;
	}
	get maxFirePower() {
		return this._maxFirePower;
	}
	set maxFirePower(value) {
		this._maxFirePower = value;
		this.firePower = min(this.firePower, value);
	}
	get cannonBase() {
		return [
			this.x + 25 / 6 * 5 * -sin(this.rotate),
			this.y + 25 / 6 * 5 * cos(this.rotate)
		];
	}
	get cannonAngle() {
		return this.rotate - this.aim + PI;
	}
	get cannonTip() {
		let base = this.cannonBase;
		let width = (25 * 9 / 3.5) * 0.4;
		return [
			base[0] + width * cos(this.cannonAngle),
			base[1] + width * sin(this.cannonAngle)
		];
	}
	get CSS() {
		return `
	#tank${this.player.id} {
		--tankColor: ${this.player.color};
		--tankAim: ${this._aim}rad;
		transform: translate(-50%, 0) rotate(${-this.rotate}rad);
		left: ${this.x}em;
		bottom: ${this.y}em;
		--shieldColor: ${shieldGradient(this.shield)};
	}
	${this.parachute ?
				`#tank${this.player.id} .parachute{
		display: block;
	}`: ""
			}`;
	}
	get groundContactPlane() {
		const DriveBaseWidth = Tank.DriveBaseWidth;
		const Precision = 128 / 65;
		let groundContactPlane = new Array(DriveBaseWidth);
		let distanceDifference = cos(this.rotate);
		let heightDifference = sin(this.rotate);
		let left = { under:false, on:false, above:false };
		let right = { under: false, on: false, above: false };
		let x = 0, y = 0;
		for (let i = round(DriveBaseWidth * Precision / -2); i < round(DriveBaseWidth * Precision / 2); i++) {
			x = this.x + (i + 0.5) / Precision * distanceDifference;
			y = this.y + i / Precision * heightDifference;
			let distanceFromGround = terrain.distanceFromGround(x, y);
			let direction;
			if (i < 0) {
				direction = left;
			} else {
				direction = right;
			}
			if (distanceFromGround > 0) {
				direction.under = true;
			} else if (distanceFromGround == 0) {
				direction.on = true;
			} else {
				direction.above = true;
			}
			let distance = (i + 0.5) / Precision;
			groundContactPlane[i] = { distanceFromGround, x, y, distance, position: i };
		}
		left.wholeUnder = !left.on && !left.above;
		right.wholeUnder = !right.on && !right.above;
		left.wholeAbove	= !left.on && !left.under;
		right.wholeAbove = !right.on && !right.under;
		return {plane:groundContactPlane, left, right, Precision};

	}
	get sideContactPlane() {
		let ret = { left: new Array(Tank.TankHeight), right: new Array(Tank.TankHeight), leftSpaceInGround: 0, rightSpaceInGround: 0, leftWall: false, rightWall: false };
		for (let height = 0; height < Tank.TankHeight; height++) {
			for (let side = -Tank.DriveBaseWidth / 2 - 2; side < Tank.DriveBaseWidth; side += Tank.DriveBaseWidth + 4) {
				let rotated = rotateAroundPoint(side, height, this.rotate, 0, 0);
				let x = rotated[0] + this.x;
				let y = rotated[1] + this.y;
				let collision = terrain.checkCollision(x, y);
				ret[side < 0 ? "left" : "right"][height] = {height, x, y, collision };
				if (collision && height == ret[side < 0 ? "leftSpaceInGround" : "rightSpaceInGround"]) {
					ret[side < 0 ? "leftSpaceInGround" : "rightSpaceInGround"]++;
				}
				else {
					if (collision && height > ret[side < 0 ? "leftSpaceInGround" : "rightSpaceInGround"] + 2)
						ret[side < 0 ? "leftWall" : "rightWall"] = height;
				}
			}
		}
		return ret;
	}
	spawn() {
		let DOM = document.createElement("div");
		DOM.className = "tank";
		DOM.id = "tank" + this.player.id;
		DOM.innerHTML = `
	<img src="img/gadget/parachute.png" class="parachute">
	<svg viewBox="0 0 450 175">
		<!-- bottom part -->
		<circle cx="50" cy="125" r="50" stroke-width="0" fill="black" />
		<rect x="50" y="75" width="350" height="100" style="fill:black;stroke-width:0" />
		<circle cx="400" cy="125" r="50" stroke-width="0" fill="black" />
		<!-- top part -->
		<polygon points="75,75 375,75 325,0 125,0" />
		Sorry, your browser does not support inline SVG.
	</svg>
	<div class="cannon"></div>
	<div class="tankShield"></div>`
		document.querySelector("#gamePlane").appendChild(DOM);
	}
	destroy() {
		tankExplosionSoundController.play();
		explosionAnimation([this.cannonBase[0], this.cannonBase[1]], 100);
		document.querySelector("#gamePlane #tank" + this.player.id)?.remove();
		this.player.tank = null;
		if (this.player == game.actualPlayer && !game.blockControls) {
			game.nextPlayer();
		}
		game.checkGameOver();
	}
	tick() {
		this.checkOutOfMap();
		this.groundCollision();
		//Gravity and null inertia

		if (this.parachute) {
			this.rotate *= 0.98;
			this.inertia[0] += game.windCurrent / 6000;
		}
		this.x += this.inertia[0];
		this.y += this.inertia[1];
		if (!this.onGround) {
			this.inertia[1] -= 0.1;
		} else {
			this.inertia[0] = 0;
			this.inertia[1] = 0;
		}
	}
	fire() {
		if (game.blockControls && !ignoreBlockControl) return;
		game.blockControls = true;
		fireSoundController.play();
		if (GlobalInventory[ammoList[this.player.selectedAmmo].shortName].use()) {
			ammoList[this.player.selectedAmmo].fire()
				.then(() => { game.nextPlayer() });
			this.player.firstRound = false;
		}
	}
	damage(damage) {
		this.shield -= damage;
		let startHP = this.maxFirePower + this.shield;
		if (this.shield < 0) {
			this.shield *= 0.96 ** this.player.inventory["armorUpgrade"];
			this._maxFirePower += this.shield;
			this.shield = 0;
		}
		if (this.maxFirePower <= 0) {
			if (game.actualPlayer != this.player) startHP += 50;
			this.destroy();
		}
		if (game.actualPlayer != this.player) {
			return startHP - (this.maxFirePower + this.shield);
		} else {
			return 0;
		}
	}
	drive(x) {
		if (game.blockControls && !ignoreBlockControl) return;
		if (this.onGround) {
			if (this.fuel > 0 || infinityGadgetsAndAmmoCheck) {
				if (!infinityGadgetsAndAmmoCheck) this.fuel -= 0.5;
				this.inertia[0] = x * cos(this.rotate) * (1.5 ** this.player.inventory["engineUpgrade"]);
				this.inertia[1] = x * sin(this.rotate) * (1.5 ** this.player.inventory["engineUpgrade"]);
			}
		}
		this.checkSideCollision();
		this.checkClimb();
	}
	getCurrentProjectileLandLocation() {
		let aimVector = new Vector();
		let XYVector = [this.cannonTip[0], this.cannonTip[1], aimVector]
		let projectile = new FlyingProjectile(XYVector, undefined, undefined, true);
		while (!projectile.tick()) { }
		return [projectile.x, projectile.y, projectile.vector];
	}
	setFirePower(power) {
		if (game.blockControls && !ignoreBlockControl) return;
		power = min(parseFloat(power), this.maxFirePower);
		power = max(power, 0);
		this.firePower = power;
		document.querySelector("#firePowerControl input").value = power;
	}
	setAim(angle) {
		if (game.blockControls && !ignoreBlockControl) return;
		angle = min(parseFloat(angle), PI);
		angle = max(angle, 0);
		this.aim = angle;
		document.querySelector("#aimControl").value = angle;
	}
	checkCollision(x, y) {
		let dx = x - this.x;
		let dy = y - this.y;
		let distance = pythagoras([dx, dy]);
		if (distance > Tank.DriveBaseWidth) return false;

		//vypočítání pozice vůči tanku
		let rotatedX = dx * cos(this.rotate) + dy * sin(this.rotate);
		let rotatedY = dx * -sin(this.rotate) + dy * cos(this.rotate);

		if (rotatedY > 0 && rotatedY < Tank.TankHeight) {
			if (abs(rotatedX) < Tank.TankHeadWidth / 2) return true;
			if (rotatedY < Tank.TankHeight - Tank.TankHeadHeight &&
				abs(rotatedX) < Tank.DriveBaseWidth / 2) return true;
		}
		return false;
	}





	checkSideCollision() {
		let sideContactPlane = this.sideContactPlane;
		const MaxDrivableTerrain = 5 + this.player.inventory.climbUpgrade / 3;
		for (let i of [
			{ side: "leftSpaceInGround", wall: "leftWall", check: (x) => { return x < 0 } },
			{ side: "rightSpaceInGround", wall: "rightWall", check: (x) => { return x > 0 } }
		]) {
			if (sideContactPlane[i.side] > MaxDrivableTerrain || sideContactPlane[i.wall]) {
				if (i.check(this.inertia[0]))
					this.inertia = [0, 0];
				if (sideContactPlane[i.wall])
					console.log("wall");
				if (sideContactPlane[i.side] > MaxDrivableTerrain)
					console.log("steep");
			}
		}
	}
	checkClimb() {
		const MaxAngleToDrive = 0.7 + this.player.inventory.climbUpgrade / 20;
		if (this.rotate * Math.sign(this.inertia[0]) > MaxAngleToDrive) {
			this.inertia = [0, 0];
			console.log("max Angle");
		}
	}
	checkOutOfMap() {
		if (this.x < 0 + Tank.DriveBaseWidth / 2) {
			this.x = Tank.DriveBaseWidth / 2 + 1;
			this.inertia[0] = 0;
		} else if (this.x > terrain.width - Tank.DriveBaseWidth / 2) {
			this.x = terrain.width - Tank.DriveBaseWidth / 2 - 1;
			this.inertia[0] = 0;
		}
		if (this.y < 0) {
			this._maxFirePower = 0;
			this.destroy();
		}
	}
	groundCollision() {
		let groundContact = this.groundContactPlane;




		//Move from underground
		while (groundContact.left.under || groundContact.right.under) {
			this.y += cos(this.rotate);
			this.x += -sin(this.rotate);
			groundContact = this.groundContactPlane;
		}



		//open parachute and fall damage
		if (groundContact.left.on || groundContact.right.on) {
			//Touches ground
			this.onGround = true;
			if (!this.parachute) {
				let speed = pythagoras(this.inertia);
				let damage = Math.max(0, (speed - 3) * 10);
				if (damage > 0) this.damage(damage);
			}
			this.parachute = false;
		} else {
			//In air
			this.onGround = false;
			let speed = pythagoras(this.inertia);
			if (speed > 3 && !this.parachute) useParachute(this);
			if (this.parachute) this.inertia[1] = -3;
			return;
		}




		//Rotate
		if (!(groundContact.left.on && groundContact.right.on)) {
			let side = groundContact.left.on ? -1 : 1;
			let groundContactIndex = -0.5 + side / 2;
			while (groundContact.plane[groundContactIndex]?.distanceFromGround != 0)
				groundContactIndex += side;

			let maxAngleToRotate = Infinity;
			const anchorPoint = groundContact.plane[groundContactIndex];
			for (let i = groundContactIndex - side; groundContact.plane[i]; i -= side) {
				let x = groundContact.plane[i].x - anchorPoint.x;
				let y = groundContact.plane[i].y - anchorPoint.y;
				let distanceToGround = groundContact.plane[i].distanceFromGround;
				let angleToRotate = atan2(y + distanceToGround, x) - this.rotate;
				maxAngleToRotate = min(maxAngleToRotate, abs(angleToRotate));
			}

			let angleToRotate = side * min(0.05, maxAngleToRotate)
			let newPosition = rotateAroundPoint(this.x, this.y, angleToRotate, anchorPoint.x, anchorPoint.y);
			this.x = newPosition[0];
			this.y = newPosition[1];
			this.rotate += angleToRotate;
		}
	}
}