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

const viticulture: GamePresence = {
	logo: "https://i.imgur.com/GJbBPdd.png",
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
				case "mamaPapaChoose":
					data.state = "Choosing mama and papa";
					break;
				case "papaOptionChoose":
					data.state = "Choosing papa option";
					break;
				case "springChooseWakeup":
					data.state = "Choosing wake-up row";
					break;
				case "seasonWorkers":
					data.state = "Placing a worker";
					break;
				case "fallChooseCard":
					data.state = "Drawing a visitor card";
					break;
				case "plant":
					data.state = "Planting a field";
					break;
				case "makeWine":
					data.state = "Making wine";
					break;
				case "playYellowCard":
					data.state = "Playing a summer visitor card";
					break;
				case "playBlueCard":
					data.state = "Playing a winter visitor card";
					break;
				case "fillOrder":
					data.state = "Filling a wine order";
					break;
				case "chooseVisitorCardDraw":
					data.state = "Drawing a visitor card";
					break;
				case "chooseCards":
					data.state = "Choosing cards";
					break;
				case "chooseOptions":
					data.state = "Choosing an option";
					break;
				case "executeLocation":
					data.state = "Executing a location effect";
					break;
				case "playCardSecondOption":
					data.state = "Playing a visitor card";
					break;
				case "takeActionPrev":
					data.state = "Taking an action in a previous season";
					break;
				case "allBuild":
					data.state = "Building a structure";
					break;
				case "allChoose":
					data.state = "Exchanging resources";
					break;
				case "allPlant":
					data.state = "Planting a vine card";
					break;
				case "allGiveCard":
					data.state = "Giving a card";
					break;
				case "discardVines":
					data.state = "Discarding vine cards";
					break;
				case "discardCards":
					data.state = "Discarding excess cards";
					break;
				case "gameEnd":
					data.state = "Viewing game results";
					break;
			}
		} else data.state = `Waiting for ${activePlayerData.name}`;
		return data;
	},
};
export default viticulture;
