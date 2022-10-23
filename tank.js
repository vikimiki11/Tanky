class Tank {
	constructor(player) {
		this.player = player;
		this._aim = 20;
		this.firePower = 10100;
		this.maxFirePower = 100;
		this.fuel = 100;
		this.x = 0;
		this.y = 0;
	}
	get aim() {
		return this._aim;
	}
	set aim(value) {
		this._aim = value;
		document.querySelector("#aimControll").value = value;
		this.player.updateCSS();
	}
}