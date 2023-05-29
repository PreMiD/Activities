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

const goodcopbadcop: GamePresence = {
	logo: "https://i.imgur.com/0yaI6bd.png",
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
				case "playerTurn":
					data.state = "Taking an action";
					break;
				case "chooseCardToInvestigate":
					data.state = "Investigating an Integrity Card";
					break;
				case "askInvestigateReaction":
					data.state = "Reacting to an Investigate action";
					break;
				case "chooseCardToRevealForArm":
				case "chooseCardToRevealForEquip":
					data.state = "Revealing an Integrity Card";
					break;
				case "askShootReaction":
					data.state = "Reacting to a Shoot or Bite action";
					break;
				case "discardOutOfTurn":
				case "discardEquipment":
					data.state = "Discarding Equipment";
					break;
				case "chooseEquipmentToPlayOnYourTurn":
				case "chooseEquipmentToPlayReactEndOfTurn":
				case "chooseEquipmentToPlayReactInvestigate":
				case "chooseEquipmentToPlayReactShoot":
				case "chooseEquipmentToPlayReactBite":
					data.state = "Playing Equipment";
					break;
				case "askAimMustReaim":
				case "askAim":
				case "aimAtPlayer":
					data.state = "Choosing a new target";
					break;
				case "askEndTurnReaction":
					data.state = "Reacting to the end of a turn";
					break;
				case "chooseEquipmentTargetOutOfTurn":
				case "afterAimedOutOfTurn":
				case "afterDiscardedOutOfTurn":
					data.state = "Choosing an Equipment target";
					break;
				case "askAimOutOfTurn":
					data.state = "Aiming a gun";
					break;
				case "chooseIntegrityCards":
				case "choosePlayer":
					data.state = "Targeting an Integrity Card with Equipment";
					break;
				case "chooseActiveOrHandEquipmentCard":
					data.state = "Giving Equipment to another player";
					break;
				case "chooseAnotherPlayer":
				case "choosePlayerNoCancel":
					data.state = "Targeting a player with Equipment";
					break;
				case "rollInfectionDie":
					data.state = "Rolling the Infection Die";
					break;
				case "askBiteReaction":
					data.state = "Reacting to a Bite action";
					break;
				case "gameEnd":
					data.state = "Viewing game results";
					break;
			}
		} else data.state = `Waiting for ${activePlayerData.name}`;
		return data;
	},
};
export default goodcopbadcop;
