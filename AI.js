class AI{
	static aimPrecision = [null, 0, 2, 2, 3, 3];
	static autoAim(AILevel = 1) {
		game.blockControls = false;

		this.selectAmmo(AILevel);


		let bestAngle = 0;
		let bestDistance = Infinity;
		for (let angle = 0; angle <= PI; angle += PI / 180) {//Výběr nejlepšího úhlu
			game.actualPlayer.tank.aimFast = angle;
			let landLocation = game.actualPlayer.tank.getCurrentProjectileLandLocation();
			for (let p = 0; p < game.players.length; p++) {
				if (game.players[p] != game.actualPlayer && game.players[p].tank) {
					let distance = pythagoras(landLocation, [game.players[p].tank.x, game.players[p].tank.y]);
					if (distance < bestDistance) {
						bestDistance = distance;
						bestAngle = angle;
					}
				}
			}
		}
		game.setAim(bestAngle + ((Math.random() - 0.5) / 33 * this.aimPrecision[AILevel] ));
		game.fire();
	}
	static selectAmmo(AILevel) {
		let ammoSelection;
		switch (AILevel) {
			case 1:
				if (game.actualPlayer.firstRound) shield(4);
				ammoSelection = ["volcanoBomb", "hotShower", "missile"];
				break;
			case 2:
				if (game.actualPlayer.firstRound) shield(3);
				ammoSelection = ["shower", "volcanoBomb", "missile"];
				break;
			case 3:
				if (game.actualPlayer.firstRound) shield(2);
				ammoSelection = ["smallMissile", "missile", "shower"];
				break;
			case 4:
				if (game.actualPlayer.firstRound) shield(1);
				ammoSelection = ["smallMissile", "missile"];
				break;
		}
		
		let filteredAmmoSelection = [];
		for (let i in ammoSelection) {//Filtrace nábojů podle toho zda ho AI má
			if (game.actualPlayer.inventory[ammoSelection[i]] > 0) filteredAmmoSelection.push(ammoSelection[i]);
		}
		ammoSelection = filteredAmmoSelection.length > 0 ? filteredAmmoSelection : ["smallMissile"];

		let selectedAmmo = ammoSelection[Math.floor(Math.random() * ammoSelection.length)];
		game.actualPlayer.selectedAmmo = GlobalInventory[selectedAmmo].InventoryID;
	}
	static autoShop(AILevel = 1) {
		switch (AILevel) {
			case 1:
				this.holdNumberOfProducts("superShield", 3);
				this.holdNumberOfProducts("missile", 10);
				this.holdNumberOfProducts("hotShower", 10);
				this.holdNumberOfProducts("volcanoBomb", 10);
				break;
			case 2:
				this.holdNumberOfProducts("strongShield", 3);
				this.holdNumberOfProducts("missile", 10);
				this.holdNumberOfProducts("shower", 10);
				this.holdNumberOfProducts("volcanoBomb", 10);
				break;
			case 3:
				this.holdNumberOfProducts("shield", 3);
				this.holdNumberOfProducts("missile", 10);
				this.holdNumberOfProducts("shower", 10);
				break;
			case 4:
				this.holdNumberOfProducts("weakShield", 3);
				this.holdNumberOfProducts("missile", 10);
				break;
		}
	}
	static holdNumberOfProducts(name, numberToHold) {
		let inventory = game.actualPlayer.inventory;
		GlobalInventory[name].buy(numberToHold - inventory[name]);
	}
}