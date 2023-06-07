const presence = new Presence({
		clientId: "",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets {
	Logo = "",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		{ pathname, href } = document.location,
		pathList = pathname.split("/").filter(Boolean);

	switch (pathList[0]) {
		case "play": {
			const gameElement = document.querySelector<HTMLDivElement>(
				"[class*='ScrabbleGame_rightGamePanel'] > div > div:nth-child(2)"
			);
			if (gameElement) {
				if (
					document.querySelector<HTMLImageElement>(
						"[src*='roundSummaryBackground']"
					)
				)
					presenceData.details = "Viewing round summary";
				else {
					presenceData.details = `Playing ${gameElement.textContent.replace(
						/\s{2}/,
						""
					)}`;
					presenceData.state = `My score: ${
						document.querySelector<HTMLDivElement>(".game_player_score_block")
							.textContent
					} | My time remaining: ${
						document.querySelector<HTMLDivElement>(".game_player_timer_block")
							.textContent
					}`;
					presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
						"[class*='switched_active'] [class*='Avatar'] img"
					).src;
					presenceData.smallImageText = document.querySelector<HTMLSpanElement>(
						".game_player_info.switched_active_text"
					).textContent;
				}
			} else {
				presenceData.details = "Setting up a game";
				switch (pathList[1]) {
					case "ai":
						presenceData.state = "Playing against AI";
						break;
					case "friend":
						presenceData.state = "Playing with friends";
						break;
					case "online":
						presenceData.state = "Playing online";
						break;
				}
			}
			break;
		}
		case "dictionary": {
			const input =
				document.querySelector<HTMLInputElement>(".dictionary-input");
			if (input.value) {
				presenceData.details = `Checking if ${input.value} is a word`;
				if (
					document.querySelector("[class*='Dictionary'] [class*='IcoMoon'].sad")
				) {
					presenceData.state = "It's not a word";
				} else {
					const definition = document.querySelector<HTMLSpanElement>(
						"[class*='Dictionary'] > div:nth-child(2) > div > div > div:nth-child(2) > div > div:nth-child(2) [class*='Textstyle']"
					).textContent;
					presenceData.state = "It's a word";
					presenceData.smallImageKey = Assets.Question;
					presenceData.smallImageText =
						definition.length < 256
							? definition
							: `${definition.slice(0, 253)}...`;
				}
			} else presenceData.details = "Viewing the dictionary";
			break;
		}
		case "word-finder": {
			presenceData.details = "Finding words";
			presenceData.state = `Letters: ${document.querySelector<HTMLInputElement>(
				document.querySelector<HTMLInputElement>("[class*='WordFinderSearch']")
					.value ?? "(none)"
			)}`;
			break;
		}
		case "news-blog": {
			if (pathList[1] === "category") {
				presenceData.details = "Viewing blog category";
				presenceData.state = document.querySelector<HTMLSpanElement>(
					"[class*='NewsBlogHeader'] [class*='CategoryContent'] span:nth-child(2)"
				).textContent;
			} else if (pathList[1] === "author") {
				presenceData.details = "Viewing blog author";
				presenceData.state = document.querySelector<HTMLSpanElement>(
					"[class*='NewsBlogHeader'] [class*='AuthorContent'] span:nth-child(2)"
				).textContent;
			} else if (pathList[1]) {
				const image = document.querySelector<HTMLImageElement>(
					"[class*='AuthorBlogAvatar']"
				);
				presenceData.details = "Reading a blog post";
				presenceData.state =
					document.querySelector<HTMLSpanElement>(
						".individual-title"
					).textContent;
				presenceData.smallImageKey = image.src;
				presenceData.smallImageText = image.nextElementSibling.textContent;
				presenceData.buttons = [{ label: "Read Post", url: href }];
			} else {
				presenceData.details = "Viewing the blog";
			}
			break;
		}
	}

	presence.setActivity(presenceData);
});
