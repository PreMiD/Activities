const presence = new Presence({
		clientId: "1047217921685991462",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "logo",
			startTimestamp: browsingTimestamp,
		},
		{ pathname, hostname } = document.location,
		pathSplit = pathname.split("/").filter(x => x);

	switch (hostname) {
		case "modrinth.com": {
			switch (pathSplit[0]) {
				case "user": {
					presenceData.details = `Browsing ${pathSplit[1]}'s profile`;
					presenceData.buttons = [
						{
							label: "View Profile",
							url: `https://modrinth.com/user/${pathSplit[1]}`,
						},
					];
					break;
				}
				case "settings": {
					presenceData.details = "Browsing profile settings";
					break;
				}
				case "mods": {
					presenceData.details = "Looking for wonderful mods";
					break;
				}
				case "mod": {
					presenceData.state = `${
						document.querySelector<HTMLHeadingElement>("h1.title").textContent
					}`;
					presenceData.buttons = [
						{
							label: "View Mod",
							url: `https://modrinth.com/mod/${pathSplit[1]}`,
						},
					];

					switch (pathSplit[2]) {
						case "gallery": {
							presenceData.details = "Browsing mod gallery";
							break;
						}
						case "changelog": {
							presenceData.details = "Browsing mod changelog";
							break;
						}
						case "versions": {
							presenceData.details = "Browsing mod versions";
							break;
						}
						case "settings": {
							presenceData.details = "Browsing project settings";
							break;
						}
						default: {
							presenceData.details = "Browsing mod description";
						}
					}
					break;
				}
				case "plugins": {
					presenceData.details = "Looking for useful plugins";
					break;
				}
				case "plugin": {
					presenceData.state = `${
						document.querySelector<HTMLHeadingElement>("h1.title").textContent
					}`;
					presenceData.buttons = [
						{
							label: "View Plugin",
							url: `https://modrinth.com/plugin/${pathSplit[1]}`,
						},
					];

					switch (pathSplit[2]) {
						case "gallery": {
							presenceData.details = "Browsing plugin gallery";
							break;
						}
						case "changelog": {
							presenceData.details = "Browsing plugin changelog";
							break;
						}
						case "versions": {
							presenceData.details = "Browsing plugin versions";
							break;
						}
						case "settings": {
							presenceData.details = "Browsing project settings";
							break;
						}
						default: {
							presenceData.details = "Browsing plugin description";
						}
					}
					break;
				}
				case "resourcepacks": {
					presenceData.details = "Looking for a beautiful resourcepack";
					break;
				}
				case "resourcepack": {
					presenceData.state = `${
						document.querySelector<HTMLHeadingElement>("h1.title").textContent
					}`;
					presenceData.buttons = [
						{
							label: "View Resourcepack",
							url: `https://modrinth.com/resourcepack/${pathSplit[1]}`,
						},
					];

					switch (pathSplit[2]) {
						case "gallery": {
							presenceData.details = "Browsing resourcepack gallery";
							break;
						}
						case "changelog": {
							presenceData.details = "Browsing resourcepack changelog";
							break;
						}
						case "versions": {
							presenceData.details = "Browsing resourcepack versions";
							break;
						}
						case "settings": {
							presenceData.details = "Browsing project settings";
							break;
						}
						default: {
							presenceData.details = "Browsing resourcepack description";
						}
					}
					break;
				}
				case "modpacks": {
					presenceData.details = "Looking for a nice modpack";
					break;
				}
				case "modpack": {
					presenceData.state = `${
						document.querySelector<HTMLHeadingElement>("h1.title").textContent
					}`;
					presenceData.buttons = [
						{
							label: "View Modpack",
							url: `https://modrinth.com/modpack/${pathSplit[1]}`,
						},
					];

					switch (pathSplit[2]) {
						case "gallery": {
							presenceData.details = "Browsing modpack gallery";
							break;
						}
						case "changelog": {
							presenceData.details = "Browsing modpack changelog";
							break;
						}
						case "versions": {
							presenceData.details = "Browsing modpack versions";
							break;
						}
						case "settings": {
							presenceData.details = "Browsing project settings";
							break;
						}
						default: {
							presenceData.details = "Browsing modpack description";
						}
					}
					break;
				}
				case "notifications": {
					presenceData.details = "Checking notifications";
					break;
				}
				case "dashboard": {
					presenceData.details = "Looking into dashboard";
					break;
				}
				case "legal": {
					switch (pathSplit[1]) {
						case "terms": {
							presenceData.details = "Reading Terms and Conditions";
							break;
						}
						case "privacy": {
							presenceData.details = "Reading Privacy Policy";
							break;
						}
						case "rules": {
							presenceData.details = "Reading Content Rules";
							break;
						}
						case "security": {
							presenceData.details = "Security Notice";
							break;
						}
					}
					break;
				}
				default: {
					presenceData.details = "Browsing home page";
				}
			}
			break;
		}
		case "docs.modrinth.com": {
			switch (pathSplit[0]) {
				case "docs": {
					switch (pathSplit[1]) {
						case "tutorials": {
							presenceData.details = "Browsing docs tutorials";
							break;
						}
						case "details": {
							presenceData.details = "Reading about the API";
							break;
						}
						case "modpacks": {
							presenceData.details = "Reading about modpacks";
							break;
						}
						default: {
							presenceData.details = "Browsing API information";
							break;
						}
					}
					break;
				}
				case "api-spec": {
					presenceData.details = "Browsing API documentation";
					break;
				}
				default: {
					presenceData.details = "Browsing docs";
				}
			}
			break;
		}
		case "blog.modrinth.com": {
			if (document.querySelector<HTMLHeadingElement>("h1.post-title__text")) {
				presenceData.buttons = [
					{
						label: "View Blog Post",
						url: `https://blog.modrinth.com/${pathSplit[0]}`,
					},
				];
				presenceData.details = "Reading blog post";
				presenceData.state = document.querySelector<HTMLHeadingElement>(
					"h1.post-title__text"
				).textContent;
			} else presenceData.details = "Browsing blog";
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
