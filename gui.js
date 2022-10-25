window.addEventListener("resize", changeBaseFontSize);
changeBaseFontSize();
function changeBaseFontSize() {
	var baseFontSize = Math.min(window.innerWidth / 16, window.innerHeight / 9)*9;
	document.body.style.fontSize = baseFontSize + "px";
}




lastScreen = document.querySelector('main > *[style="display:block"]').id;
switchScreenInProgress = false;
endOfSwitchScreen = null;

function switchScreen(screenID) {
	const animationLength = 1000;
	if (switchScreenInProgress || !screenID) return endOfSwitchScreen - Date.now();
	switchScreenInProgress = true;
	endOfSwitchScreen = Date.now() + 2 * animationLength;
	document.body.classList.add("switchIn");
	setTimeout(function () {
		document.getElementById(lastScreen).style.display = "none";
		document.getElementById(screenID).style.display = "block";
		lastScreen = screenID;
		document.body.classList.add("switchOut");
		document.body.classList.remove("switchIn");
		setTimeout(function () {
			switchScreenInProgress = false;
			document.body.classList.remove("switchOut");
		}, animationLength);
	}, animationLength);
}




function fullscreen() {
	if (document.fullscreen) {
		document.exitFullscreen();
	} else {
		document.body.requestFullscreen()
	}
}




function nextStartupScreen() {
	document.querySelector("#setupBasic").style.display = "none";
	document.querySelector("#setupPlayer").style.display = "block";
}




for (let ammo of ammoList) {
	let html = ammo.html;
	document.querySelector("#selectedAmmo").innerHTML += html;
	document.querySelector("#allAmmo").innerHTML += html;
	document.querySelector("#ammoShop").innerHTML += html;
}




for (let gadget of gadgetList) {
	let html = gadget.html;
	document.querySelector("#gadgetShop").innerHTML += html;
}




for (let el of document.querySelectorAll("#allAmmo .ammoRow")) {
	el.addEventListener("click", function () {
		game.actualPlayer.selectedAmmo = el.getAttribute("ammo");
	});
}




for (let el of document.querySelectorAll("#shopScreen :is(.ammoRow, .gadgetRow)")) {
	el.addEventListener("click", function () {
		//ToDo: Buy Ammo function
		type = el.getAttribute("ammo") ? "ammo" : "gadget";
		products = type == "ammo" ? ammoList : gadgetList;
		inventory = type == "ammo" ? game.actualPlayer.ammo : game.actualPlayer.gadget;
		id = parseInt(el.getAttribute(type));
		if (game.actualPlayer.money >= products[id].cost && inventory[id] + products[id].buyAmount < 1000) {
			game.actualPlayer.money -= products[id].cost;
			inventory[id] += products[id].buyAmount;
		}
		game.actualPlayer.updateCSS();
	});
}




const clouds = [];
setInterval(() => {
	//Posun Mraků
	let left;
	for (let i = 0; i < clouds.length; i++) {
		left = parseFloat(clouds[i][0].style.left) + game.windCurrent / 20 * clouds[i][1];
		clouds[i][0].style.left = left + "em";
		if (left < -251 || left > 2561) {
			cloud = clouds.splice(i, 1)[0][0];
			cloud.parentNode.removeChild(cloud);
			i--;
		}
	}
	//Generace Mraků
	if (game && Math.random() < Math.abs(game.windCurrent) / 8000) generateCloud();
}, 1000 / 60);

const minx = 50;
const maxx = 350;
const miny = 75;
const maxy = 200;
function generateCloud(left) {
	let cloud = document.createElement("canvas");
	cloud.classList.add("cloud");
	let speedModifier = Math.random() * 0.5 + 0.5;
	let width = 250 * Math.random() + 50;
	let height = width / 4 * 3;
	left = left ? left : game.windCurrent > 0 ? (-width) : 2560;
	cloud.style.left = left + "em";
	cloud.style.height = height + "em";
	cloud.style.top = (20 + Math.random() * 230) + "em";
	cloud.setAttribute("height", "300");
	cloud.setAttribute("width", "400");
	var ctx = cloud.getContext("2d");
	ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
	for (let i = 0; i < 500; i++) {
		let x = (noise.simplex2(Math.random() * 999, Math.random() * 999) + 1) * (maxx - minx) / 2 + minx;
		let y = Math.abs(noise.simplex2(Math.random() * 999, Math.random() * 999)) * -1 * (maxy - miny) + maxy + 40;
		let r = Math.random() * 20 + 5;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI);
		ctx.fill();
	}
	clouds.push([cloud, speedModifier]);
	document.querySelector("#gamePlane").appendChild(cloud);
}

const keys = new Array(256);
document.body.addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
	if (e.keyCode == 16) { game.nextAmmo(); }
	else if (e.keyCode == 17) game.previousAmmo();
	console.log(e.keyCode);
});
document.body.addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
});
setInterval(() => {
	if (!keys[83] && !keys[87] && (QS = document.querySelector("#firePowerControll input")))game.setFirePower(QS.value);
	if (!keys[69] && !keys[81] && (QS = document.querySelector("#aimControll")))game.setAim(QS.value);
	if (keys[32]) game.actualPlayer.shoot();
	if (keys[87]) game.setFirePower(game.actualPlayer.tank.firePower + 0.5);
	if (keys[83]) game.setFirePower(game.actualPlayer.tank.firePower - 0.5);
	if (keys[69]) game.setAim(game.actualPlayer.tank.aim + 0.5);
	if (keys[81]) game.setAim(game.actualPlayer.tank.aim - 0.5);
}, 1000 / 60);