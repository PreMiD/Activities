const presence = new Presence({
		clientId: "848293229409337444"
	}),
	browsingTimestamp = Math.round(Date.now() / 1000);

async function getLanguageName(id: string) {
	const languages = await fetch(
		"https://api.crowdin.com/api/v2/languages?limit=500",
		{
			headers: { Accept: "application/json" }
		}
	)
		.then(
			r =>
				r.json() as Promise<{
					data: { data: CrowdinLanguage }[];
					pagination: { limit: number; offset: number };
				}>
		)
		.then(r => r.data.map(l => l.data));
	return languages.find(l => l.id === id)?.name;
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			details: "Unknown page",
			largeImageKey: "crowdin",
			startTimestamp: browsingTimestamp
		},
		{ pathname, host, href } = document.location,
		pathnameSplit = pathname.split("/"),
		[showManager, showConversations] = await Promise.all([
			presence.getSetting<boolean>("showManager"),
			presence.getSetting<boolean>("showConversations")
		]);

	switch (host) {
		case "support.crowdin.com": {
			const isEnterprise = !!~pathnameSplit.indexOf("enterprise");
			if (!pathname || pathname === "/")
				presenceData.details = "On the main support page";
			else if (
				pathname.includes("/api/v2/") ||
				pathname.includes("/enterprise/api/")
			) {
				const activeLabel = [...document.querySelectorAll("label")].find(c =>
					c.className?.includes("active")
				);

				presenceData.details = `Reading the ${
					isEnterprise ? "Enterprise " : ""
				}API documentation`;

				presenceData.state = [...(activeLabel?.children ?? [])]
					.map((c, i, a) =>
						a.length >= 1 && i === 0
							? c.textContent.toUpperCase()
							: c.textContent
					)
					.join(" ");
				presenceData.smallImageKey = "reading";
				if (activeLabel) {
					presenceData.buttons = [
						{
							label: "Read more",
							url: href
						}
					];
				}
			} else if (pathname.includes("/search")) {
				presenceData.details = "Searching support";
				presenceData.state = document.querySelector<HTMLInputElement>(
					".form-control.form-control__result.input-lg"
				)?.value;
				presenceData.smallImageKey = "search";
			} else {
				presenceData.details = `Reading ${
					isEnterprise ? "an Enterprise" : "a"
				} support article`;
				presenceData.state = document.querySelector(".hero")?.textContent;
				presenceData.smallImageKey = "reading";
				presenceData.buttons = [
					{
						label: "View article",
						url: href
					}
				];
			}

			break;
		}
		case "store.crowdin.com": {
			const appName = document
				.querySelector("marketplace-item.hydrated")
				?.shadowRoot.querySelector("h1")
				.childNodes[0].textContent.trim();

			if (!pathname || pathname === "/")
				presenceData.details = "On the main store page";
			else if (pathname.includes("/author/")) {
				presenceData.details = "Viewing Developer";
				presenceData.state = document
					.querySelectorAll("div.sc-marketplace-author")[1]
					?.querySelector("h1").childNodes[0].textContent;
				presenceData.buttons = [{ label: "View developer", url: href }];
			} else if (appName) {
				presenceData.details = "Viewing App";
				presenceData.state = appName;
				presenceData.buttons = [{ label: "View app", url: href }];
			} else {
				// Tags and other filter elements are intentionally not supported despite there being pathnames for them
				// This is because they are customizable beyond the preset URLs and it would be hard to display all possibilities
				const category = document
					.querySelector("#category-select")
					?.shadowRoot.querySelector(
						"div.select-wrapper.select-wrapper--borderless > div"
					).textContent;
				presenceData.details = "Browsing the store";
				presenceData.state =
					category &&
					`${
						category.includes("categories") ? category : `${category} category`
					}`;
			}

			break;
		}
		case "status.crowdin.com": {
			// TODO add incident page (when they have an incident to report lol)
			presenceData.details = "Viewing Crowdin's status";
			if (pathname === "/subscribe")
				presenceData.details = "Subscribing to status reports";

			break;
		}
		case "blog.crowdin.com": {
			presenceData.smallImageKey = "reading";
			if (pathname === "/") presenceData.details = "Browsing the blog";
			else if (pathname.includes("/tag/")) {
				presenceData.details = "Viewing tag";
				presenceData.state = document
					.querySelector(".text-center.home-bg.home-bg--tags")
					?.textContent.split(":")[1];
				presenceData.buttons = [
					{
						label: "View tag",
						url: href
					}
				];
			} else if (pathname.includes("/search")) {
				presenceData.details = "Searching the blog";
				presenceData.state =
					document.querySelector<HTMLInputElement>(".form-control")?.value;
				presenceData.smallImageKey = "search";
			} else if (document.querySelector(".hero > h1")) {
				presenceData.details = "Reading blog post";
				presenceData.state = document.querySelector(".hero > h1").textContent;
				presenceData.buttons = [
					{
						label: "View blog post",
						url: href
					}
				];
			} else {
				presenceData.details = "Unknown page";
				delete presenceData.smallImageKey;
			}

			break;
		}
		default:
			if (pathname === "/" || !pathname) presenceData.details = "Website Home";
			else if (pathname.includes("/project/")) {
				if (document.querySelector(".not-found-header"))
					presenceData.details = "Viewing an invalid project";
				else {
					presenceData.details =
						document.querySelector(".project-name__title__text")?.textContent ??
						document.querySelector<HTMLAnchorElement>(
							"#wrap > div.section.project-page > div > div.clearfix.mb-2 > div > div:nth-child(2) > a"
						).outerText;
					presenceData.buttons = [
						{
							label: "View project",
							url:
								document.location.origin +
								pathnameSplit.filter((_, i) => i <= 2).join("/")
						}
					];
					if (pathname.includes("/activity-stream"))
						presenceData.state = "Viewing activity";
					else if (pathname.includes("/discussions")) {
						if (parseInt(pathnameSplit.at(-1))) {
							const author = document
								.querySelector(
									"#topic-view-container > div > div > div:nth-child(3) > div.reply-toolbar > div.author-info-section.d-flex.flex-row.align-items-center > span"
								)
								.parentElement.querySelector(".user-name").textContent;
							presenceData.details += " - Discussions";
							presenceData.state = `${
								(
									document.querySelector(
										"#topic-view-container > div > div > h3"
									) ??
									document.querySelector(
										"#topic-view-container > div > div > div.topic-title-closed > h3"
									)
								).textContent
							} - ${
								author === "You"
									? document.querySelector<HTMLImageElement>(
											"#topic-view-container > div > div > div:nth-child(3) > div.reply-toolbar > div.author-avatar.avatar-small.mr-1 > img"
									  ).title
									: author
							}`;
						} else presenceData.state = "Browsing discussions";
					} else if (pathname.includes("/tasks")) {
						if (parseInt(pathnameSplit.at(-1))) {
							presenceData.details += " - Tasks";
							presenceData.state =
								document.querySelector("#task-title").textContent;
						} else presenceData.state = "Browsing tasks";
					} else if (pathname.includes("/reports")) {
						const currentReport = pathnameSplit.at(-1);
						presenceData.details += " - Reports";
						presenceData.state =
							!showManager &&
							["cost-estimate", "abuse-report"].includes(currentReport)
								? "Project Status"
								: !showManager && currentReport === "translation-cost"
								? "My Contribution"
								: document.querySelector(".nav-item.active").textContent;
					} else if (pathnameSplit.length === 3)
						presenceData.state = "Viewing project home";
					else if (
						document.querySelector(
							"#wrap > div.section.project-page > div > h1"
						)
					) {
						presenceData.state = `${await getLanguageName(
							pathnameSplit.at(-1)
						)} translation`;
					} else presenceData.state = "In project home";

					if (showManager) {
						if (pathname.includes("/content")) {
							presenceData.details += " - Content";
							presenceData.state = `Managing ${
								document.querySelector(".nav-item.active").textContent
							}`;
						} else if (pathname.includes("/resources"))
							presenceData.state = "Viewing resources";
						else if (pathname.includes("/members"))
							presenceData.state = "Managing members";
						else if (pathname.includes("/tools")) {
							// Unfortunately every app has a different selector, so it's virtually impossible to support them all
							presenceData.state = "Managing tools";
						} else if (pathname.includes("/apps")) {
							presenceData.details += " - Integrations";
							presenceData.state = `Managing ${
								document.querySelector(
									".integration-details > .description > h3"
								).textContent
							}`;
						} else if (pathname.includes("/settings"))
							presenceData.state = "Managing project settings";
					}
				}
			} else if (
				pathname.includes("/translate") ||
				pathname.includes("/proofread")
			) {
				// Ensure the editor has loaded to prevent undefined text
				if (!document.querySelector("#crowdin-editor-wrapper")) return;
				const translatingFile = document.querySelector(".file-name");

				if (pathname.includes("/proofread"))
					presenceData.details = `Proofreading ${translatingFile?.textContent}`;
				else
					presenceData.details = `Translating ${translatingFile?.textContent}`;

				presenceData.state = `${document.title.split("-")[1]?.trim()} - ${
					document.querySelector(".language-name-wrapper.text-overflow")
						?.textContent
				}`;

				presenceData.smallImageKey = "writing";
				presenceData.buttons = [
					{
						label: "Translate project",
						url: href
					}
				];
			} else if (pathname.includes("/profile")) {
				if (document.querySelector(".error-page"))
					presenceData.details = "Viewing an invalid profile";
				else {
					const profileName = document.querySelector(".username"),
						profileNickname = document.querySelector(".user-login");

					if (
						// check if "To Do" nav item (third) is present. If so, profile is own profile
						document.querySelectorAll(".nav-item")[2]
					) {
						if (pathname.includes("/activity"))
							presenceData.details = "Viewing own activity";
						else presenceData.details = "Viewing own profile";
					} else if (pathname.includes("/activity"))
						presenceData.details = "Viewing user activity";
					else presenceData.details = "Viewing a profile";

					presenceData.state = `${profileName?.textContent}${
						profileNickname ? ` - ${profileNickname.textContent}` : ""
					}`;

					presenceData.buttons = [
						{
							label: "View profile",
							// We can't just use href because own profile may not have the nickname at the end
							url: `https://crowdin.com/profile/${
								(profileNickname ?? profileName).textContent
							}`
						}
					];
				}
			} else if (pathname.includes("/messages")) {
				const participants = [
						...document
							.querySelector(".messages-members-status")
							.querySelectorAll(".messages-single-member-status")
					]
						.map(e => e.textContent)
						// The elements already come with commas and spaces so we don't need to modify anything. This also accounts for the "X more" button and for single users
						.join(""),
					subject = document.querySelector("#subject-text > h3").textContent;
				if (
					parseInt(
						document.querySelector(".users-counter > :nth-child(2)").textContent
					) === 1
				) {
					if (showConversations) {
						presenceData.details = "Messaging user";
						presenceData.state = `${subject} - ${participants}`;
					} else presenceData.details = "Messaging a user";
				} else if (showConversations) {
					presenceData.details = "Messaging group";
					presenceData.state = `${subject} - ${participants}`;
				} else presenceData.details = "Messaging a group";

				presenceData.smallImageKey = "writing";
			} else if (pathname.includes("/projects")) {
				const searchValue = document.querySelector<HTMLInputElement>(
					"#search_query > input"
				).value;

				presenceData.details = "Exploring projects";
				presenceData.state =
					document.querySelector(".nav-item.active").textContent;

				if (searchValue) {
					presenceData.state += ` - ${searchValue}`;
					presenceData.smallImageKey = "search";
				}
			} else if (pathname.includes("/resources")) {
				presenceData.details = "Viewing resources";
				presenceData.state =
					document.querySelector<HTMLLIElement>(".active")?.textContent;
			} else if (pathname.includes("/release-notes")) {
				presenceData.details = "Reading release notes";
				presenceData.state = document.querySelector<HTMLAnchorElement>(
					".selected-release-item"
				)?.textContent;
				presenceData.smallImageKey = "reading";
				presenceData.buttons = [
					{
						label: "View release notes",
						url: href
					}
				];
			} else if (pathname === "/features")
				presenceData.details = "Viewing Crowdin's features";
			else if (pathname === "/demo-request")
				presenceData.details = "Requesting a demo";
			else if (pathname.includes("/page/") || pathname.includes("/teams/")) {
				presenceData.details = "Reading page";
				// The header of each page is inconsistent and sometimes too big, thus we use the document title
				presenceData.state = document.title.split("|")[0];
				presenceData.smallImageKey = "reading";
				presenceData.buttons = [
					{
						label: "View page",
						url: href
					}
				];
			} else if (pathname.includes("/pricing"))
				presenceData.details = "Viewing pricing";
			else if (pathname.includes("/enterprise"))
				presenceData.details = "Viewing enterprise";
			else if (pathname.includes("/contacts"))
				presenceData.details = "Contacting Crowdin";
			else if (pathname.includes("/feature-request"))
				presenceData.details = "Viewing feature requests";
			else if (pathname === "/createproject")
				presenceData.details = "Creating a project";
			else {
				presence.info(
					"This page is currently not supported in the Crowdin presence! Please open an issue on GitHub about this."
				);
				presenceData.details = "Viewing an unsupported page";
			}
	}

	presence.setActivity(presenceData);
});

interface CrowdinLanguage {
	id: string;
	name: string;
	editorCode: string;
	twoLettersCode: string;
	threeLettersCode: string;
	locale: string;
	androidCode: string;
	osxCode: string;
	osxLocale: string;
	pluralCategoryNames: string[];
	pluralRules: string;
	pluralExamples: string[];
	textDirection: string;
	dialectOf: string;
}
