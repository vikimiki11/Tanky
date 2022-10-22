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