import { Assets } from 'premid'

const presence = new Presence({
		clientId: "691080074006495303",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
	Logo = "https://cdn.rcd.gg/PreMiD/websites/N/Nuxt.js/assets/0.png",
}

async function getStrings() {
	return presence.getStrings(
		{
			browse: "general.browsing",
			search: "general.searchFor",
			viewHome: "general.viewHome",
			buttonReadArticle: "general.buttonReadArticle",
			buttonViewPage: "general.buttonViewPage",
			buttonViewProfile: "general.buttonViewProfile",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}
function capitalizeFirstLetter(string: string) {
	if (!string) return "Undefined";
	return (
		string.trim().charAt(0).toUpperCase() + string.trim().slice(1).toLowerCase()
	);
}
function imgPath(path: string | undefined | null, hostname: string) {
	if (!path) return ActivityAssets.Logo;
	if (path.includes(hostname)) return `https://${path.replace("//", "")}`;
	else return `https://${hostname}${path}`;
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string | null = null;

presence.on("UpdateData", async () => {
	let presenceData: PresenceData = {
		startTimestamp: browsingTimestamp,
		largeImageKey: ActivityAssets.Logo,
	};
	const [newLang, privacy, buttons, covers] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "en"),
			presence.getSetting<boolean>("privacy"),
			presence.getSetting<boolean>("buttons"),
			presence.getSetting<boolean>("covers"),
		]),
		search = document.querySelector<HTMLInputElement>(
			'input[id="docsearch-input"]'
		),
		ogTitle = document
			.querySelector('meta[property="og:title"]')
			?.getAttribute("content")
			?.toLowerCase(),
		docTitle = document.querySelector('[class="d-heading-title"]'),
		subActive = document.querySelector('[class*="-text-active"]'),
		docusContent = !document.querySelector('[class*="docus-content"]'),
		{ pathname, hostname, href } = document.location;

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	if (privacy) {
		presenceData.details = strings.browse;
		presence.setActivity(presenceData);
		return;
	}
	if (search?.value) {
		presenceData.details = strings.search;
		presenceData.state = search.value;
		presenceData.smallImageKey = Assets.Search;
		presence.setActivity(presenceData);
		return;
	}
	switch (pathname.split("/")[1]?.replace(/-/gm, "")) {
		case "casestudies": {
			if (!docusContent) {
				presenceData.smallImageKey = Assets.Reading;
				presenceData.details = "Reading a case studie about";
				presenceData.state = ogTitle;
				presenceData.buttons = [
					{
						label: "Read Case Studie",
						url: href,
					},
				];
			} else presenceData.details = "Viewing all case studies";
			break;
		}
		case "deployments": {
			if (!docusContent) {
				presenceData.smallImageKey = Assets.Reading;
				presenceData.details = `Reading about ${ogTitle} nuxt deployment`;
				if (subActive?.textContent) presenceData.state = subActive.textContent;
				presenceData.buttons = [
					{
						label: strings.buttonReadArticle,
						url: href,
					},
				];
			} else presenceData.details = "Viewing all deployment options";

			break;
		}
		case "announcements": {
			if (!docusContent) {
				presenceData.smallImageKey = Assets.Reading;
				presenceData.details = "Reading announcement about";
				if (subActive?.textContent)
					presenceData.state = `${ogTitle} - ${subActive.textContent}`;
				else presenceData.state = ogTitle;
				presenceData.buttons = [
					{
						label: strings.buttonReadArticle,
						url: href,
					},
				];
				presenceData.largeImageKey = imgPath(
					document.querySelector('[class="object-cover"]')?.getAttribute("src"),
					hostname
				);
			} else presenceData.details = "Viewing all announcements";

			break;
		}
		case "docs": {
			if (!docusContent && docTitle) {
				presenceData.details = "Reading documentation about";
				presenceData.state = `${document
					.querySelector('li[class="active"] > h5')
					?.textContent?.trim()} - ${docTitle.textContent}`;
				presenceData.buttons = [
					{
						label: strings.buttonReadArticle,
						url: href,
					},
				];
			} else presenceData.details = "Browsing the docs";
			break;
		}
		case "examples": {
			if (!docusContent && docTitle) {
				presenceData.details = "Viewing an example about";
				presenceData.state = `${document
					.querySelector('li[class="active"] > h5')
					?.textContent?.trim()} - ${docTitle.textContent}`;
				presenceData.buttons = [
					{
						label: strings.buttonReadArticle,
						url: href,
					},
				];
			} else presenceData.details = "Browsing examples";
			break;
		}
		case "tutorials": {
			if (!docusContent) {
				presenceData.details = "Reading a tutorial about";
				presenceData.state = capitalizeFirstLetter(ogTitle ?? '');
				presenceData.buttons = [
					{
						label: "View Tutorial",
						url: href,
					},
				];
			} else presenceData.details = "Viewing all tutorials";
			break;
		}
		default: {
			const pages: Record<string, PresenceData> = {
				"": {
					details: strings.viewHome,
				},
				design: {
					details: "Viewing design options",
				},
				faq: {
					details: "Viewing FAQs",
				},
				partners: {
					details: "Viewing partners",
				},
				support: {
					details: "Viewing the support page",
				},
				teams: {
					details: "Viewing the Nuxt.js team",
				},
				videocourses: {
					details: "Viewing all video coruses",
				},
				sponsors: {
					details: "Viewing all sponsors",
				},
				releases: {
					details: "Viewing all releases",
				},
				themes: {
					details: "Viewing all themes",
				},
				testimonials: {
					smallImageKey: Assets.Reading,
					details: "Reading all testimonials",
					buttons: [
						{
							label: "Read Testimonials",
							url: href,
						},
					],
				},
				showcase: {
					details: `Viewing ${document
						.querySelector('button[class*="rounded-md"]')
						?.textContent?.toLowerCase()} showcases`,
				},
			};
			for (const [path, data] of Object.entries(pages)) {
				if (pathname.replace(/-/gm, "").includes(path))
					presenceData = { ...presenceData, ...data } as PresenceData;
			}
		}
	}
	if (buttons && !presenceData.buttons && pathname !== "/") {
		presenceData.buttons = [
			{
				label: strings.buttonViewPage,
				url: href,
			},
		];
	}

	if (!buttons && presenceData.buttons) delete presenceData.buttons;
	if (!covers && presenceData.largeImageKey !== ActivityAssets.Logo)
		presenceData.largeImageKey = ActivityAssets.Logo;
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});
