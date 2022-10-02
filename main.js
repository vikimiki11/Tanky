window.addEventListener("resize", changeBaseFontSize);
changeBaseFontSize();
function changeBaseFontSize() {
	var baseFontSize = Math.min(window.innerWidth / 16, window.innerHeight / 9)*9;
	document.body.style.fontSize = baseFontSize + "px";
}
lastScreen = "startupScreen";
switchScreenInProgress = false;
endOfSwitchScreen = null;
function switchScreen(screenID) {
	animationLength = 1000;
	if (switchScreenInProgress || !screenID) return endOfSwitchScreen;
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