class Vector {
	constructor(x, y) {
		if (x == undefined || y == undefined) {
			let angle = game.actualPlayer.tank.cannonAngle;
			let speed = game.actualPlayer.tank.firePower / 100 * DefaultAmmoSpeed;
			let vector = vectorToXY([angle, speed]);
			x = vector[0];
			y = vector[1];
		}
		this.x = x;
		this.y = y;
	}
	set angle(angle) {
		let length = this.length;
		this._setAngleAndLength(angle, length);
	}
	get angle() {
		return Math.atan2(this.y, this.x);
	}
	set length(length) {
		let angle = this.angle;
		this._setAngleAndLength(angle, length);
	}
	get length() {
		return pythagoras([this.x, this.y]);
	}
	get copy() {
		return new Vector(this.x, this.y);
	}
	setAngleAndLength(angle, length) {
		this.x = Math.cos(angle) * length;
		this.y = Math.sin(angle) * length;
	}
}




let sin = Math.sin,
	asin = Math.asin,
	cos = Math.cos,
	acos = Math.acos,
	atan2 = Math.atan2,
	sqrt = Math.sqrt,
	PI = Math.PI,
	round = Math.round,
	ceil = Math.ceil,
	floor = Math.floor,
	random = Math.random,
	abs = Math.abs,
	min = Math.min,
	max = Math.max,
	pow = Math.pow;




function XYToVector(xy) {
	return [atan2(xy[1], xy[0]), pythagoras([xy[0], xy[1]])];
}

function vectorToXY(vector) {
	return [cos(vector[0]) * vector[1], sin(vector[0]) * vector[1]];
}




function pythagoras(xy, xy2) {
	xy2 = xy2 || [0, 0];
	return sqrt((xy[0] - xy2[0]) ** 2 + (xy[1] - xy2[1]) ** 2);
}




function calculateAngle(x1, y1, x2, y2) {
	return Math.atan2(y2 - y1, x2 - x1);
}

function rotateAroundPoint(x, y, angle, centerx, centery) {
	let dx = x - centerx;
	let dy = y - centery;
	vector = new Vector(dx, dy);
	vector.angle += angle;//ToDo: maybe minus???
	return [vector.x + centerx, vector.y + centery];
}
