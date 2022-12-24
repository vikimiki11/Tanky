class Terrain extends Array {
	constructor(width, height, terrain, seed = random(), numberOfThreads = Math.floor(navigator.hardwareConcurrency/4*3)) {
		super();
		console.time("new terrain");
		this.width = width;
		this.height = height;
		this._terrain = terrain;
		this._currentTerrain = terrain;
		this.canvas = document.querySelector('canvas');
		this.canvas.width = width;
		this.canvas.height = height;
		this.context = this.canvas.getContext('2d');
		this.context.imageSmoothingEnabled = false;
		this.canvasData = new CanvasData(this.context, this.width, this.height);
		this.numberOfThreads = numberOfThreads;
		this.threads = [];
		this.prepareThreads();
		console.timeEnd("new terrain");
	}
	get terrain() {
		if (!this._terrain) return ceil(random() * 3);
		return this._terrain;
	}
	set terrain(terrain) {
		this._terrain = terrain;
	}
	get currentTerrain() {
		return this._currentTerrain;
	}
	set currentTerrain(terrain) {
		this._currentTerrain = terrain;
		for (let x = 0; x < this.numberOfThreads; x++) {
			this.threads[x].postMessage({
				operation: "changeTerrain",
				data: terrain
			});
		}
	}
	get seed() {
		return this._seed;
	}
	set seed(seed) {
		this._seed = seed;
		for (let x = 0; x < this.numberOfThreads; x++) {
			this.threads[x].postMessage({
				operation: "changeSeed",
				data: seed
			});
		}
	}
	clear() {
		this.canvasData.clear();
		for (let x = 0; x < this.numberOfThreads; x++) {
			this.threads[x].postMessage({
				operation: "clear"
			});
		}
	}
	generate(seed = random()) {
		console.time("generate TerrainBlock");
		this.currentTerrain = this.terrain;
		this.clear();
		this.seed = seed;
		let promiseArray = [],
			promiseResolve;
		for (let x = 0; x < this.numberOfThreads; x++) {
			promiseArray.push(
				new Promise(function (resolve) {
					promiseResolve = resolve;
				})
			);
			this.threads[x].send({
				operation: "generate",
				data: seed
			}, promiseResolve);
		}
		Promise.all(promiseArray).then(async () => {
			for (let i = 0; i < promiseArray; i++) {
				data = await promiseArray[i].then((data) => { data[0] });
				thread = this.threads[i];
				this.canvasData.updateImageDataFromThread(data, thread);
			};
			console.timeEnd("generate TerrainBlock");
			this.canvasData.grainification(1, 4, 15);
			this.canvasData.update();
		});
	}
	controlCollision(x, y) {
		let thread = this.getThreadFromColumn(x);
		if (this[floor(x)] && this[floor(x)][floor(y)])
			return this[floor(x)][floor(y)].isSolid;
		return false;
	}
	distanceFromGround(x, y) {
		let thread = this.getThreadFromColumn(x);
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
		let start = this.getThreadFromColumn(xy[0] - radius).id;
		let end = this.getThreadFromColumn(xy[0] + radius).id;
		let promiseArray = [],
			promiseResolve;
		for (let thread = start; thread <= end; thread++) {
			promiseArray.push(
				new Promise(function (resolve) {
					promiseResolve = resolve;
				})
			);
			this.threads[thread].send({
				operation: "destroyTerrain",
				data: [xy, radius]
			}, promiseResolve);
		}
		Promise.all(promiseArray).then(() => {
			terrain.canvasData.update();
			if (radius >= 200) console.timeEnd("destroyTerrain");
		});
	}
	buildTerrain(xy, radius, color) {
		let start = this.getThreadFromColumn(xy[0] - radius).id;
		let end = this.getThreadFromColumn(xy[0] + radius).id;
		let promiseArray = [],
			promiseResolve;
		for (let thread = start; thread <= end; thread++) {
			promiseArray.push(
				new Promise(function (resolve) {
					promiseResolve = resolve;
				})
			);
			this.threads[thread].send({
				operation: "destroyTerrain",
				data: [xy, radius, color]
			}, promiseResolve);
		}
		Promise.all(promiseArray).then(() => {
			terrain.canvasData.update();
		});
	}
	checkForTankCollision(x, y) {
		let tankCollision = false;
		for (let i = 0; i < game.players.length; i++) {
			tankCollision = game.players[i].tank?.controlCollision(x, y);
			if (tankCollision) break;
		}
		return tankCollision;
	}
	prepareThreads() {
		for (let x = 0; x < this.numberOfThreads; x++) {
			this.threads[x] = newTerrainWorker();
			let thread = this.threads[x];
			thread.id = x;
			thread.start = ceil(x * this.width / this.numberOfThreads);
			thread.end = floor((x + 1) * this.width / this.numberOfThreads);
			thread.width = thread.end - thread.start + 1;
			thread.height = this.height;
			thread.postMessage({
				operation: "init",
				data: {
					width: this.width,
					height: this.height,
					currentTerrain: this.currentTerrain,
					start: thread.start,
					end: thread.end
				}
			});
		}
	}
	getThreadFromColumn(x) {
		return this.threads[floor(x * this.numberOfThreads / this.width)];
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
	updateImageDataFromThread(data, thread) {
		let width = thread.width * 4;
		for (let i = 0; i < data.length; i++) {
			let x = i % width + thread.start * 4;
			let y = floor(i / width);
			this.data[x + y * this.width * 4] = data[i];
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




let workerArrayResponse = [];
function newTerrainWorker() {
	// Proto aby workr fungoval i mimo hostované stránky je nutné ho předělat na Base64
	// Kdyby jsme to neudělaly CORS aby se načetl worker
	// Proto jsem soubor terrainWebWorker.js zkrátil na této stránce https://www.uglifyjs.net/
	// a pak jsem ho převedla na Base64 na této stránce https://www.base64encode.org/
	let worker = new Worker("terrainWebWorker.js");//ToDo: Change to base64
	worker.send = function (data, callback) {
		data.id = workerArrayResponse.length;
		workerArrayResponse.push({ callback, worker, data });
		this.postMessage(data);
	}
	worker.onmessage = (msg) => {
		let data = msg.data.data;
		let id = msg.data.id;
		if (workerArrayResponse[id]) workerArrayResponse[id]?.callback([data, workerArrayResponse[id]]);
	};
	return worker;
}