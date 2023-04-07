ammoList = [];
GlobalInventory = {}
class InventoryItem {
	static inventoryIDCounter = 0;
	constructor(name, shortName, img, defaultAmount, cost, buyAmount, type, originalClass) {
		this.InventoryID = InventoryItem.inventoryIDCounter++;
		this.name = name;
		this.shortName = shortName;
		this.img = img;
		this.defaultAmount = defaultAmount;
		this.cost = cost;
		this.buyAmount = buyAmount;
		this.type = type;
		GlobalInventory[shortName] = this;
		this.originalClass = originalClass;
	}
	get html() {
		return `<div class="inventoryRow item${this.InventoryID} item${this.shortName}" item="${this.InventoryID}" type="${this.type}" shortName="${this.shortName}">
					<div class="itemIcon">
						<img src="${this.img}">
					</div>
					<div class="itemName">
						${this.name}
					</div>
					<div class="itemCost">
						${this.cost}
					</div>
					<div class="itemBuyAmount">
						${this.buyAmount}
					</div>
					<div class="itemAmount">
					</div>
				</div>`;
	}
	buy(amount = 1, player = game.actualPlayer) {
		let inventory = player.inventory;
		let bought = 0;
		while (player.money >= this.cost && inventory[this.shortName] + this.buyAmount < 1000 && bought < amount) {
			player.money -= this.cost;
			inventory[this.shortName] += this.buyAmount;
			bought++;
		}
		return bought;
	}
	use(amount = 1, player = game.actualPlayer) {
		let inventory = player.inventory;
		if (inventory[this.shortName] - amount >= 0 || infinityGadgetsAndAmmoCheck) {
			if (!infinityGadgetsAndAmmoCheck) inventory[this.shortName] -= amount;
			return true;
		}
		return false;
	}
}
class Ammo extends InventoryItem {
	static ammoIDCounter = 0;
	constructor(name, shortName, img, defaultAmount, cost, buyAmount, fire) {
		super(name, shortName, "img/ammo/" + img, defaultAmount, cost, buyAmount, "ammo", Ammo);
		this.ID = Ammo.ammoIDCounter++;
		this.fire = fire;
		ammoList.push(this);
	}
}
new Ammo("Small missile", "smallMissile", "smallMissile.png", Infinity, 0, 10,
	() => { return simpleFlyingAmmo(undefined, undefined, 30, 50) }
)

new Ammo("Missile", "missile", "missile.png", 10, 1000, 10,
	() => { return simpleFlyingAmmo(undefined, undefined, 30, 100) }
);

new Ammo("Small atom bomb", "smallAtomBomb", "mushroom.png", 0, 1000, 10,
	() => { return simpleFlyingAmmo(undefined, undefined, 250, 300) }
);


new Ammo("Atom bomb", "atomBomb", "redMushroom.png", 0, 1000, 10,
	() => { return simpleFlyingAmmo(undefined, undefined, 500, 300) }
);


new Ammo("Volcano bomb", "volcanoBomb", "volcanoBomb.png", 10, 1000, 10,
	() => {
		return new Promise((resolve) => {
			fireFlyingProjectile().then((XYVector) => {
				explosion(XYVector, 30, 50);
				let xy = [XYVector[0] - XYVector[2].x, XYVector[1] - XYVector[2].y]; //Místo jeden krok před dopadem
				let promises = [];
				for (let i = 0; i < 4; i++) {//Vytváření nábojů po dopadu, které se po okolí
					let vector = new Vector(0, 0);
					vector.length = pythagoras([XYVector[2].x, XYVector[2].y]) / 2;
					vector.angle = PI / 5 * (1 + Math.random() * 3);
					promises.push(simpleFlyingAmmo(xy, vector, 30, 35));
				}
				Promise.allSettled(promises).then(resolve);
			}).catch(() => {
				console.log("projectile out of map");
				resolve();
			});
		});
	}
);
new Ammo("Shower", "shower", "shower.png", 0, 1000, 10,
	() => {
		let vector = Vector.getVectorFromAim()
		let promises = [];
		for (let i = -2; i <= 2; i++) {
			promises.push(simpleFlyingAmmo(undefined, new Vector(vector.x + 0.15 * i, vector.y), 30, 50));
		}
		return Promise.allSettled(promises);
	}
);
new Ammo("Hot Shower", "hotShower", "hotShower.png", 0, 1000, 10,
	() => {
		let vector = Vector.getVectorFromAim()
		let promises = [];
		for (let i = -2; i <= 2; i++) {
			promises.push(simpleFlyingAmmo(undefined, new Vector(vector.x + 0.15 * i, vector.y), 30, 100));
		}
		return Promise.allSettled(promises);
	}
);
new Ammo("Small ball", "smallBall", "smallBall.png", 0, 1000, 10,
	() => { return simpleRollingAmmo(undefined, undefined, 0, 200, 30, 50) }
);
new Ammo("Ball", "ball", "ball.png", 0, 1000, 10,
	() => { return simpleRollingAmmo(undefined, undefined, 0, 200, 50, 50) }
);
new Ammo("Large ball", "largeBall", "largeBall.png", 0, 1000, 10,
	() => { return simpleRollingAmmo(undefined, undefined, 0, 200, 70, 110) }
);
new Ammo("Small ball V2", "smallBallV2", "smallBall.png", 0, 1000, 10,
	() => { return simpleRollingAmmo(undefined, undefined, 1, 300, 30, 50) }
);
new Ammo("Ball V2", "ballV2", "ball.png", 0, 1000, 10,
	() => { return simpleRollingAmmo(undefined, undefined, 1, 300, 50, 50) }
);
new Ammo("Large ball V2", "largeBallV2", "largeBall.png", 0, 1000, 10,
	() => { return simpleRollingAmmo(undefined, undefined, 1, 300, 60, 110) }
);

