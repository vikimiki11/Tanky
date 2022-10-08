let selectedTerrain;
let generateCaves;
let players = [];
let maxPlayers;
let game;
function selectTerrain(terrain/* undefined: try to fatch it, 0:random, 1:mountains, 2: forest, 3:desert */, caves/* undefined: try to fatch it, 0:no, 1:yes */, players = parseInt(document.querySelector("#playerCount").value)) {
	if(terrain === undefined) {
		for(let element of document.querySelectorAll("input[name='terrain']")) {
			if(element.checked) {
				terrain = element.value;
				break;
			}
		}
	}
	selectedTerrain = terrain;

	const checkboxQS = "#setupBasic > div > input[type=checkbox]"
	if (caves === undefined && document.querySelector(checkboxQS)) caves = document.querySelector(checkboxQS).checked;
	generateCaves = caves;

	maxPlayers = players;

	return [terrain, caves];
}




class Player {
	constructor(id, name, color, AI) {
		this.id = id;
		this.name = name;
		this.color = color;
		this.AI = AI;
		this.money = 1000;
	}
}

function addPlayer(name, color, AI) {
	if (name === undefined) name = document.querySelector("#playerName").value;
	if (color === undefined) color = document.querySelector("#playerColor").value;
	if (AI === undefined) AI = document.querySelector("#AICheckbox").checked;

	players.push(new Player(players.length, name, color, AI));

	if (maxPlayers > players.length) {
		document.querySelector("#playerName").value = "";
		document.querySelector("#playerColor").value = "#000000";
		document.querySelector("#setupPlayer  h2").innerHTML = (players.length + 1) + ". Hráč";
	} else {
		game = setupGame(players, selectedTerrain, generateCaves);
		console.log(game);
		game.start()
	}

	return players[players.length - 1];
}




class Game {
	constructor(players, terrain, caves) {
		this.players = players;
		this.terrain = terrain;
		this.caves = caves;
		this.actualPlayer = -1;
	}

	start() {
		switchScreen("gameScreen");
		this.actualPlayer++;
		this.nextPlayer();
	}

	nextPlayer() {

	}
}
function setupGame(players, terrain, caves) {
	return new Game(players, terrain, caves);
}