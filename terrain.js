class Terrain extends Array {
	constructor(width, height, seed = Math.random()) {
		super();
		console.time("new terrain");
		this.width = width;
		this.height = height;
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
	clear() {
		this.canvasData.clear();
	}
	generateNew(seed = Math.random()) {
		console.time("generate");
		this.clear();
		this.seed = seed;
		noise.seed(seed);
		for (let x = 0; x < this.width; x++) {
			this[x].terrainHeight = Math.round(((noise.simplex2(x / 500, 100000) + 1) / 10 + 0.2) * this.height);
			this[x].grassThickness = Math.round((noise.simplex2(100000, x / 10) + 1.5) * 3.5);
			for (let y = 0; y < this[x].length; y++) {
				this[x][y].generateNew();
			}
		}
		this.canvasData.update();
		console.timeEnd("generate");
	}
	aktualizace() {
		imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		terain(imageData.data);
		context.putImageData(imageData, 0, 0);
	}
}




class TerrainColumn extends Array {
	constructor(table, x) {
		super();
		this.table = table;
		this.x = x;
		this.terrainHeight = 0;
		this.grassThickness = 0;
		for (let y = 0; y < this.table.height / 5 * 2; y++) {//FIXME:  / 5 * 2
			this[y] = new TerrainBlock(this, y);
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
	}
	generateNew() {
		this.distanceFromGround = this.column.terrainHeight - this.y;
		const scale = 1 / 50
		if (this.distanceFromGround>=0) {
			let n = (noise.simplex2(this.x * scale, this.y * scale) + 1) / 2;
			if (n > 0.75 && false) {
				this.color[0] = 204 - 89 * (n - 0.75) * 4;
				this.color[1] = 88 - 38 * (n - 0.75) * 4;
			} else {
				this.color[0] = 0;
				this.color[1] = 255;
			}
			this.color[3] = 255;
			this.canvasData.setPixel(this.x, this.y, this.color);
		}
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
	coordinatsToIndex(x, y) {
		return (x + (this.height - 1 - y) * this.width) * 4;
	}
	setPixel(x, y, color) {
		const startIndex = this.coordinatsToIndex(x, y);
		this.data[startIndex] = color[0];
		this.data[startIndex + 1] = color[1];
		this.data[startIndex + 2] = color[2];
		this.data[startIndex + 3] = color[3];
	}
	getPixel(x, y) {
		const startIndex = this.coordinatsToIndex(x, y);
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
}