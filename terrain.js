class Terrain extends Array {
	constructor(width, height, terrain, seed = random()) {
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
	get maxHeight(){
		return ([1, 7 / 10, 2 / 5, 3 / 10])[this.currentTerrain];
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
			if (this.currentTerrain == 1) {//Mountain
				this[x].terrainHeight = round(((noise.simplex2(x / 800, 100000) + 1) / 4 + 0.2) * this.height);
				this[x].topLevelThickness = round((noise.simplex2(100000, x / 30) + 2.5) * 5) + (this[x].terrainHeight - 350) / 15;
			} else if (this.currentTerrain == 2) {//Forrest
				this[x].terrainHeight = round(((noise.simplex2(x / 500, 100000) + 1) / 10 + 0.2) * this.height);
				this[x].topLevelThickness = round((noise.simplex2(100000, x / 30) + 1.5) * 5);
			} else if (this.currentTerrain == 3) {//Desert
				this[x].terrainHeight = round(((noise.simplex2(x / 1000, 100000) + 1) / 20 + 0.2) * this.height);
				this[x].topLevelThickness = 0;
			}
			this[x].generate();
			for (let y = 0; y <= this[x].terrainHeight; y++) {
				this[x][y].generate();
			}
			for (let y = this[x].terrainHeight + 1; y < this[x].length; y++) {
				this[x][y].clean();
			}
		}
		console.timeEnd("generate TerrainBlock");
		this.canvasData.grainification(1, 4, 15);
		this.canvasData.update();
	}
	controlCollision(x, y) {
		if (this[floor(x)] && this[floor(x)][floor(y)])
			return this[floor(x)][floor(y)].isSolid;
		return false;
	}
	distanceFromGround(x, y) {
		let groundX = x;
		let groundY = y;
		let bottom;
		while ((!(bottom = this.controlCollision(groundX, groundY)) || this.controlCollision(groundX, groundY + 1)) && !(groundY > this.height) && !(groundY < -Tank.DriveBaseWidth)) {
			groundY += bottom ? 1 : -1;
		}
		return groundY - y;
	}

	destroyTerrain(xy, radius) {
		if (radius >= 200) console.time("destroyTerrain");

		if (!this[xy[0]][xy[1]]?.air) terrain[xy[0]][xy[1]]?.destroy();
		for (let y = 1; y <= radius; y++) {
			let startx = sqrt(radius ** 2 - y ** 2);
			for (let x = round(startx); x >= 0; x--) {
				if (terrain[xy[0] + y] && !terrain[xy[0] + y][xy[1] + x]?.air) terrain[xy[0] + y][xy[1] + x]?.destroy();
				if (terrain[xy[0] - x] && !terrain[xy[0] - x][xy[1] + y]?.air) terrain[xy[0] - x][xy[1] + y]?.destroy();
				if (terrain[xy[0] - y] && !terrain[xy[0] - y][xy[1] - x]?.air) terrain[xy[0] - y][xy[1] - x]?.destroy();
				if (terrain[xy[0] + x] && !terrain[xy[0] + x][xy[1] - y]?.air) terrain[xy[0] + x][xy[1] - y]?.destroy();
			}
		}
		terrain.canvasData.update();

		if (radius >= 200) console.timeEnd("destroyTerrain");
	}
	buildTerrain(xy, radius, color) {
		if (terrain[xy[0]])terrain[xy[0]][xy[1]]?.build(color);
		for (let y = 1; y <= radius; y++) {
			let startx = sqrt(radius ** 2 - y ** 2);
			for (let x = round(startx); x >= 0; x--) {
				if (terrain[xy[0] + y]) terrain[xy[0] + y][xy[1] + x]?.build(color);
				if (terrain[xy[0] - x]) terrain[xy[0] - x][xy[1] + y]?.build(color);
				if (terrain[xy[0] - y]) terrain[xy[0] - y][xy[1] - x]?.build(color);
				if (terrain[xy[0] + x]) terrain[xy[0] + x][xy[1] - y]?.build(color);
			}
		}
		terrain.canvasData.update();
	}
}




class TerrainColumn extends Array {
	constructor(table, x) {
		super();
		this.table = table;
		this.x = x;
		this.terrainHeight = 0;
		this.topLevelThickness = 0;
		this.terrainBlockHeight = this.table.height * this.table.maxHeight;
		for (let y = 0; y < this.terrainBlockHeight; y++) {
			this[y] = new TerrainBlock(this, y);
		}
	}
	generate() {
		if (this.terrainBlockHeight < this.terrainHeight) {
			for (let y = this.terrainBlockHeight; y <= this.terrainHeight; y++) {
				this[y] = new TerrainBlock(this, y);
			}
			this.terrainBlockHeight = this.terrainHeight;
			console.log("terrainBlockHeight < terrainHeight");
		}
	}
}




