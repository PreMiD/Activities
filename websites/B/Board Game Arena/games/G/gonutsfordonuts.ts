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

const gonutsfordonuts: GamePresence = {
	logo: "https://i.imgur.com/IuzQvFC.png",
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
				case "placeBids":
					data.state = "Bidding for a donut";
					break;
				case "actionRaspberryFrosted":
					data.state = "Discarding a donut";
					break;
				case "actionBearClaw":
					data.state = "Stealing a donut";
					break;
				case "actionStrawberryGlazed":
					data.state = "Discarding another player's donut";
					break;
				case "actionFrenchCruller":
					data.state = "Discarding donuts";
					data.state = "Discarding donuts";
					break;
				case "actionCinnamonTwist":
					data.state = "Passing a donut to the next player";
					break;
				case "actionSprinkled":
				case "actionSprinkledSelectPlayer":
					data.state = "Giving a donut to another player";
					break;
				case "actionDoubleChocolate":
					data.state = "Selecting a donut to keep";
					break;
				case "actionRedVelvet":
				case "actionDayOldDonuts":
					data.state = "Selecting donuts from the discard pile";
					break;
				case "myGameEnd":
				case "gameEnd":
					data.state = "Viewing game results";
					break;
			}
		} else data.state = `Waiting for ${activePlayerData.name}`;
		return data;
	},
};
export default gonutsfordonuts;
