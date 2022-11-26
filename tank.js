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
		this.x = random()*2000+200;
		this.y = 800;
		this.onGround = false;
		this.inertia = [0, 0];
	}
	get aim() {
		return this._aim;
	}
	set aim(value) {
		this._aim = value;
		document.querySelector("#aimControl").value = value;
		this.player.updateCSS();
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
	}`;
	}
	tick() {
		this.checkOutOfMap();
		if (!this.onGround)this.x += this.inertia[0];
		this.y += this.inertia[1];
		if (!terrain.controlCollision(this.x, this.y)[0]) {
			this.inertia[1] -= 0.1;
			this.onGround = false;
		} else {
			this.onGround = true;
			this.inertia = [0,0];
			do {
				this.y++;
			} while ((terrain.controlCollision(this.x, this.y)[1]));
		}
		let leftTouches;
		let maxRounds = 10;
		do {
			let groundContact = this.groundContactPlane;
			leftTouches = 0;
			for (let i in groundContact.plane) {
				if (parseInt(i) < Tank.DriveBaseWidth / 2) leftTouches += Number(groundContact.plane[i].touch[0]) + Number(groundContact.plane[i].touch[1]);
				else leftTouches -= Number(groundContact.plane[i].touch[0]) + Number(groundContact.plane[i].touch[1]);
			}
			this.rotate += leftTouches / 1000;
			maxRounds--;
		} while (abs(leftTouches)>5 && maxRounds>0);
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
			//ToDo: add explosion
		}
	}
	get groundContactPlane() {
		const DriveBaseWidth = Tank.DriveBaseWidth;
		const Precision = 128 / 60;
		let groundContactPlane = new Array(DriveBaseWidth);
		let distanceDifference = cos(this.rotate);
		let heightDifference = -sin(this.rotate);
		let touch = false;
		let leftTouchGround = false;
		let rightTouchGround = false;
		let leftTouchAboveGround = false;
		let rightTouchAboveGround = false;
		let x = 0, y = 0;
		for (let i = round(DriveBaseWidth * Precision / -2); i < round(DriveBaseWidth * Precision / 2); i++) {
			x = this.x + (i + 0.5) / Precision * distanceDifference;
			y = this.y + i / Precision * heightDifference;
			touch = terrain.controlCollision(x, y);
			if (touch[0]) {
				if (i < 0) {
					leftTouchGround = true;
				} else {
					rightTouchGround = true;
				}
			}
			if (touch[1]) {
				if (i < 0) {
					leftTouchAboveGround = true;
				} else {
					rightTouchAboveGround = true;
				}
			}
			let distance = (i + 0.5) / Precision;
			groundContactPlane[i] = { touch, x, y, distance };
		}
		return {plane:groundContactPlane, leftTouchGround, rightTouchGround, leftTouchAboveGround, rightTouchAboveGround};

	}
	drive(x) {
		if (this.onGround) {
			if (this.fuel > 0 || infinityGadgetsAndAmmoCheck) {
				if (!infinityGadgetsAndAmmoCheck) this.fuel -= 0.5;
				this.inertia[0] = x * cos(this.rotate);
				this.inertia[1] = x * -sin(this.rotate);
				this.x += this.inertia[0];
				this.y += this.inertia[1];
				game.actualPlayer.updateCSS();
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
	}
	getCurrentProjectileLandLocation() {
		let aimVector = new Vector();
		aimVector.angle = this.cannonAngle;
		aimVector.length = this.firePower / 100 * DefaultAmmoSpeed;
		let projectile = new Projectile(this.cannonTip, aimVector, undefined, undefined, true);
		while (!projectile.tick()) { }
		return [projectile.x, projectile.y, projectile.vector];
	}
}