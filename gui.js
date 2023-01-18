// mění velikost hry podle velikosti okna
window.addEventListener("resize", changeBaseFontSize);
changeBaseFontSize();
function changeBaseFontSize() {
	var baseFontSize = min(window.innerWidth / 16, window.innerHeight / 9)*9;
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



//Připraví rozhraní pro gadgety a ammo
for (let item in Inventory) {
	let type = Inventory[item].type;
	let html = Inventory[item].html;
	if (type == "ammo") {
		document.querySelector("#selectedAmmo").innerHTML += html;
		document.querySelector("#allAmmo").innerHTML += html;
		document.querySelector("#ammoShop").innerHTML += html;
	} else if (type == "gadget") {
		document.querySelector("#gadgetShop").innerHTML += html;
	}
}
//Přepínání ammo
for (let el of document.querySelectorAll("#allAmmo .inventoryRow")) {
	el.addEventListener("click", function () {
		if (!game.blockControls)
			game.actualPlayer.selectedAmmo = el.getAttribute("item");
	});
}
//Nákupy
for (let el of document.querySelectorAll("#shopScreen .inventoryRow")) {
	el.addEventListener("click", function () {
		item = el.getAttribute("shortName");
		Inventory[item].buy();
	});
}




const clouds = [];
setInterval(() => {
	//Posun Mraků
	let left;
	for (let i = 0; i < clouds.length; i++) {
		left = parseFloat(clouds[i][0].style.left) + game.windCurrent / 20 * clouds[i][1];
		clouds[i][0].style.left = left + "em";
		if (left < -251 || left >= terrain.width) {
			cloud = clouds.splice(i, 1)[0][0];
			cloud.parentNode?.removeChild(cloud);
			i--;
		}
	}
	//Generace Mraků
	if (game && random() < abs(game.windCurrent) / 8000) generateCloud();
}, 1000 / 60);

const minx = 50;
const maxx = 350;
const miny = 75;
const maxy = 200;
function generateCloud(left) {
	let cloud = document.createElement("canvas");
	cloud.classList.add("cloud");
	let speedModifier = random() * 0.5 + 0.5;
	let width = 250 * random() + 50;
	let height = width / 4 * 3;
	left = left ? left : game.windCurrent > 0 ? (-width) : terrain.width;
	cloud.style.left = left + "em";
	cloud.style.height = height + "em";
	cloud.style.top = (20 + random() * 230) + "em";
	cloud.setAttribute("height", "300");
	cloud.setAttribute("width", "400");
	var ctx = cloud.getContext("2d");
	ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
	for (let i = 0; i < 500; i++) {
		let x = (noise.simplex2(random() * 999, random() * 999) + 1) * (maxx - minx) / 2 + minx;
		let y = abs(noise.simplex2(random() * 999, random() * 999)) * -1 * (maxy - miny) + maxy + 40;
		let r = random() * 20 + 5;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * PI);
		ctx.fill();
	}
	clouds.push([cloud, speedModifier]);
	document.querySelector("#gamePlane").appendChild(cloud);
}






//Keyboard Controls
const keys = new Array(256);
document.body.addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
	if (e.keyCode == 16) { game?.nextAmmo(); }
	else if (e.keyCode == 17) game?.previousAmmo();
	else if (e.keyCode == 70) fullscreen();
	else if (e.keyCode == 49) console.log("1 ToDo");
	else if (e.keyCode == 50) console.log("2 ToDo");
	else if (e.keyCode == 51) console.log("3 ToDo");
	else if (e.keyCode == 52) console.log("4 ToDo");
	else if (e.keyCode == 82) console.log("Repair Kit ToDo");
	else if (e.keyCode == 88) console.log("X ToDo");
	else if (e.keyCode == 89) console.log("Y ToDo");
	else if (e.keyCode == 67) console.log("C ToDo");
	else if (e.keyCode == 86) console.log("V ToDo");
	else if (e.keyCode == 32) game?.fire();

});
document.body.addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
});

//Mouse Engine Control
document.querySelectorAll("#engineControl .clickable").forEach(el => {
	el.addEventListener("mousedown", function () {
		keys[el.getAttribute("direction") == "left" ? 65 : 68] = true;
	});
});

document.body.addEventListener("mouseup", function () {
	keys[65] = false;
	keys[68] = false;
});


//Keyboard Controls Interval
setInterval(() => {
	if (!keys[83] && !keys[87] && game && game?.actualPlayer.tank && (QS = document.querySelector("#firePowerControl input")) && parseInt(game.actualPlayer.tank.firePower) != parseInt(QS.value)) game.setFirePower(QS.value);
	if (!keys[69] && !keys[81] && game && game?.actualPlayer.tank && (QS = document.querySelector("#aimControl")) && parseFloat(game.actualPlayer.tank.aim) != parseFloat(QS.value)) game.setAim(QS.value);
	if (keys[87]) game?.setFirePower(game.actualPlayer.tank?.firePower + 0.5);
	if (keys[83]) game?.setFirePower(game.actualPlayer.tank?.firePower - 0.5);
	if (keys[69]) game?.setAim(game.actualPlayer.tank?.aim + 0.01);
	if (keys[81]) game?.setAim(game.actualPlayer.tank?.aim - 0.01);
	if (keys[65] && !keys[68]) game?.tankDrive(-1);
	if (keys[68] && !keys[65]) game?.tankDrive(1);
}, 1000 / 60);