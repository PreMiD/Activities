export const tag = "auction";
export const name = "Bidiots";
export const logo = "https://i.imgur.com/baDEinm.png";

export function getPresenceData(): PresenceData {
	const { id } = document.querySelector<HTMLDivElement>(
		".auction-page:not(.pt-page-off)"
	);
	switch (id) {
		case "state-lobby": {
			return { state: "Waiting in lobby" };
		}
		case "state-logo": {
			return { state: "Watching tutorial" };
		}
		case "state-draw": {
			return { state: "Creating a piece of art" };
		}
		case "state-done-drawing": {
			return { state: "Waiting for other players to finish drawing" };
		}
		case "state-auction": {
			return { state: "Bidding on art" };
		}
		case "state-post-game": {
			return { state: "Viewing results" };
		}
	}
}