const DefaultAmmoSpeed = 12.5;
function fireFlyingProjectile(xy = game.actualPlayer.tank.cannonTip, vector = Vector.getVectorFromAim()) {
	let XYVector = [xy[0], xy[1], vector];
	return new Promise((resolve, reject) => {
		projectiles.push(new FlyingProjectile(XYVector, resolve, reject));
	});
}
function fireRollingProjectile(xy, vector, maxClimb, timeToLive) {
	let flyingProjectile = fireFlyingProjectile(xy, vector);
	return new Promise((resolve, reject) => {
		flyingProjectile.then(
			(XYVector) => {
				projectiles.push(new RollingProjectile(XYVector, resolve, reject, false, maxClimb, timeToLive))
			},
			reject
		);
	});
}

function explosion(xy, radius, damage) {
	explosionSoundController.play();
	xy = [round(xy[0]), round(xy[1])];
	return new Promise((resolve) => {
		setTimeout(resolve, 1000);
		explosionAnimation(xy, radius)
		setTimeout(() => {
			if (radius >= 200) console.time("explosion");
			terrain.destroyTerrain(xy, radius);

			//Přičítání skóre
			let score = 0;
			for (let i = 0; i < game.players.length; i++) {
				let tank = game.players[i].tank;
				if (tank) {
					let distance = pythagoras(xy, tank.cannonBase) - 20;
					if (distance <= radius) {
						let damageToTank = damage * (1 - distance / radius);
						score += tank.damage(damageToTank);
					}
				}
			}
			game.actualPlayer.score += score * 10;
			game.actualPlayer.money += score * 50;


			//ničení stromů
			for (let i = 0; i < trees.length; i++) {
				let tree = trees[i];
				if (tree) {
					let distance = pythagoras(xy, [tree.x, tree.y]);
					if (distance <= radius) {
						tree.destroy();
					}
				}
			}
			if (radius >= 200) console.timeEnd("explosion");
		}, 500);
	});
}

explosionID = 0;
function explosionAnimation(xy, radius) {
	let explosion = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	explosion.setAttribute("viewBox", "0 0 100 100");
	explosion.setAttribute("class", "explosion");
	explosion.style.left = xy[0] + "em";
	explosion.style.bottom = xy[1] + "em";
	explosion.style.width = radius * 2 + "em";
	explosion.style.height = radius * 2 + "em";
	explosion.innerHTML = `<defs>
			<radialGradient id="explosion${explosionID}" fr="50%">
				<stop offset="0%" stop-color="#FFFFFF"></stop>
				<stop offset="20%" stop-color="#FFFF00"></stop>
				<stop offset="100%" stop-color="#FF0000"></stop>
				<animate attributeName="fr" dur="1500ms" from="1%" to="50%"/>
			</radialGradient>
		</defs>
		<circle cx="50" cy="50" r="50" fill="url(#explosion${explosionID})">
			<animate attributeType="XML" attributeName="r" from="0" to="50" dur="500ms"/>
		</circle>
		Sorry, your browser does not support inline SVG.`;
	gamePlane.appendChild(explosion);
	setTimeout((DOM) => { DOM.remove() }, 1000, explosion);//odstranení svg
	explosionID++;
}

function simpleFlyingAmmo(xy, vector, radius, damage) {
	return new Promise((resolve) => {
		fireFlyingProjectile(xy, vector).then((xy) => {
			explosion(xy, radius, damage).then(resolve);
		}).catch(() => {
			resolve();
			console.log("projectile out of map");
		});
	});
}

