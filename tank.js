class Tank {
	constructor(player) {
		this.player = player;
		this._aim = 20 / 180 * Math.PI;
		this.rotate = 0;
		this.firePower = 100;
		this.maxFirePower = 100;
		this.fuel = 100;
		this.x = Math.random()*2000+200;
		this.y = 800;
		this.onGround = false;
	}
	get aim() {
		return this._aim;
	}
	set aim(value) {
		this._aim = value;
		document.querySelector("#aimControll").value = value;
		this.player.updateCSS();
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
		let colision;
		do {
			this.y -= 1
		} while (!terrain.controlColision(this.x, this.y)[0]);
		do {
			this.y++;
		} while (terrain.controlColision(this.x, this.y)[1]);
		this.onGround = true;
		/* if (!terrain.controlColision(this.x, this.y)[0]) {
			this.y -= 1;
			this.onGround = false;
		} else {
			this.onGround = true;
			do {
				this.y++;
			} while ((terrain.controlColision(this.x, this.y)[1]));
		} */
	}
	get groundContactPlane() {
		let groundContactPlane = new Array(128);
		let distanceDifference = Math.cos(this.rotate);
		let heightDifference = Math.sin(this.rotate);
		let touch = false;
		let leftTouchGround = false;
		let rightTouchGround = false;
		let x = 0, y = 0;
		for (let i = -64; i < 64; i++) {
			x = this.x + i * distanceDifference;
			y = this.y + i * heightDifference;
			touch = terrain.controlColision(x, y);
			if (touch) {
				if (i < 0) {
					leftTouchGround = true;
				} else {
					rightTouchGround = true;
				}
			}
			groundContactPlane[i + 64] = [touch, x, y];
		}
		return [groundContactPlane, leftTouchGround, rightTouchGround, this.player.id];

	}
	drive(x) {
		if (this.onGround) {
			this.x += x;
		}
	}
	get cannonBase() {
		return [
			this.x + 25 / 6 * 5 * Math.sin(this.rotate),
			this.y + 25 / 6 * 5 * Math.cos(this.rotate)
		];
	}
	get cannonAngle() {
		return this.rotate + this.aim;
	}
	get cannonTip() {
		let base = this.cannonBase;
		let width = (25 * 9 / 3.5) * 0.4;
		return [
			/* this.x + width * -Math.cos(this._aim) * Math.sin(this.rotate),
			this.y + (25 / 6 * 5 + width * Math.sin(this._aim)) * Math.cos(this.rotate) */
			base[0] + width * -Math.cos(this.cannonAngle),
			base[1] + width * Math.sin(this.cannonAngle)
		];
	}
}