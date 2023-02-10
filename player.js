class Player {
	constructor(id, name, color, AI) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.AI = AI;
		this.money = 0;
		this.score = 0;
		this.tank = null;
		this.selected = false;
		this._selectedAmmo = 0;
		this.inventory = {};
		for (let item in GlobalInventory) {
			this.inventory[item] = GlobalInventory[item].defaultAmount;
		}
		this.firstRound = false;
	}

	get selectedAmmo() {
		return this._selectedAmmo;
	}
	set selectedAmmo(value) {
		this._selectedAmmo = parseInt(value);
	}
	updateCSS() {
		let toPrint = "";
		toPrint = `		#selectedAmmo .item${this.selectedAmmo} {
			display: grid;
		}
		
		#allAmmo .item${this.selectedAmmo} {
			display: none;
		}

		:root{
${this.tank ?`			--aim: ${round(this.tank.aim * 180 / PI)};
			--firePower: ${round(this.tank.firePower)};
			--maxFirePower: ${this.tank.maxFirePower};
			--fuel: "${round(this.tank.fuel)}";
			--tankAim: ${this.tank.aim}rad;`:""}
			--money: "${floor(this.money).toLocaleString() }";
			--color: ${this.color};
			--name: "${this.name}";
			--tankColor: ${this.color};
		}

		`;
		for (let item in this.inventory) {
			toPrint += `
		.inventoryRow.item${item} > .itemAmount::after, .${GlobalInventory[item].shortName}DisplayAfter::after{
			content: "${this.inventory[item] == "Infinity" ? "Inf." : this.inventory[item]}";
		}`;
		}
		document.querySelector("style#playerStyle").innerHTML = toPrint;
	}
	get globalCSS() {
		return `.score#score${this.id}::after{
			content: "${round(this.score)}";
		}
		#score${this.id}{
			color: ${this.color};
		}`;
	}

	nextAmmo() {
		if (game.blockControls && !ignoreBlockControl) return;
		do {
			this.selectedAmmo++;
			if (this.selectedAmmo >= ammoList.length) this.selectedAmmo = 0;
		} while (this.inventory[this.selectedAmmo] <= 0);
	}

	previousAmmo() {
		if (game.blockControls && !ignoreBlockControl) return;
		do {
			this.selectedAmmo--;
			if (this.selectedAmmo < 0) this.selectedAmmo = ammoList.length - 1;
		} while (this.inventory[this.selectedAmmo] <= 0);
	}
}