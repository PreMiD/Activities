const presence = new Presence({
		clientId: "807949437922050069",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/PFdbnIf.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/wh885z3.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "https://i.imgur.com/LIRCNuJ.png",
		startTimestamp: browsingTimestamp,
	};

	switch (document.location.hostname) {
		case "sparkedhost.com": {
			if (document.location.pathname.includes("/budget-minecraft-hosting")) {
				presenceData.details = "Minecraft Hosting";
				presenceData.state = "Budget Packages";
			} else if (
				document.location.pathname.includes("/enterprise-minecraft-hosting")
			) {
				presenceData.details = "Minecraft Hosting";
				presenceData.state = "Enterprise Packages";
			} else if (
				document.location.pathname.includes("/singapore-minecraft-hosting")
			) {
				presenceData.details = "Minecraft Hosting";
				presenceData.state = "Singapore Packages";
			} else if (
				document.location.pathname.includes("/extreme-minecraft-hosting")
			) {
				presenceData.details = "Minecraft Hosting";
				presenceData.state = "Extreme Packages";
			} else if (document.location.pathname.includes("/game-hosting")) {
				presenceData.details = "Game Hosting";
				presenceData.state = "Exploring Packages";
			} else if (document.location.pathname.includes("/budget-vps")) {
				presenceData.details = "VPS Hosting";
				presenceData.state = "Budget Packages";
			} else if (document.location.pathname.includes("/premium-vps")) {
				presenceData.details = "VPS Hosting";
				presenceData.state = "Premium Packages";
			} else if (document.location.pathname.includes("/discord-hosting")) {
				presenceData.details = "Discord Bot Hosting";
				presenceData.state = "Exploring Packages";
			} else if (document.location.pathname.includes("/web-hosting")) {
				presenceData.details = "Web Hosting";
				presenceData.state = "Exploring Packages";
			} else if (document.location.pathname.includes("/giftcards")) {
				presenceData.details = "Giftcards";
				presenceData.state = "Treat a friend";
			} else if (document.location.pathname.includes("/about-us")) {
				presenceData.details = "About Us";
				presenceData.state = "People behind Sparked";
			} else if (
				document.location.pathname.includes("/hardware-and-locations")
			) {
				presenceData.details = "Hardware & Locations";
				presenceData.state = "Behind the scenes";
			} else if (document.location.pathname.includes("/contact")) {
				presenceData.details = "Contact Us";
				presenceData.state = "Support & Help";
			} else if (document.location.pathname.includes("/partners")) {
				presenceData.details = "Partners";
				presenceData.state = "The cool kids";
			} else if (document.location.pathname.includes("/help-center")) {
				presenceData.details = "Help Center";
				presenceData.state = "Guides & Tutorials";
			}

			break;
		}
		case "billing.sparkedhost.com": {
			if (document.location.pathname.includes("knowledgebase")) {
				const [article] = document.title.split(" - ");
				if (article === "Knowledgebase")
					presenceData.state = "Browsing Articles";
				else presenceData.state = article;

				presenceData.details = "Knowledgebase";
			} else if (document.location.pathname.includes("clientarea")) {
				presenceData.details = "Client Area";
				presenceData.state = "Account Management";
			} else if (document.location.pathname.includes("cart")) {
				presenceData.details = "Shopping";
				presenceData.state = "Server Hosting";
			} else if (document.location.pathname.includes("announcements")) {
				presenceData.details = "Announcements";
				presenceData.state = "Reading The News";
			} else if (document.location.pathname.includes("affiliates")) {
				presenceData.details = "Affiliates";
				presenceData.state = "Signups = $$$";
			} else if (document.location.pathname.includes("submitticket")) {
				presenceData.details = "Support Ticket";
				presenceData.state = "Opening a Ticket";
			}

			break;
		}
		case "control.sparkedhost.us": {
			const serverName = document.title.split(" | ");
			presenceData.smallImageKey = "pterodactyl";
			presenceData.smallImageText = "Pterodactyl";
			if (document.location.pathname === "/") {
				presenceData.details = "Viewing Servers";
				presenceData.state = "Lookin' at the glory.";
			} else if (document.location.pathname.includes("admin")) {
				[, presenceData.state] = document.title.split(" - ");
				presenceData.details = "Admin Area";
			} else if (document.location.pathname.includes("files")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "File Manager";
			} else if (document.location.pathname.includes("databases")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Databases";
			} else if (document.location.pathname.includes("schedules")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Schedules";
			} else if (document.location.pathname.includes("users")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Subusers";
			} else if (document.location.pathname.includes("backups")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Backups";
			} else if (document.location.pathname.includes("subdomains")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Subdomains";
			} else if (document.location.pathname.includes("network")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Network";
			} else if (document.location.pathname.includes("startup")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Startup";
			} else if (document.location.pathname.includes("settings")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Settings";
			} else if (document.location.pathname.includes("server")) {
				presenceData.details = `Managing ${serverName[0]}`;
				presenceData.state = "Watching Console";
			} else if (document.location.pathname.includes("account")) {
				presenceData.details = "Account Settings";
				presenceData.state = "Changing information";
			}

			break;
		}
		case "status.sparkedhost.com": {
			presenceData.smallImageKey = "hetrix";
			presenceData.smallImageText = "HetrixTools";
			presenceData.details = "Server Status";
			presenceData.state = "Who broke it?";

			break;
		}
		default:
			if (
				document.location.hostname.startsWith("altar") ||
				document.location.hostname.startsWith("web-01") ||
				document.location.hostname.startsWith("cloud852")
			) {
				presenceData.details = "Web Hosting";
				presenceData.state = "Managing cPanel";
			}
	}

	if (!presenceData.details) presence.setActivity();
	else presence.setActivity(presenceData);
});
