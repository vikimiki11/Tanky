class Terrain extends Array {
	constructor(width, height, terrain, seed = random(), grainificationSettings = [[[4, 15, 0], [4, 15, 2]], true]) {
		super();
		console.time("new terrain");
		this.width = width;
		this.height = height;
		this._terrain = terrain;
		this.currentTerrain = terrain;
		this.canvas = document.querySelector('canvas');
		this.canvas.width = width;
		this.canvas.height = height;
		this.context = this.canvas.getContext('2d');
		this.context.imageSmoothingEnabled = false;
		this.canvasData = new CanvasData(this.context, this.width, this.height);
		this.grainificationSettings = grainificationSettings;
		for (let x = 0; x < width; x++) {
			this[x] = new TerrainColumn(this, x);
		}
		console.timeEnd("new terrain");
	}
	get terrain() {
		if (!this._terrain) return ceil(random() * 3);
		return this._terrain;
	}
	set terrain(terrain) {
		this._terrain = terrain;
	}
	clear() {
		this.canvasData.clear();
	}
	generate(seed = random()) {
		console.time("generate TerrainBlock");
		this.currentTerrain = this.terrain;
		this.clear();
		this.seed = seed;
		noise.seed(seed);
		for (let x = 0; x < this.width; x++) {
			this[x].generate();
		}
		console.timeEnd("generate TerrainBlock");
		this.canvasData.grainification(...this.grainificationSettings);
		this.canvasData.update();

		this.updateSkyBox();
		this.generateTrees();

		engineSound.pause()
		switch (this.currentTerrain) {
			case 1:
				engineSound = engineMountainSound;
				break;
			case 2:
				engineSound = engineForrestSound;
				break;
			case 3:
				engineSound = engineDesertSound;
				break;
		}
	}
	updateSkyBox() {
		let y = noise.simplex2(0, -100000) * 0.5 + 0.5;
		let x = noise.simplex2(-100000, -100000);
		let innerSkyColor = GetSkyBoxColor("#75B1FF", "#C896C8", y);
		let outerSkyColor = GetSkyBoxColor("#1A7DFF", "#003F9F", y);
		innerSky.setAttribute("stop-color", innerSkyColor);
		outerSky.setAttribute("stop-color", outerSkyColor);
		sun.setAttribute("cx", `${x * 2200 + 1280}`);
		skybox.setAttribute("cx", `${x * 2200 + 1280}`);
		sun.setAttribute("cy", `${y * 600 + 450}`);
		skybox.setAttribute("cy", `${y * 750 + 1860}`);
	}
	generateTrees() {
		for (let x in trees) {
			trees[x].destroy();
		}
		trees = [];
		for (let x = 0; x < this.width; x++) {
			if (random() > 0.993)
				new Tree(x, this[x].terrainHeight - 1, this.currentTerrain);
		}
	}

	checkCollision(x, y) {
		if (this[floor(x)])
			return this[floor(x)][floor(y)];
		return false;
	}
	distanceFromGround(x, y) {
		let groundX = x;
		let groundY = y;
		let bottom;
		while ((!(bottom = this.checkCollision(groundX, groundY)) || this.checkCollision(groundX, groundY + 1)) && !(groundY > this.height) && !(groundY < -Tank.DriveBaseWidth)) {
			groundY += bottom ? 1 : -1;
		}
		return groundY - y;
	}

	destroyTerrain(xy, radius) {
		if (radius >= 200) console.time("destroyTerrain");
		forCoordInRadius(xy[0], xy[1], radius, (x, y) => {
			if (terrain[x])
				terrain[x].destroy(y);
		})
		terrain.canvasData.update();

		if (radius >= 200) console.timeEnd("destroyTerrain");
	}
	buildTerrain(xy, radius, color) {

		forCoordInRadius(xy[0], xy[1], radius, (x, y, color) => {
			if (terrain[x])
				terrain[x].build(y, color);
		}, [255, 255, 255, 255])
		terrain.canvasData.update();
	}
	checkForTankCollision(x, y) {
		let tankCollision = false;
		for (let i = 0; i < game.players.length; i++) {
			tankCollision = game.players[i].tank?.checkCollision(x, y);
			if (tankCollision) break;
		}
		return tankCollision;
	}
}




