const presence = new Presence({
		clientId: "1248642612169150594",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets { // Other default assets can be found at index.d.ts
	Logo = "https://codeberg.org/Codeberg/Design/raw/commit/ac514aa9aaa2457d4af3c3e13df3ab136d22a49a/logo/icon/png/codeberg-logo_icon_blue-512x512.png",
}

presence.on("UpdateData", async () => {
	let presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
		startTimestamp: browsingTimestamp,
	};

	const pages: Record<string, PresenceData> = {
			pulls: {
				details: "Viewing pull requests",
			},
			notifications: {
				details: "Viewing notifications",
			},
			issues: {
				details: "Viewing issues",
			},
			milestones: {
				details: "Viewing milestones",
			},
			"notifications/subscriptions": {
				details: "Viewing subscribed notifications",
			},
			"user/settings": {
				details: "Editing user settings",
			},
			"user/login": {
				details: "Logging in",
			},
			"user/cbrgp/0XUjCUW": {
				details: "Signing up",
			},
			"explore/repos": {
				details: "Exploring repositories",
			},
			"explore/users": {
				details: "Exploring users",
			},
			"explore/organizations": {
				details: "Exploring organizations",
			},
			"org/create": {
				details: "Creating an organization",
			},
			"repo/create": {
				details: "Creating a repository",
			},
			"repo/migrate": {
				details: "Migrating a repository",
			},
		},
		{ pathname, href } = document.location;

	for (const [path, data] of Object.entries(pages))
		if (pathname.endsWith(`/${path}`))
			presenceData = { ...presenceData, ...data };

	// Handle users
	if (
		document.querySelector(".user.profile") &&
		!document.querySelector(".user.profile.settings")
	) {
		const profileDisplayName = document
				.querySelector(".profile-avatar-name")
				.querySelector(".header")?.textContent,
			// Returns as {name} · {pronouns} so I have to split it
			profileName = document
				.querySelector(".profile-avatar-name")
				.querySelector(".username")
				.textContent.split(" ")[0];

		let name: string;
		if (!profileDisplayName) name = profileName;
		else name = `${profileDisplayName} (${profileName})`;

		presenceData.details = `Viewing profile: ${name}`;
		presenceData.buttons = [
			{
				label: "View profile",
				url: href,
			},
		];
		presenceData.largeImageKey = `${href.split("?")[0]}.png`;
		presenceData.smallImageKey = Assets.Logo;
	}

	// Handle repos
	if (
		document.querySelector(".repository") &&
		!document.querySelector(".repository.new")
	) {
		const repoAvatar = document
				.querySelector(".flex-item-leading")
				.querySelector("img"),
			repoTitle = document
				.querySelector(".flex-item-main")
				.querySelector(".flex-item-title")
				.textContent.trim();

		if (repoAvatar) {
			presenceData.largeImageKey = repoAvatar.src;
			presenceData.smallImageKey = Assets.Logo;
		} else presenceData.largeImageKey = Assets.Logo;

		presenceData.buttons = [
			{
				label: "View repository",
				url: href,
			},
		];

		const repoPages: Record<string, PresenceData> = {
			"": {
				details: `Viewing repository: ${repoTitle}`,
			},
			issues: {
				details: `Viewing ${repoTitle}'s issues`,
			},
			pulls: {
				details: `Viewing ${repoTitle}'s pull requests`,
			},
			activity: {
				details: `Viewing ${repoTitle}'s public activity`,
			},
			settings: {
				details: `Editing ${repoTitle}'s settings`,
			},
			releases: {
				details: `Viewing ${repoTitle}'s releases`,
			},
			projects: {
				details: `Viewing ${repoTitle}'s projects`,
			},
			actions: {
				details: `Viewing ${repoTitle}'s actions`,
			},
			packages: {
				details: `Viewing ${repoTitle}'s packages`,
			},
			branches: {
				details: `Viewing ${repoTitle}'s branches`,
			},
			tags: {
				details: `Viewing ${repoTitle}'s tags`,
			},
			forks: {
				details: `Viewing ${repoTitle}'s forks`,
			},
			watchers: {
				details: `Viewing ${repoTitle}'s watchers`,
			},
			stars: {
				details: `Viewing ${repoTitle}'s stargazers`,
			},
		};

		for (const [path, data] of Object.entries(repoPages)) {
			if (pathname.includes(`/${path}`)) {
				presenceData = {
					...data,
					...presenceData,
				};
			}
		}
	}

	// Handle orgs
	if (document.querySelector(".organization.profile")) {
		presenceData.details = `Viewing organization: ${
			document
				.querySelector("head")
				.querySelector("title")
				.textContent.split(" ")[0]
		}`;
		presenceData.buttons = [
			{
				label: "View organization",
				url: href,
			},
		];
		presenceData.largeImageKey = document
			.querySelector(".organization")
			.querySelector("img").src;
		presenceData.smallImageKey = Assets.Logo;
	}

	presence.setActivity(presenceData);
});
