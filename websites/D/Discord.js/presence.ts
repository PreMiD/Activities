const presence = new Presence({
		clientId: "639659455126044672",
	}),
	browsingStamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", () => {
	const data: PresenceData = {
		largeImageKey:
			"https://cdn.rcd.gg/PreMiD/websites/D/Discord.js/assets/logo.png",
		startTimestamp: browsingStamp,
	};
	let route = document.location.pathname.split("/");
	switch (document.location.hostname) {
		case "discord.js.org": {
			if (route[1] === "docs") {
				data.smallImageKey = data.largeImageKey;
				data.smallImageText = `${route[3]?.replace(/^[a-z]/i, c =>
					c.toUpperCase()
				)} - ${Number(route[4]?.[0]) ? `v${route[4]}` : `${route[4]}`}`;
				if (route.length === 5) {
					data.details = "Viewing:";
					data.state = `${route[3]?.replace(/^[a-z]/i, c =>
						c.toUpperCase()
					)} About`;
				} else {
					data.details = `Looking for a ${route[5]?.split(":")[1]}:`;
					data.state = `${route[5]?.split(":")[0]}`;
				}
			}

			break;
		}
		case "old.discordjs.dev": {
			route = document.location.hash.split("/");
			if (route.length === 1 || route[1] === "")
				data.details = "Browsing the main page...";
			else if (route[1] === "docs") {
				[, , data.smallImageKey] = route;
				data.smallImageText = `a${data.smallImageKey}a`;

				if (route[4]?.startsWith("search?q=")) {
					data.details = "Searching for:";
					data.state = route[4].slice(9);
				} else if (route[4] === "general") {
					data.details = "Viewing:";
					data.state =
						route[5] === "faq"
							? route[5].toUpperCase()
							: `${route[5]?.replace(/^[a-z]/i, c => c.toUpperCase())}`;
				} else {
					data.details = `Looking for a${
						(route[5]?.split("?scrollTo=")[1] &&
							route[5]?.split("?scrollTo=")[1]?.startsWith("e-")) ||
						route[4] === "examples"
							? "n"
							: ""
					} ${
						route[5]?.split("?scrollTo=")[1] &&
						route[5]?.split("?scrollTo=")[1]?.startsWith("e-")
							? "event"
							: `${
									route[4]?.endsWith("s") && route[4] !== "class"
										? route[4]?.substring(0, route[4]?.length - 1)
										: route[4]?.replace(/^[a-z]/i, c => c.toUpperCase())
							  }`
					}`;
					data.state = `${route[5]?.split("?scrollTo=")[0]}${
						route[5]?.split("?scrollTo=")[1]
							? `#${
									route[5]?.split("?scrollTo=")[1]?.[1] === "-"
										? route[5]?.split("?scrollTo=")[1]?.slice(2)
										: route[5].split("?scrollTo=")[1]
							  }`
							: ""
					}`;
				}
			}
			break;
		}
	}

	presence.setActivity(data);
});
