const presence = new Presence({
		clientId: "1034133591938060298",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/bsN9g4H.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname } = window.location;

	if (pathname === "/web/") presenceData.details = "Loading";
	else {
		const appRoot = document.querySelector("earth-app").shadowRoot,
			knowledgeCard = appRoot.querySelector("earth-knowledge-card"),
			drawerContainer = appRoot.querySelector("paper-drawer-panel"),
			drawerRoot = drawerContainer.querySelector("earth-drawer").shadowRoot,
			topToolbarRoot = appRoot.querySelector("earth-top-toolbar").shadowRoot,
			imageLightBox = document.querySelector<HTMLElement>(
				"earth-image-lightbox"
			),
			voyager = appRoot.querySelector<HTMLElement>("earth-voyager"),
			measurementToolRoot =
				drawerContainer.querySelector("earth-measure-tool").shadowRoot,
			myPlaces = drawerRoot.querySelector("earth-my-places");
		if (pathname.startsWith("/web/search/")) {
			presenceData.details = "Searching";
			presenceData.state = drawerRoot
				.querySelector("earth-search")
				.shadowRoot.querySelector("app-header-layout")
				.querySelector("earth-omnibox")
				.shadowRoot.querySelector<HTMLInputElement>("iron-input > input").value;
		} else if (knowledgeCard.getAttribute("hidden") !== "true") {
			const mainCardRoot =
				knowledgeCard.shadowRoot.querySelector("#top-card").shadowRoot;
			presenceData.details = "Looking at a location";
			presenceData.state = `${
				mainCardRoot.querySelector<HTMLDivElement>("#title").textContent
			} - ${
				mainCardRoot.querySelector<HTMLDivElement>("#known-for").textContent
			}`;
		} else if (knowledgeCard.getAttribute("expanded") === "") {
			const expandedCartRoot = document
				.querySelector("earth-expanded-card")
				.shadowRoot.querySelector("app-header-layout")
				.querySelector<HTMLDivElement>("#card-content");
			presenceData.details = "Viewing more information about a location";
			presenceData.state = `${
				expandedCartRoot.querySelector<HTMLDivElement>("#title").textContent
			} - ${
				expandedCartRoot.querySelector<HTMLDivElement>("#known-for").textContent
			}`;
		} else {
			switch (
				topToolbarRoot
					.querySelector("#navigation-action")
					.getAttribute("action")
			) {
				case "USER_ACTION_NAVIGATION_BACK_VOYAGER_FEED_ITEM": {
					presenceData.details = "Viewing a Voyager Feed";
					presenceData.state =
						topToolbarRoot.querySelector<HTMLHeadingElement>(
							"toolbar-title"
						).textContent;

					break;
				}
				case "USER_ACTION_NAVIGATION_BACK_PLAY_MODE": {
					presenceData.details = "Viewing a project presentation";
					presenceData.state =
						topToolbarRoot.querySelector<HTMLHeadingElement>(
							"#project-title"
						).textContent;

					break;
				}
				case "USER_ACTION_NAVIGATION_BACK_STREET_VIEW": {
					presenceData.details = "Viewing Street View";
					presenceData.state = topToolbarRoot
						.querySelector("app-toolbar")
						.getAttribute("aria-label");

					break;
				}
				default:
					if (imageLightBox.style.display !== "none") {
						presenceData.details = "Viewing a photo";
						presenceData.largeImageKey = imageLightBox.shadowRoot
							.querySelector("#image")
							.shadowRoot.querySelector<HTMLDivElement>("#sizedImgDiv")
							.style.backgroundImage.match(/url\("(.+)"\)/)[1];
					} else if (
						voyager.getAttribute("enabled") === "" &&
						voyager.style.display !== "none"
					)
						presenceData.details = "Browsing Voyager";
					else if (
						appRoot.querySelector<HTMLElement>("earth-balloon-fullscreen").style
							.display !== "none"
					)
						presenceData.details = "Preparing Voyager";
					else if (
						measurementToolRoot
							.querySelector("#card")
							.getAttribute("hidden") !== "true"
					) {
						presenceData.details = "Measuring a distance";
						presenceData.state =
							measurementToolRoot.querySelector<HTMLSpanElement>(
								"#formatted-distance"
							).textContent;
					} else if (getComputedStyle(myPlaces).display !== "none") {
						const root = myPlaces.shadowRoot,
							projectPage = root.querySelector("earth-document-view"),
							propertyEditor = root.querySelector("earth-property-editor");
						if (projectPage.getAttribute("hidden") === "true") {
							presenceData.details = "Viewing a project";
							presenceData.state =
								projectPage.shadowRoot.querySelector<HTMLHeadingElement>(
									"#title"
								).textContent;
						} else if (propertyEditor.getAttribute("hidden") === "true") {
							presenceData.details = "Adding something to a project";
							presenceData.state = propertyEditor.shadowRoot
								.querySelector("#content-panel")
								.shadowRoot.querySelector(".title-input")
								.shadowRoot.querySelector<HTMLInputElement>("#input").value;
						} else presenceData.details = "Browsing their projects";
					} else {
						presenceData.details = "Looking at a point on the map";
						presenceData.state = document
							.querySelector<HTMLSpanElement>("#pointer-coordinates")
							.textContent.trim();
					}
			}
		}
	}

	presence.setActivity(presenceData);
});
