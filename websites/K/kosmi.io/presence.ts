const presence = new Presence({
		clientId: "813518808634621952",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

let details: string,
	state: string,
	smallImageKey: string,
	activityName: HTMLDivElement,
	userCount: number;

const noGames: string[] = [
	"Video Chat",
	"Web view",
	"Paint",
	"Table",
	"Virtual room",
	"Watch Party",
];

const enum Assets {
	Kosmimain = "https://cdn.discordapp.com/app-assets/813518808634621952/813519353777356830.png?size=512",
	Vcall = "https://cdn.discordapp.com/app-assets/813518808634621952/814488369383997480.png?size=512",
	Gamepad = "https://cdn.discordapp.com/app-assets/813518808634621952/814494719248826378.png?size=512",
	Paintbrush = "https://cdn.discordapp.com/app-assets/813518808634621952/814504609699201034.png?size=512",
}

presence.on("UpdateData", async () => {
	if (location.pathname === "/") {
		details = "Viewing the Home Page...";
		location.hash === "#contactScreen"
			? (state = "Viewing Contact Information")
			: (state = null);
		smallImageKey = Assets.Reading;
	} else if (location.pathname === "/lobby") {
		details = "Browsing public rooms...";
		state = null;
		smallImageKey = Assets.Search;
	} else if (location.pathname.includes("room")) {
		/*Try to get Metadata: Viewers, Game Name, if the elements don't exist, assume the user is on the indexpage */
		try {
			activityName = document.querySelector<HTMLDivElement>(
				'div[class="appTitle-WJ3"]'
			);
			userCount =
				parseInt(
					document
						.querySelectorAll<HTMLDivElement>(
							'div[class="ui tabular swipableMenu-xjk menu"] > a'
						)[1]
						.textContent.trim(),
					10
				) - 1;
		} catch {
			return;
		}
		/* Re-set the index status, as user is likely on the index page again and the Metadata objects exist now */
		details = "Choosing an activity";
		smallImageKey = Assets.Reading;
		/* Show the usercount in the lower text */
		state = userCount === 0 ? "Alone" : `With ${userCount} others`;

		/* This is executed if the user plays a game that is not in the "Special Activities" Array */
		if (activityName && !noGames.includes(activityName.textContent)) {
			details = `Playing ${activityName.textContent}`;
			smallImageKey = Assets.Gamepad;
		} else if (activityName && noGames.includes(activityName.textContent)) {
			switch (
				activityName.textContent /* Proper Grammar for the Activities */
			) {
				case "Watch Party":
					details = `In a ${activityName.textContent}`;
					smallImageKey = Assets.Live;
					break;
				case "Paint":
					details = "Painting";
					smallImageKey = Assets.Paintbrush;
					break;
				case "Table":
					details = "At the Table";
					break;
				default:
					details = `In a ${activityName.textContent}`;
					smallImageKey = Assets.Vcall;
					break;
			}
		}
	}

	const presenceData: PresenceData = {
		largeImageKey:
			"https://cdn.rcd.gg/PreMiD/websites/K/kosmi.io/assets/logo.png",
		smallImageKey,
		details,
		state,
		startTimestamp: browsingTimestamp,
	};

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
