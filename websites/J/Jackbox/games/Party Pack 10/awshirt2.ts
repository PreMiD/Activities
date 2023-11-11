import { uploadFile } from "../../util";

export const name = "Tee-K.O. 2";
export const logo = "https://i.imgur.com/GxrBW3H.png";

let lastImage: string,
	lastImageTime: number = 0;

export async function getPresenceData({
	playerState,
	presence,
}: GameCallbackParams): Promise<PresenceData> {
	switch (playerState.kind) {
		case "lobby": {
			return { state: "Waiting in lobby" };
		}
		case "postGame": {
			return { state: "Viewing the results" };
		}
		case "assembling": {
			return { state: "Assembling a T-Shirt" };
		}
		case "remaking": {
			return { state: "Deciding whether to remake a T-Shirt" };
		}
		case "drawing": {
			const now = Date.now();
			if (now - lastImageTime > 2000) {
				const canvas = document.querySelector("canvas");
				lastImageTime = now;
				lastImage = await uploadFile(
					canvas.toDataURL("image/png"),
					Assets.Writing,
					presence,
				);
			}
			return {
				state: "Drawing a T-Shirt image",
				largeImageKey: lastImage,
			};
		}
		case "writing": {
			return { state: "Writing a T-Shirt slogan" };
		}
		case "voting": {
			return { state: "Voting for a T-Shirt" };
		}
		default: {
			return { state: "Waiting" };
		}
	}
}
