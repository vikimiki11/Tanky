importScripts("math.js", "libraries/perlin.js");


class TerrainSection extends Array {
	constructor(data) {
		super();
		this.width = data.width;
		this.height = data.height;
		this.currentTerrain = data.currentTerrain;
		this.start = data.start;
		this.end = data.end;
		this.actualWidth = this.end - this.start + 1;
		this.imageData = new Uint8ClampedArray((this.end - this.start + 1) * this.height * 4);
		for (let x = this.start; x <= this.end; x++) {
			this[x] = new TerrainColumn(this, x);
		}
		this.canvasData = new CanvasData(this.imageData, (this.end - this.start + 1), this.height, this.start);
	}
	get maxHeight() {
		return ([1, 7 / 10, 2 / 5, 3 / 10])[this.currentTerrain];
	}
	clear() {
		this.canvasData.clear();
	}
	generate(seed) {
		noise.seed(seed);
		for (let x = this.start; x <= this.end; x++) {
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
		}
	}
	controlCollision(x, y, id) {
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
		if (!this[xy[0]][xy[1]]?.air) this[xy[0]][xy[1]]?.destroy();
		for (let y = 1; y <= radius; y++) {
			let startx = sqrt(radius ** 2 - y ** 2);
			for (let x = round(startx); x >= 0; x--) {
				if (this[xy[0] + y] && !this[xy[0] + y][xy[1] + x]?.air) this[xy[0] + y][xy[1] + x]?.destroy();
				if (this[xy[0] - x] && !this[xy[0] - x][xy[1] + y]?.air) this[xy[0] - x][xy[1] + y]?.destroy();
				if (this[xy[0] - y] && !this[xy[0] - y][xy[1] - x]?.air) this[xy[0] - y][xy[1] - x]?.destroy();
				if (this[xy[0] + x] && !this[xy[0] + x][xy[1] - y]?.air) this[xy[0] + x][xy[1] - y]?.destroy();
			}
		}
	}
	buildTerrain(xy, radius, color) {
		if (this[xy[0]]) this[xy[0]][xy[1]]?.build(color);
		for (let y = 1; y <= radius; y++) {
			let startx = sqrt(radius ** 2 - y ** 2);
			for (let x = round(startx); x >= 0; x--) {
				if (this[xy[0] + y]) this[xy[0] + y][xy[1] + x]?.build(color);
				if (this[xy[0] - x]) this[xy[0] - x][xy[1] + y]?.build(color);
				if (this[xy[0] - y]) this[xy[0] - y][xy[1] - x]?.build(color);
				if (this[xy[0] + x]) this[xy[0] + x][xy[1] - y]?.build(color);
			}
		}
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
		for (let y = 0; y <= this.terrainHeight; y++) {
			this[y].generate();
		}
		for (let y = this.terrainHeight + 1; y < this.length; y++) {
			this[y].clear();
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
		console.debug();
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
			this.table.canvasData.setPixel(this.x, this.y, this.color);
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
			this.table.canvasData.setPixel(this.x, this.y, this.color);
		}
	}
	clear() {
		this.air = true;
	}
	destroy() {
		this.destroyed = true;
		this.table.canvasData.setPixel(this.x, this.y, [this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3]]);
	}
	build(color) {
		this.color = color || (this.air ? [255, 255, 255, 255] : this.color);
		this.air = false;
		this.destroyed = false;
		this.table.canvasData.setPixel(this.x, this.y, this.color);
	}
	static desertGradient(pressure) {
		let shade = cos(pressure) / 13 + 12 / 13;
		return [230 * shade, 180 * shade, 70 * shade, 255];
	}
	get isSolid() {
		return !(this.air || this.destroyed);
	}
}



class CanvasData {
	constructor(imageData, width, height, start) {
		this.data = imageData;
		this.width = width;
		this.height = height;
		this.start = start;
	}
	coordinatesToIndex(x, y) {
		return (x - this.start + (this.height - 1 - y) * this.width) * 4;
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
	clear() {
		for (let i = 0; i < this.data.length; i++) {
			this.data[i] = 0;
		}
	}
}





let terrain;
self.onmessage = (msg) => {
	let data = msg.data.data;
	let operation = msg.data.operation;
	let id = msg.data.id;
	switch (operation) {
		case "init":
			terrain = new TerrainSection(data);
			break;
		case "changeTerrain":
			terrain.currentTerrain = data;
			break;
		case "changeSeed":
			terrain.seed = data;
			break;
		case "controlCollision":

		case "generate":
			terrain.generate(data);
			self.postMessage({id: id, data: terrain.imageData });
			break;
	}
};