class TerrainColumn extends Uint8Array {
	constructor(table, x) {
		super(table.height);
		this.table = table;
		this.x = x;
		this.terrainHeight = this.table.height;
		this.width = this.table.width;
		this.height = this.table.height;
		this.topLevelThickness = 0;
		this.canvasData = this.table.canvasData;
		this.imageData = this.canvasData.data;
	}
	generate() {
		if (this.table.currentTerrain == 1) {//Mountain
			this.terrainHeight = round(((noise.simplex2(this.x / 800, 100000) + 1) / 4 + 0.2) * this.height);
			this.topLevelThickness = round((noise.simplex2(100000, this.x / 30) + 2.5) * 5) + (this.terrainHeight - 350) / 15;
		} else if (this.table.currentTerrain == 2) {//Forrest
			this.terrainHeight = round(((noise.simplex2(this.x / 500, 100000) + 1) / 10 + 0.2) * this.height);
			this.topLevelThickness = round((noise.simplex2(100000, this.x / 30) + 1.5) * 5);
		} else if (this.table.currentTerrain == 3) {//Desert
			this.terrainHeight = round(((noise.simplex2(this.x / 1000, 100000) + 1) / 20 + 0.2) * this.height);
			this.topLevelThickness = 0;
		}



		let colorStartIndex = (this.x + (this.height) * this.width) << 2;
		for (let y = 0; y <= this.terrainHeight; y++) {
			this[y] = true;
			colorStartIndex -= (this.width << 2);
			this.imageData[colorStartIndex + 3] = 255;

			let distanceFromGround = this.terrainHeight - y;
			if (distanceFromGround < this.topLevelThickness) {
				if (this.table.currentTerrain == 1) {
					this.imageData[colorStartIndex] = 255;
					this.imageData[colorStartIndex + 1] = 255;
					this.imageData[colorStartIndex + 2] = 255;
				} else if (this.table.currentTerrain == 2) {
					this.imageData[colorStartIndex] = 95;
					this.imageData[colorStartIndex + 1] = 199;
					this.imageData[colorStartIndex + 2] = 17;
				}
			} else {
				if (this.table.currentTerrain == 1) {
					const scale = 0.02;
					let n = noise.simplex2(this.x * scale, y * scale);
					n = n < 0 ? n / 4 : n;
					this.imageData[colorStartIndex] = 102 - n * 10;
					this.imageData[colorStartIndex + 1] = 102 - n * 10;
					this.imageData[colorStartIndex + 2] = 102 - n * 10;
				} else if (this.table.currentTerrain == 2) {
					const scale = 0.02;
					let n = noise.simplex2(this.x * scale, y * scale);
					n = n < 0 ? n / 2 : n;
					this.imageData[colorStartIndex] = 151 - n * 23;
					this.imageData[colorStartIndex + 1] = 71 - n * 10;
					this.imageData[colorStartIndex + 2] = 28 - n * 4;
				} else if (this.table.currentTerrain == 3) {
					const scale = 0.005;
					let n = noise.simplex2(this.x * scale, y * scale) * 1.25;
					let shade = cos(distanceFromGround / 30 + n) / 13 + 12 / 13;
					this.imageData[colorStartIndex] = 230 * shade;
					this.imageData[colorStartIndex + 1] = 180 * shade;
					this.imageData[colorStartIndex + 2] = 70 * shade;
				}
				let depthColoring = 1 - distanceFromGround / terrain.height / 1.5;
				this.imageData[colorStartIndex] *= depthColoring;
				this.imageData[colorStartIndex + 1] *= depthColoring;
				this.imageData[colorStartIndex + 2] *= depthColoring;
			}
		}
		for (let y = this.terrainHeight + 1; y < this.length; y++) {
			this[y] = false;
			colorStartIndex -= (this.width << 2);
			this.imageData[colorStartIndex + 3] = 0;
		}
	}
	destroy(y) {
		if (!this[y]) return;
		this[y] = false;
		let coords = this.canvasData.coordinatesToIndex(this.x, y);
		this.imageData[coords] *= 0.5;
		this.imageData[coords + 1] *= 0.5;
		this.imageData[coords + 2] *= 0.5;
	}
	build(y, color) {
		if (this[y]) return;
		this[y] = true;
		color = color || [255, 255, 255, 255];
		let coords = this.canvasData.coordinatesToIndex(this.x, y);
		this.imageData[coords] = color[0];
		this.imageData[coords + 1] = color[1];
		this.imageData[coords + 2] = color[2];
		this.imageData[coords + 3] = color[3];
	}
}


class CanvasData {
	constructor(context, width, height) {
		this.context = context;
		this.imageData = context.getImageData(0, 0, width, height);
		this.data = this.imageData.data;
		this.width = width;
		this.height = height;
	}
	coordinatesToIndex(x, y) {
		return (x + (this.height - 1 - y) * this.width) << 2;
	}
	setPixel(x, y, color) {
		const startIndex = this.coordinatesToIndex(x, y);
		this.data[startIndex] = color[0];
		this.data[startIndex + 1] = color[1];
		this.data[startIndex + 2] = color[2];
		this.data[startIndex + 3] = color[3];
	}
	getPixel(x, y) {
		const startIndex = this.coordinatesToIndex(x, y);
		return [this.data[startIndex], this.data[startIndex + 1], this.data[startIndex + 2], this.data[startIndex + 3]];
	}
	update() {
		this.context.putImageData(this.imageData, 0, 0);
	}
	clear() {
		for (let i = 0; i < this.data.length; i++) {
			this.data[i] = 0;
		}
	}




