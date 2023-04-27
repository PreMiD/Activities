// TODO
import { GamePresence } from "..";
import {
	getActivePlayerId,
	getCurrentGameState,
	getCurrentGameStateType,
	getPlayerAvatar,
	getPlayerData,
	getPlayerScore,
	getUserPlayerId,
} from "../../util";

const rollandbump: GamePresence = {
	logo: "",
	async getData(presence: Presence) {
		const gameState = await getCurrentGameState(presence),
			activePlayer = await getActivePlayerId(presence),
			gameStateType = await getCurrentGameStateType(presence),
			userPlayer = await getUserPlayerId(presence),
			activePlayerData = await getPlayerData(presence, activePlayer),
			data: PresenceData = {
				smallImageKey: getPlayerAvatar(userPlayer),
				smallImageText: `Score: ${getPlayerScore(userPlayer)}`,
			};
		if (activePlayer === userPlayer || gameStateType !== "activeplayer") {
			switch (gameState) {
				case "gameSetup":
					/*
					{
	"name": "gameSetup",
	"description": "",
	"type": "manager",
	"action": "stGameSetup",
	"transitions": {
		"": 2
	}
}
					*/
					break;
				case "initTurn":
					/*
					{
	"name": "initTurn",
	"type": "manager",
	"action": "stInitTurn",
	"transitions": {
		"startTurn": 10,
		"endGame": 99
	}
}
					*/
					break;
				case "playerTurn":
					/*
					{
	"name": "playerTurn",
	"description": "${actplayer} has ${rerolls} reroll(s) left",
	"descriptionmyturn": "",
	"type": "activeplayer",
	"args": "arg_playerTurn",
	"possibleactions": [
		"reroll",
		"place"
	],
	"transitions": {
		"reroll": 10,
		"dicePlaced": 20
	}
}
					*/
					break;
				case "afterPlay":
					/*
					{
	"name": "afterPlay",
	"type": "manager",
	"action": "stAfterPlay",
	"transitions": {
		"nextPlayer": 2
	}
}
					*/
					break;
				case "gameEnd":
					/*
					{
	"name": "gameEnd",
	"description": "End of game",
	"type": "manager",
	"action": "stGameEnd",
	"args": "argGameEnd"
}
					*/
					break;
				case "gameEnd":
					data.state = "Viewing game results";
					break;
			}
		} else data.state = `Waiting for ${activePlayerData.name}`;
		return data;
	},
};
export default rollandbump;