function simpleRollingAmmo(xy, vector, maxClimb, timeToLive, radius, damage) {
	return new Promise((resolve) => {
		fireRollingProjectile(xy, vector, maxClimb, timeToLive).then((xy) => {
			explosion(xy, radius, damage).then(resolve);
		}).catch(() => {
			resolve();
			console.log("projectile out of map");
		});
	});
}

function removeProjectiles() {
	for(let i = 0; i < projectiles.length; i++) {
		projectiles[i].DOM.remove();
	}
	projectiles = [];
}
let projectiles = [];
let projectileIDCounter = 0;
const AirResistancePerSecond = 0.85;
const AirResistancePerTick = pow(AirResistancePerSecond, 1 / 60);
const Gravity = 0.05;
class Projectile{
	constructor(XYVector, landed = () => { }, outOfBounds = () => { }, noDOM) {
		this.x = XYVector[0];
		this.y = XYVector[1];
		this.vector = XYVector[2];
		this.landed = landed;
		this.outOfBounds = outOfBounds;
		this.id = projectileIDCounter++;
		this.noDOM = noDOM;
		if (!noDOM) this.DOM = this.createGamePlaneObject();
		this.end = false;
		this.tickCounter = 0;
	}
	createGamePlaneObject() {
		let projectile = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		projectile.setAttribute("viewBox", "0 0 50 50");
		projectile.setAttribute("class", "projectile");
		projectile.setAttribute("id", "projectile" + this.id);
		projectile.style.left = this.x + "em";
		projectile.style.bottom = this.y + "em";
		projectile.innerHTML = `<circle cx="25" cy="25" r="25" stroke-width="0" fill="black" />Sorry, your browser does not support inline SVG.`;
		gamePlane.appendChild(projectile);
		return projectile;
	}
	destroy(noDOM) {
		if (!noDOM) this.DOM.remove();
	}
}
class FlyingProjectile extends Projectile{
	constructor(XYVector, landed = () => { }, outOfBounds = () => { }, noDOM) {
		super(XYVector, landed, outOfBounds, noDOM);
	}
	tick(noDOM) {
		noDOM = noDOM || this.noDOM;
		//úprava směru
		this.vector.x *= AirResistancePerTick;
		this.vector.y *= AirResistancePerTick;
		this.vector.y -= Gravity;
		this.vector.x += game.windCurrent / 3000;
		//přičtení směru
		this.x += this.vector.x;
		this.y += this.vector.y;

		if (!noDOM) {
			this.DOM.style.left = this.x + "em";
			this.DOM.style.bottom = this.y + "em";
		}

		//Kontrola kolize
		if (terrain.checkCollision(this.x, this.y) || terrain.checkForTankCollision(this.x, this.y)) {
			this.destroy(noDOM);
			this.landed([this.x, this.y, this.vector]);
			this.end = true;
			return true;
		}

		//Mimo mapu
		if (this.y < 0) {
			this.destroy(noDOM);
			this.outOfBounds();
			this.end = true;
			return true;
		}
		this.tickCounter++;
		return false;
	}
}
class RollingProjectile extends Projectile {
	constructor(XYVector, landed = () => { }, outOfBounds = () => { }, noDOM, maxClimb, timeToLive) {
		super(XYVector, landed, outOfBounds, noDOM);
		if (terrain.checkForTankCollision(this.x, this.y)) {
			this.destroy();
			this.landed([this.x, this.y]);
			this.end = true;
		}
		this.direction = this.vector.x > 0 ? 1 : -1;
		this.maxClimb = maxClimb;
		this.timeToLive = timeToLive;
		this.y += terrain.distanceFromGround(this.x, this.y);
	}
	tick() {
		//posun po terénu
		this.x += this.direction;

		//kontrola změnu výšky
		let distanceFromGround = terrain.distanceFromGround(this.x, this.y);
		this.DOM.style.left = this.x + "em";
		this.DOM.style.bottom = this.y + "em";

		//Kontrola konce života projektylu
		if (
			terrain.checkForTankCollision(this.x, this.y + 2) ||
			this.tickCounter >= this.timeToLive || 
			distanceFromGround > this.maxClimb  //Příliš příkrý terén
		) {
			this.destroy();
			this.landed([this.x, this.y]);
			this.end = true;
			return true;
		}
		this.y += distanceFromGround;

		//Kontrola mimo mapu
		if (this.y < 0) {
			this.destroy();
			this.outOfBounds();
			this.end = true;
			return true;
		}
		this.tickCounter++;
		return false;
	}
}