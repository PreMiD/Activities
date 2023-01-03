const presence = new Presence({
		clientId: "685611188306051093",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	searchItems = {
		arch: "architecture",
		edition: "offering",
		os: "operating_system",
		page: "page",
		query: "q",
		tab: "tab",
		type: "type",
	},
	/**
	 * Lambda function to ucFirst
	 * @param s string to capitalize
	 */
	capitalize = (s: string): string => {
		return s.charAt(0).toUpperCase() + s.slice(1);
	};

let match: string[];

presence.on("UpdateData", async () => {
	let url: URL,
		params: URLSearchParams,
		selector: Node,
		arch: string,
		owner: string,
		name: string,
		page: string,
		tab: string;

	const presenceData: PresenceData = {
		details: "Unknown page", // Left here as a clue to find missing possible states
		largeImageKey: "https://i.imgur.com/xr2Gulz.png"
	};

	if (document.location.host === "hub.docker.com") {
		presenceData.startTimestamp = browsingTimestamp;

		if (document.location.pathname.match(/^\/(repositories)?$/))
			presenceData.details = "Bowsing own repositories";
		else if (document.location.pathname.match(/^\/settings/))
			presenceData.details = "On settings page";
		else if (document.location.pathname.match(/^\/search/)) {
			url = new URL(document.location.href);
			params = url.searchParams;

			const query: string = params.get(searchItems.query);
			let type: string = params.get(searchItems.type);
			type = (type && decodeURIComponent(type)) || "image";

			let edition: string = params.get(searchItems.edition);
			edition = (edition && decodeURIComponent(edition)) || "";

			let os: string = params.get(searchItems.os);
			os = (os && decodeURIComponent(os)) || null;

			arch = params.get(searchItems.arch);
			arch = (arch && decodeURIComponent(arch)) || null;

			presenceData.details = `Searching for${
				query ? `: ${query}` : ` ${edition} ${type}s`
			}`;

			if (query && edition)
				presenceData.state = `${capitalize(edition)} ${type}s`;
			if (os || arch) {
				presenceData.state = `${os ? `${capitalize(os)} ` : ""}${
					arch ? arch.toUpperCase() : ""
				}`;
			}
		} else if (document.location.pathname.match(/^\/orgs$/))
			presenceData.details = "Browsing organizations";
		else if (
			document.location.pathname.match(/^\/orgs\/([^/]+)(?:\/([^/]+))?/)
		) {
			[, name, tab] = document.location.pathname.match(
				/^\/orgs\/([^/]+)(?:\/([^/]+))?/
			);
			tab = tab || "members";
			presenceData.details = `On org ${tab}page`;
			presenceData.state = `${name}`;
		} else if (document.location.pathname.match(/^\/_\/([^?]+)/)) {
			url = new URL(document.location.href);
			params = url.searchParams;

			[, name] = document.location.pathname.match(/^\/_\/([^?]+)/);

			tab = params.get(searchItems.tab);

			presenceData.details = `On image ${tab ? `${tab} ` : ""}page`;
			presenceData.state = `${name}`;
		} else if (
			document.location.pathname.match(/^\/r\/([^/]+)\/([^/]+)(?:\/([^?]+))?/)
		) {
			url = new URL(document.location.href);
			params = url.searchParams;

			[, owner, name, tab] = document.location.pathname.match(
				/^\/r\/([^/]+)\/([^/]+)(?:\/([^?]+))?/
			);

			page = params.get(searchItems.page);

			presenceData.details = `On image ${tab ?? ""} page${
				page ? ` ${page}` : ""
			}`;
			presenceData.state = `${owner}/${name}`;
		} else if (
			document.location.pathname.match(/^\/layers\/([^/]+)\/([^/]+)\/([^/]+)/)
		) {
			match = document.location.pathname.match(
				/^\/layers\/([^/]+)\/([^/]+)\/([^/]+)/
			);
			url = new URL(document.location.href);
			params = url.searchParams;

			const context: string = params.get("context");
			if (context && context === "repo") {
				presenceData.details = "On personal repository";
				presenceData.state = "Image history";
			} else {
				[, owner, name] = match;
				selector = document.querySelector(".Select-value") || null;
				arch = (selector && selector.textContent) || null;

				presenceData.details = "On image history";
				presenceData.state = `${owner}/${name}:${match[3]} ${arch ?? ""}`;
			}
		} else if (
			document.location.pathname.match(/^\/u\/([^/]+)(?:\/([^/]+))?/)
		) {
			tab = match[2] || "repositories";
			presenceData.details = `On profile ${tab} page`;
			[, presenceData.state] = document.location.pathname.match(
				/^\/u\/([^/]+)(?:\/([^/]+))?/
			);
		} else if (document.location.pathname.match(/^\/repository\/create/))
			presenceData.details = "Creating repository";
		else if (document.location.pathname.match(/^\/repository(?:\/([^/?]+))+/)) {
			url = new URL(document.location.href);
			params = url.searchParams;

			presenceData.details = "On personal repository";

			[, tab] = document.location.pathname.match(
				/^\/repository(?:\/([^/?]+))+/
			);

			page = params.get(searchItems.page);
			selector = document.querySelector(
				"#contextNav > div > div.styles__breadcrumbs___18Yr8 > div:nth-child(2) > a"
			);
			const breadcrum: string = (selector && selector.textContent) || null;

			if (breadcrum && breadcrum.match(tab)) tab = "general";
			else if (document.location.pathname.match(/\/builds\//)) tab = "builds";

			presenceData.state = `${capitalize(tab)}${page ? ` ${page}` : ""}`;
		} else if (
			document.location.pathname.match(/^\/support\/(?:(doc)?(contact)?)/)
		) {
			match = document.location.pathname.match(
				/^\/support\/(?:(doc)?(contact)?)/
			);
			presenceData.details = "Reading FAQ";
			if (match[1] && true) {
				selector =
					document.querySelector(
						"#gatsby-focus-wrapper > div > main > div > div.MuiCardHeader-root > div > span"
					) || null;
				presenceData.state = (selector && selector.textContent) || null;
			} else if (match[2] && true) presenceData.details = "Contact page";
		} else if (document.location.pathname.match(/^\/billing/))
			presenceData.details = "Checking billing info";
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
