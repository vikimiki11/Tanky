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
		let oldVector = XYToVector([this.x, this.y]);
		this.x = Math.cos(angle) * oldVector[1];
		this.y = -Math.sin(angle) * oldVector[1];
	}
	get angle() {
		return Math.atan2(-this.y, this.x);
	}
	set length(length) {
		let oldVector = XYToVector([this.x, this.y]);
		this.x = Math.cos(oldVector[0]) * length;
		this.y = -Math.sin(oldVector[0]) * length;
	}
	get length() {
		return pythagoras([0, 0], [this.x, this.y]);
	}
}




let sin = Math.sin,
	cos = Math.cos,
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
	return [Math.atan2(-xy[1], xy[0]), Math.sqrt(xy[0] ** 2 + xy[1] ** 2)];
}

function vectorToXY(vector) {
	return [Math.cos(vector[0]) * vector[1], -Math.sin(vector[0]) * vector[1]];
}




function pythagoras(xy, xy2) {
	return Math.sqrt((xy[0] - xy2[0]) ** 2 + (xy[1] - xy2[1]) ** 2);
}




function calculateAngle(x1, y1, x2, y2) {
	return atan2(y2 - y1, x2 - x1);
}

function rotateAroundPoint(x, y, angle, centerx, centery) {
	let x1 = x - point[0];
	let y1 = y - point[1];
	let x2 = x1 * cos(angle) - y1 * sin(angle);
	let y2 = x1 * sin(angle) + y1 * cos(angle);
	return [x2 + point[0], y2 + point[1]];
}