class TerrainBlock {
	constructor(column, y) {
		this.column = column;
		this.table = column.table;
		this.canvasData = column.table.canvasData;
		this.y = y;
		this.x = column.x;
		this.color = [0, 0, 0, 0];
		this.distanceFromGround = 0;
		this.destroyed = false;
		this.air = true;
	}
	generate() {
		this.destroyed = false;
		this.air = true;
		this.distanceFromGround = this.column.terrainHeight - this.y;
		if (this.distanceFromGround >= 0 && this.distanceFromGround - this.column.topLevelThickness < 0) {
			this.air = false;
			if (this.table.currentTerrain == 1) {
				this.color = [255, 255, 255, 255];
			} else if (this.table.currentTerrain == 2) {
				this.color = [95, 199, 17, 255];
			}
			this.canvasData.setPixel(this.x, this.y, this.color);
		} else if (this.distanceFromGround >= 0) {
			this.air = false
			this.color[3] = 255;
			if (this.table.currentTerrain == 1) {
				const scale = 0.02;
				let n = noise.simplex2(this.x * scale, this.y * scale);
				n = n < 0 ? n / 4 : n;
				this.color[0] = 102 - n * 10;
				this.color[1] = 102 - n * 10;
				this.color[2] = 102 - n * 10;
			} else if (this.table.currentTerrain == 2) {
				const scale = 0.02;
				let n = noise.simplex2(this.x * scale, this.y * scale);
				n = n < 0 ? n / 2 : n;
				this.color[0] = 151 - n * 23;
				this.color[1] = 71 - n * 10;
				this.color[2] = 28 - n * 4;
			} else if (this.table.currentTerrain == 3) {
				const scale = 0.005;
				let n = noise.simplex2(this.x * scale, this.y * scale) * 1.25;
				this.color = TerrainBlock.desertGradient(this.distanceFromGround / 30 + n);
			}
			this.canvasData.setPixel(this.x, this.y, this.color);
		}
	}
	clean(){
		this.air = true;
	}
	destroy() {
		this.destroyed = true;
		this.canvasData.setPixel(this.x, this.y, [this.color[0]*0.5, this.color[1]*0.5, this.color[2]*0.5, this.color[3]]);
	}
	build(color) {
		this.color = color || (this.air ? [255, 255, 255, 255] : this.color);
		this.air = false;
		this.destroyed = false;
		this.canvasData.setPixel(this.x, this.y, this.color);
	}
	static desertGradient(pressure) {
		let shade = cos(pressure)/13 + 12/13;
		return [230 * shade, 180 * shade, 70 * shade, 255];
	}
	get isSolid() {
		return !(this.air || this.destroyed);
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
		return (x + (this.height - 1 - y) * this.width) * 4;
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




	grainification1x1(decreaseI) {
		const decrease = decreaseI || 10;
		console.time("grainification1x1");
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i] && i % 4 != 3) this.data[i] = this.data[i] * ((random() + decrease - 1) / decrease );
		}
		console.timeEnd("grainification1x1");
	}
	grainification2x2(decreaseI) {
		const decrease = decreaseI || 10;
		let actualDecrease = 0;
		console.time("grainification2x2");
		for (let i = 0; i < this.data.length; i = (i / 4 + 2) % this.width < 2 ? i + (2 + this.width - (i / 4 + 2) % this.width) * 4 : i + 8) {
			actualDecrease = [((random() + decrease - 1) / decrease), ((random() + decrease - 1) / decrease), ((random() + decrease - 1) / decrease)];
			for (let j = 0; j <= 6; j = ++j + Number(j == 3)) {
				this.data[i + j] = this.data[i + j] * actualDecrease[j % 4];
				this.data[i + this.width * 4 + j] = this.data[i + this.width * 4 + j] * actualDecrease[j % 4];
			}
		}
		console.timeEnd("grainification2x2");
	}
	grainificationNxN(n, decreaseI) {
		if (n < 0) return console.warn("GrainificationNxN: n must be positive");
		if (n == 1) return this.grainification1x1(decreaseI);
		if (n == 2) return this.grainification2x2(decreaseI);
		const decrease = decreaseI || 10;
		let actualDecrease = 0;
		console.time("grainificationNxN(" + n + ")");
		for (let i = 0; i < this.data.length; i = (i / 4 + 3) % this.width < n ? i + (n + this.width * (n - 1) - (i / 4 + 3) % this.width) * 4 : i + n * 4) {
			actualDecrease = [((random() + decrease - 1) / decrease), ((random() + decrease - 1) / decrease), ((random() + decrease - 1) / decrease)];
			for (let j = 0; j < n * 4; j = ++j + Number(j % 4 == 3)) {
				for (let x = 0; x < n; x++) {
					this.data[i + j + this.width * 4 * x] = this.data[i + j + this.width * 4 * x] * actualDecrease[j % 4];
				}
			}
		}
		console.timeEnd("grainificationNxN(" + n + ")");
	}
	grainification(start, stop, decreaseI) {
		console.groupCollapsed("grainification");
		for(let i = start; i <= stop; i++) {
			this.grainificationNxN(i, decreaseI);
		}
		console.groupEnd("grainification");
	}
}