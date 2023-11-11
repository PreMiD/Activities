export const name = "TimeJinx";
export const logo = "https://i.imgur.com/KZUZlz4.png";

export function getPresenceData({
	playerState,
}: GameCallbackParams): PresenceData {
	switch (playerState.kind) {
		case "lobby": {
			return { state: "Waiting in lobby" };
		}
		case "postGame": {
			return { state: "Viewing the results" };
		}
		case "guessing": {
			return {
				state: `Answering a prompt: "${
					playerState.prompt
				}"`
			};
		}
		case "sussing": {
			return {
				state: `Sussing out the impostor: ${
					playerState.prompt
				}`
			};
		}
		case "choosing": {
			return {
				state: `Choosing an answer: ${
					playerState.prompt
				}`
			};
		}
		default: {
			return { state: "Waiting" };
		}
	}
}
