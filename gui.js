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
		switchScreen("shopScreen");
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
	let left;
	for (let i = 0; i < clouds.length; i++) {
		left = parseFloat(clouds[i].style.left) + game.windCurrent / 20;
		clouds[i].style.left = left + "em";
		if (left < -251 || left > 2561) {
			cloud = clouds.splice(i, 1)[0];
			cloud.parentNode.removeChild(cloud);
			i--;
		}
	}



	if (game && Math.random() < Math.abs(game.windCurrent) / 12000) generateCloud();
}, 1000 / 60);

const minx = 50;
const maxx = 350;
const miny = 75;
const maxy = 200;
function generateCloud(left) {
	let cloud = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	cloud.classList.add("cloud");
	let width = 250 * Math.random() + 50;
	left = left || game.windCurrent > 0 ? (-width) : 2560;
	cloud.style.left = left + "em";
	cloud.style.width = width + "em";
	cloud.style.top = (50 + Math.random() * 200) + "em";
	cloud.setAttribute("preserveAspectRatio", "none");
	cloud.setAttribute("viewBox", "0 0 400 300");
	let html = ""/* `
	<circle cx="350" cy="250" r="50"></circle>
	<circle cx="50" cy="250" r="50"></circle>
	<rect x="50" y="200" width="300" height="100"></rect>` */;
	for (let i = 0; i < 200; i++) {
		let x = (noise.simplex2(Math.random() * 999, Math.random() * 999) + 1) * (maxx - minx) / 2 + minx;
		let y = Math.abs(noise.simplex2(Math.random() * 999, Math.random() * 999)) * -1 * (maxy - miny) + maxy + 40;
		let r = Math.random() * 50 + 10;
		html += `
	<circle cx="${x}" cy="${y}" r="${r}"></circle>`;
	}
	cloud.innerHTML = html;
	clouds.push(cloud);
	document.querySelector("#gamePlane").appendChild(cloud);
}

const keys = new Array(256);
document.body.addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
	if (e.keyCode == 16) { game.nextAmmo(); }
	else if (e.keyCode == 17) game.previousAmmo();
});
document.body.addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
});
setInterval(() => {
	if (keys[32]) game.actualPlayer.shoot();
	if (keys[87]) game.setFirePower(game.actualPlayer.tank.firePower + 0.5);
	if (keys[83]) game.setFirePower(game.actualPlayer.tank.firePower - 0.5);
	if (keys[69]) game.setAim(game.actualPlayer.tank.aim + 0.5);
	if (keys[81]) game.setAim(game.actualPlayer.tank.aim - 0.5);
}, 1000 / 60);