	grainification1x1(decreaseI, startHeight = 0) {
		const Decrease = decreaseI || 10;
		const InverseDecrease = 1 / Decrease;

		let startIndex = startHeight * terrain.width << 2;
		
		console.time("grainification1x1");
		for (let i = startIndex; i < this.data.length; i++) {
			if (this.data[i] && i & 3 != 3) this.data[i] = this.data[i] * ((random() + Decrease - 1) * InverseDecrease);
		}
		console.timeEnd("grainification1x1");
	}
	grainification2x2(decreaseI, startHeight = 0) {
		const Decrease = decreaseI || 10;
		const InverseDecrease = 1 / Decrease;
		let actualDecrease = [];

		startHeight = startHeight - startHeight % 2;
		let startIndex = startHeight * terrain.width << 2;

		console.time("grainification2x2");
		for (let i = startIndex; i < this.data.length; i = ((i << 2) + 2) % this.width < 2 ? i + ((2 + this.width - ((i >> 2) + 2) % this.width) << 2) : i + 8) {
			actualDecrease = [((random() + Decrease - 1) * InverseDecrease), ((random() + Decrease - 1) * InverseDecrease), ((random() + Decrease - 1) * InverseDecrease)];
			for (let j = 0; j <= 6; j = ++j + Number(j == 3)) {
				this.data[i + j] = this.data[i + j] * actualDecrease[j & 3];
				this.data[i + (this.width >> 2) + j] = this.data[i + (this.width >> 2) + j] * actualDecrease[j & 3];
			}
		}
		console.timeEnd("grainification2x2");
	}
	grainificationNxN(n, decreaseI, startHeight = 0, offset) {
		if (n < 0) return console.warn("GrainificationNxN: n must be positive");
		if (n == 1) return this.grainification1x1(decreaseI, startHeight);
		if (n == 2) return this.grainification2x2(decreaseI, startHeight);
		const Decrease = decreaseI || 10;
		const InverseDecrease = 1 / Decrease;
		let actualDecrease = [];

		startHeight = startHeight - startHeight % n;
		let startIndex = startHeight * terrain.width << 2;

		console.time("grainificationNxN(" + n + ")");
		for (let imageDataOffset = startIndex; imageDataOffset < this.data.length; imageDataOffset = ((imageDataOffset >> 2) + 3) % this.width < n ? imageDataOffset + ((n + this.width * (n - 1) - ((imageDataOffset >> 2) + 3) % this.width) << 2) : imageDataOffset + (n << 2)) {
			actualDecrease = [((random() + Decrease - 1) * InverseDecrease), ((random() + Decrease - 1) * InverseDecrease), ((random() + Decrease - 1) * InverseDecrease)];
			for (let imageDataIndex = 0; imageDataIndex < n << 2; imageDataIndex = ++imageDataIndex + Number((imageDataIndex & 3) == 3)) {
				for (let x = 0; x < n; x++) {
					this.data[imageDataOffset + imageDataIndex + (this.width << 2) * (x + offset) + (offset << 2)] = this.data[imageDataOffset + imageDataIndex + (this.width << 2) * (x + offset) + (offset << 2)] * actualDecrease[imageDataIndex & 3];
				}
			}
		}
		console.timeEnd("grainificationNxN(" + n + ")");
	}
	grainification(settings, ignoreAir) {
		console.groupCollapsed("grainification");

		let startHeight = 0;
		if (ignoreAir) {
			for (let i = 0; i < terrain.width; i++) {
				startHeight = max(terrain[i].terrainHeight, startHeight);
			}
			startHeight = terrain.height - startHeight - 1;
		}


		for (let settingIndex in settings) {
			let grainSize = settings[settingIndex][0];
			let intensity = settings[settingIndex][1];
			let offset = settings[settingIndex][2];
			this.grainificationNxN(grainSize, intensity, startHeight, offset);
		}
		console.groupEnd("grainification");
	}
}
function HexToDec(rgb) {
	rgb = parseInt(rgb.replace("#", ""), 16);
	return {
		r: (rgb >> 16) & 0xFF,
		g: (rgb >> 8) & 0xFF,
		b: rgb & 0xFF
	};
}
function DecToHex(rgb) {
	return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}
function GetSkyBoxColor(rgb, rgb2, ration) {
	rgb = HexToDec(rgb);
	rgb2 = HexToDec(rgb2);
	let r = Math.round(rgb.r + (rgb2.r - rgb.r) * ration);
	let g = Math.round(rgb.g + (rgb2.g - rgb.g) * ration);
	let b = Math.round(rgb.b + (rgb2.b - rgb.b) * ration);
	return DecToHex({ r, g, b });
}




let trees = [];
class Tree {
	constructor(x, y, type) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.draw();
		trees.push(this);
	}
	draw() {
		this.DOM = document.createElement("img");
		this.DOM.style.left = this.x + "em";
		this.DOM.style.bottom = this.y + "em";
		switch (this.type) {
			case 1:
				this.DOM.src = "img/treeMountain.png";
				break;
			case 2:
				this.DOM.src = "img/treeForest.png";
				break;
			case 3:
				this.DOM.src = "img/treeDesert.png";
				break;
		}
		this.DOM.className = "tree";
		document.querySelector("#gamePlane").appendChild(this.DOM);
	}
	destroy() {
		this.DOM.remove();
	}
}