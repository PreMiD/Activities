const presence = new Presence({
		clientId: "1144333935967473685",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000),
	slideshow = presence.createSlideshow();

let oldLang: string,
	strings: Awaited<ReturnType<typeof presence.getStrings>>,
	oldPath: string;

const enum Assets {
	Logo = "https://i.imgur.com/RAxM8Tw.png",
}

function getImportantPath(): string[] {
	const pathList = document.location.pathname.split("/").filter(Boolean);
	if (pathList[0] === "en") pathList.shift();
	if (pathList[pathList.length - 1] !== "") pathList.push("");
	return pathList;
}

function getTitle(): string {
	let split = document.title.match(/(.*) [|-]/);
	return split ? split[1].trim() : document.title;
}

function applyCharacterSlideshow(presenceData: PresenceData): void {
	const characters = [
		...document.querySelectorAll<HTMLAnchorElement>(
			"a[href*='/characters/']:nth-of-type(1)"
		),
	].map(link => link.parentElement);
	for (const character of characters) {
		const slide = Object.assign({}, presenceData);
		const imageUrl = character.querySelector<HTMLDivElement>(
			"[data-background-image-url]"
		).dataset.backgroundImageUrl;
		slide.largeImageKey = imageUrl;
		slide.smallImageKey = character.children[3].querySelector<HTMLDivElement>(
			"[data-background-image-url]"
		).dataset.backgroundImageUrl;
		slide.smallImageText =
			character.children[1].firstElementChild.childNodes[0].textContent;
		slideshow.addSlide(imageUrl, slide, 5000);
	}
}

function applyArtworkSlideshow(presenceData: PresenceData): void {
	const artworks = [
		...document.querySelectorAll<HTMLAnchorElement>(
			"a[href*='/artworks/']:nth-of-type(1)"
		),
	].map(link => link.parentElement);
	for (const artwork of artworks) {
		const slide = Object.assign({}, presenceData);
		const imageUrl = artwork.querySelector<HTMLDivElement>(
			"[data-background-image-url]"
		).dataset.backgroundImageUrl;
		slide.largeImageKey = imageUrl;
		slideshow.addSlide(imageUrl, slide, 5000);
	}
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		lang = await presence.getSetting<string>("lang"),
		pathList = getImportantPath(),
		{ hostname, href, pathname } = document.location;

	if (pathname !== oldPath) {
		oldPath = pathname;
		slideshow.deleteAllSlides();
	}

	if (lang !== oldLang) {
		oldLang = lang;
		strings = await presence.getStrings(
			{
				browsing: "general.browsing",
				buttonReadArticle: "general.buttonReadArticle",
				buttonViewPage: "general.buttonViewPage",
				buttonViewProfile: "general.buttonViewProfile",
				readingAbout: "general.readingAbout",
				readingAPost: "general.readingAPost",
				readingAnArticle: "general.readingAnArticle",
				viewAProduct: "general.viewAProduct",
				viewAProfile: "general.viewAProfile",
				viewCategory: "general.viewCategory",
				viewHome: "general.viewHome",
				viewList: "general.viewList",
				viewPage: "general.viewPage",
				viewing: "general.viewing",
			},
			lang
		);
	}

	switch (hostname) {
		case "developer.vroid.com": {
			if (pathList[1] === "docs") {
				presenceData.details = `VRoid SDK - ${strings.readingAbout}`;
				presenceData.state = document.querySelector("h1").textContent.trim();
			} else {
				presenceData.details = `VRoid SDK - ${strings.browsing}`;
			}
			break;
		}
		case "hub.vroid.com": {
			switch (pathList[0]) {
				case "": {
					presenceData.details = `VRoid Hub - ${strings.browsing}`;
					break;
				}
				case "apps": {
					const [selectedTab] = [
							...document.querySelectorAll<HTMLAnchorElement>("[role=nav] a"),
						].sort((a, b) => {
							return +![...a.classList].every(name =>
								[...b.classList].includes(name)
							);
						}),
						appTitle =
							document.querySelector<HTMLHeadingElement>(
								"header > h1"
							).textContent;
					if (pathList[1]) {
						presenceData.details = `VRoid Hub - ${strings.viewAProduct}`;
						presenceData.buttons = [
							{ label: strings.buttonViewPage, url: href },
						];
						switch (pathList[2]) {
							case "": {
								presenceData.state = appTitle;
								break;
							}
							case "character_models": {
								presenceData.state = `${appTitle} - ${selectedTab.textContent}`;
								applyCharacterSlideshow(presenceData);
								break;
							}
							case "artworks": {
								presenceData.state = `${appTitle} - ${selectedTab.textContent}`;
								applyArtworkSlideshow(presenceData);
								break;
							}
						}
					} else {
						presenceData.details = `VRoid Hub - ${strings.viewing}`;
						presenceData.state = getTitle();
					}
					break;
				}
				case "characters": {
					const container =
						document.querySelector<HTMLImageElement>(
							"canvas + div img"
						).parentElement;
					presenceData.details = `VRoid Hub - ${strings.viewAProduct}`;
					presenceData.state = `${container.querySelector("a").textContent} / ${
						container.nextElementSibling.textContent
					}`;
					presenceData.largeImageKey = container.querySelector("img").src;
					presenceData.buttons = [{ label: strings.buttonViewPage, url: href }];
					break;
				}
				case "artworks": {
					presenceData.details = `VRoid Hub - ${strings.readingAPost}`;
					presenceData.buttons = [{ label: strings.buttonViewPage, url: href }];
					applyArtworkSlideshow(presenceData);
					break;
				}
				case "model_assets": {
					const container = document.querySelector<HTMLDivElement>(
						"header > div[style]"
					).parentElement;
					presenceData.details = `VRoid Hub - ${strings.viewAProduct}`;
					presenceData.state = container.querySelector<HTMLDivElement>(
						"div:nth-of-type(2) > div > div"
					).textContent;
					presenceData.largeImageKey = getComputedStyle(
						container.querySelector<HTMLDivElement>("div[style]")
					).backgroundImage.match(/url\("(.*)"\)/)[1];
					presenceData.buttons = [{ label: strings.buttonViewPage, url: href }];
					break;
				}
				case "models": {
					presenceData.details = `VRoid Hub - ${strings.viewList}`;
					presenceData.state =
						document.querySelector("header > h1").textContent;
					applyCharacterSlideshow(presenceData);
					break;
				}
				case "tags": {
					presenceData.details = `VRoid Hub - ${strings.viewCategory}`;
					presenceData.state = `#${pathList[1]} - ${
						[
							...document.querySelectorAll<HTMLAnchorElement>(
								"section + div a"
							),
						].find(link => !getComputedStyle(link).borderTop.startsWith("0px"))
							.textContent
					}`;
					if (pathList[3] === "artworks") applyArtworkSlideshow(presenceData);
					else applyCharacterSlideshow(presenceData);
					break;
				}
			}
			break;
		}
		default: {
			switch (pathList[0]) {
				case "": {
					presenceData.details = strings.viewHome;
					break;
				}
				case "studio": {
					presenceData.details = strings.readingAbout;
					presenceData.state = "VRoid Studio";
					break;
				}
				case "mobile": {
					presenceData.details = strings.readingAbout;
					presenceData.state = "VRoid Mobile";
					break;
				}
				case "wear": {
					if (pathList[1]) {
						presenceData.details = strings.viewing;
						presenceData.state = getTitle();
					} else {
						presenceData.details = strings.readingAbout;
						presenceData.state = "VRoid Wear";
					}
					break;
				}
				case "news": {
					if (pathList[1]) {
						presenceData.details = strings.readingAnArticle;
						presenceData.state =
							document.querySelector<HTMLHeadingElement>(
								"article h1"
							).textContent;
						presenceData.largeImageKey =
							document.querySelector<HTMLImageElement>("article img").src;
						presenceData.buttons = [
							{ label: strings.buttonReadArticle, url: href },
						];
					} else {
						presenceData.details = strings.readingAnArticle;
						presenceData.state =
							document.querySelector<HTMLImageElement>("h1 > img").alt;
					}
					break;
				}
			}
		}
	}

	const slides = slideshow.getSlides();
	if (slides.length) {
		if (!slideshow.currentSlide.details) {
			slideshow.currentSlide = slides[0].data;
		}
		presence.setActivity(slideshow);
	} else if (presenceData.details) {
		presence.setActivity(presenceData);
	} else {
		presence.setActivity();
	}
});
