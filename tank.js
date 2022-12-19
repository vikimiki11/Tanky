class Tank {
	static DriveBaseWidth = 65;
	static TankHeight = 25;
	static TankHeadWidth = 25 / 175 * 250;
	static TankHeadHeight = 25 / 175 * 75;

	constructor(player) {
		this.player = player;
		this._aim = 20 / 180 * PI;
		this.rotate = 0;
		this.firePower = 100;
		this._maxFirePower = 100;
		this.fuel = 200;
		this.x = random() * 2000 + 200;
		this.y = 800;
		this.onGround = false;
		this.inertia = [0, 0];
		this.shield = 0;
		this.parachute = true;
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
	damage(damage) {
		this.shield -= damage;
		if (this.shield < 0) {
			this._maxFirePower += this.shield;
			this.shield = 0;
		}
	}
	spawn() {
		const html = `
<div class="tank" id="tank${this.player.id}">
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
	<div class="tankShield"></div>
</div>`
		document.querySelector("#gamePlane").innerHTML += html;
	}
	get CSS() {
		return `
	#tank${this.player.id} {
		--tankColor: ${this.player.color};
		--tankAim: ${this._aim}rad;
		transform: translate(-50%, 0) rotate(${this.rotate}rad);
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
	tick() {
		this.checkOutOfMap();
		let groundContact = this.groundContactPlane;
		function move(tank) {
			if (groundContact.left.under || groundContact.right.under) {
				tank.y += cos(tank.rotate);
				tank.x += sin(tank.rotate);
				groundContact = tank.groundContactPlane;
				console.debug("move");
				return move(tank);
			}




			if (groundContact.left.on || groundContact.right.on) {
				tank.onGround = true;
				if (!tank.parachute) {
					let speed = pythagoras(tank.inertia);
					let damage = Math.max(0, (speed - 3) * 10);
					tank.damage(damage);
				}
				tank.parachute = false;
			} else {
				tank.onGround = false;
				let speed = pythagoras(tank.inertia);
				if (speed > 3 && !tank.parachute) useParachute(tank);
				if (tank.parachute) tank.inertia[1] = -3;
				return;
			}



			
			if (!(groundContact.left.on && groundContact.right.on)) {
				let side = groundContact.left.on ? -1 : 1;
				let i = 0;
				while (groundContact.plane[i]?.distanceFromGround != 0)
					i += side;
				let angleToRotate = -side * 0.05
				let anchorPoint = groundContact.plane[i];
				let newPosition = rotateAroundPoint(tank.x, tank.y, angleToRotate, anchorPoint.x, anchorPoint.y);
				tank.x = newPosition[0];
				tank.y = newPosition[1];
				tank.rotate += angleToRotate;
			}
		}
		move(this);
		if (!this.onGround) {
			this.inertia[1] -= 0.1;
		} else {
			this.inertia[0] = 0;
			this.inertia[1] = 0;
		}
		this.x += this.inertia[0];
		this.y += this.inertia[1];
		if (this.parachute) {
			this.rotate *= 0.98;
			this.inertia[0] += game.windCurrent / 6000;
		}
	}
	checkOutOfMap() {
		if (this.x < 0 + Tank.DriveBaseWidth / 2) {
			this.x = Tank.DriveBaseWidth / 2 + 1;
			this.inertia[0] = 0;
		}else if (this.x > terrain.width - Tank.DriveBaseWidth / 2) {
			this.x = terrain.width - Tank.DriveBaseWidth / 2 - 1;
			this.inertia[0] = 0;
		}
		if (this.y < 0) {
			this._maxFirePower = 0;
			this.destroy();
		}
	}
	get groundContactPlane() {
		const DriveBaseWidth = Tank.DriveBaseWidth;
		const Precision = 128 / 65;
		let groundContactPlane = new Array(DriveBaseWidth);
		let distanceDifference = cos(this.rotate);
		let heightDifference = -sin(this.rotate);
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
	drive(x) {
		if (game.blockControls && !ignoreBlockControl) return;
		if (this.onGround) {
			if (this.fuel > 0 || infinityGadgetsAndAmmoCheck) {
				if (!infinityGadgetsAndAmmoCheck) this.fuel -= 0.5;
				this.inertia[0] = x * cos(this.rotate);
				this.inertia[1] = x * -sin(this.rotate);
				this.x += this.inertia[0];
				this.y += this.inertia[1];
			}
		}
	}
	get cannonBase() {
		return [
			this.x + 25 / 6 * 5 * sin(this.rotate),
			this.y + 25 / 6 * 5 * cos(this.rotate)
		];
	}
	get cannonAngle() {
		return this.rotate + this.aim + PI;
	}
	get cannonTip() {
		let base = this.cannonBase;
		let width = (25 * 9 / 3.5) * 0.4;
		return [
			base[0] + width * cos(this.cannonAngle),
			base[1] + width * -sin(this.cannonAngle)
		];
	}
	controlCollision(x, y) {
		let dx = x - this.x;
		let dy = y - this.y;
		let distance = pythagoras([dx, dy]);
		if (distance > Tank.DriveBaseWidth) return false;

		//vypočítání pozice vůči tanku
		let rotatedX = dx * cos(this.rotate) + dy * -sin(this.rotate);
		let rotatedY = dx * sin(this.rotate) + dy * cos(this.rotate);

		if (rotatedY > 0 && rotatedY < Tank.TankHeight) {
			if (abs(rotatedX) < Tank.TankHeadWidth / 2) return true;
			if (rotatedY < Tank.TankHeight - Tank.TankHeadHeight &&
				abs(rotatedX) < Tank.DriveBaseWidth / 2) return true;
		}
		return false;
	}
	destroy() {
		explosionAnimation([this.cannonBase[0], this.cannonBase[1]], 100);
		document.querySelector("#gamePlane #tank" + this.player.id)?.remove();
		this.player.tank = null;
		if (this.player == game.actualPlayer && !game.blockControls) {
			game.nextPlayer();
		}
	}
	getCurrentProjectileLandLocation() {
		let aimVector = new Vector();
		aimVector.angle = this.cannonAngle;
		aimVector.length = this.firePower / 100 * DefaultAmmoSpeed;
		let projectile = new Projectile(this.cannonTip, aimVector, undefined, undefined, true);
		while (!projectile.tick()) { }
		return [projectile.x, projectile.y, projectile.vector];
	}
	fire() {
		if (game.blockControls && !ignoreBlockControl) return;
		game.blockControls = true;
		if (this.player.ammo[this.player.selectedAmmo] <= 0 && !infinityGadgetsAndAmmoCheck) return;
		if (!infinityGadgetsAndAmmoCheck) this.player.ammo[this.player.selectedAmmo]--;
		ammoList[this.player.selectedAmmo].fire()
			.then(() => { game.nextPlayer() });
		this.player.firstRound = false;
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
}