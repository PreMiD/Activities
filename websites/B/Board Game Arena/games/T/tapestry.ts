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

const tapestry: GamePresence = {
	logo: "https://i.imgur.com/J8kdstx.png",
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
				case "setupChoice":
					data.state = "Choosing a civilization";
					break;
				case "playerTurn":
					data.state = "Taking an action";
					break;
				case "civAbility":
					data.state = "Using a civilization ability";
					break;
				case "playTapestryCard":
					data.state = "Playing a tapestry card";
					break;
				case "upgradeTechnology":
					data.state = "Upgrading a technology";
					break;
				case "benefitChoice":
				case "benefitOption":
					data.state = "Choosing a benefit";
					break;
				case "explore":
					data.state = "Exploring";
					break;
				case "invent":
					data.state = "Inventing";
					break;
				case "conquer":
					data.state = "Conquering";
					break;
				case "conquer_trap":
					data.state = "Playing a trap card";
					break;
				case "conquer_roll":
					data.state = "Choosing a benefit from one die (conquer)";
					break;
				case "research":
					data.state = "Researching";
					break;
				case "placeStructure":
					data.state = "Placing a structure";
					break;
				case "spaceExploration":
					data.state = "Exploring space";
					break;
				case "techBenefit":
					data.state = "Choosing a benefit from one die (technology)";
					break;
				case "resourceChoice":
					data.state = "Choosing resources";
					break;
				case "trackSelect":
					data.state = "Selecting a cube on an advancement track";
					break;
				case "buildingSelect":
					data.state = "Selecting a building";
					break;
				case "bonus":
					data.state = "Applying a bonus";
					break;
				case "gameEnd":
					data.state = "Viewing game results";
					break;
			}
		} else data.state = `Waiting for ${activePlayerData.name}`;
		return data;
	},
};
export default tapestry;
