const presence = new Presence({
		clientId: "1026169442478084187",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/HBcKcfS.png",
			startTimestamp: browsingTimestamp,
		},
		{ pathname, href } = window.location,
		pathSplit = pathname.split("/").filter(x => x);

	switch (pathSplit[0] ?? "") {
		case "": {
			presenceData.details = "Browsing";
			presenceData.state = "Home page";
			break;
		}
		case "backgrounds.html":
		case "bestiary.html":
		case "charcreationoptions.html":
		case "conditionsdiseases.html":
		case "cultsboons.html":
		case "feats.html":
		case "items.html":
		case "objects.html":
		case "optionalfeatures.html":
		// TODO: fix this
		case "rces.html":
		case "spells.html":
		case "tables.html":
		case "trapshazards.html":
		case "variantrules.html": {
			const type =
				document.querySelector<HTMLHeadingElement>(".page__title").textContent;
			presenceData.details = `Browsing ${type}`;
			presenceData.state =
				document.querySelector<HTMLHeadingElement>(".stats-name").textContent;
			presenceData.buttons = [
				{
					label: `View ${type.substring(0, type.length - 1)}`,
					url: href,
				},
			];
			break;
		}
		case "adventure.html": {
			presenceData.details = `Browsing adventure: ${
				document.querySelector<HTMLHeadingElement>(".page__title").textContent
			}`;
			presenceData.state =
				document.querySelector<HTMLSpanElement>(
					".entry-title-inner"
				).textContent;
			break;
		}
		case "adventures.html": {
			presenceData.details = "Browsing list of adventures";
			break;
		}
		case "book.html": {
			presenceData.details = `Browsing book: ${
				document.querySelector<HTMLHeadingElement>(".page__title").textContent
			}`;
			presenceData.state =
				document.querySelector<HTMLSpanElement>(
					".entry-title-inner"
				).textContent;
			break;
		}
		case "books.html": {
			presenceData.details = "Browsing list of books";
			break;
		}
		case "classes.html": {
			presenceData.details = "Browsing classes";
			presenceData.state = document.querySelector<HTMLTableCellElement>(
				".cls-tbl__disp-name"
			).textContent;
			presenceData.buttons = [
				{
					label: "View Class",
					url: href,
				},
			];
			break;
		}
		case "crcalculator.html": {
			presenceData.details = "Using CR Calculator";
			presenceData.state = document.querySelector("h4").textContent;
			break;
		}
		case "dmscreen.html": {
			presenceData.details = "Using DM Screen";
			break;
		}
		case "encountergen.html": {
			presenceData.details = "Using encounter generator";
			presenceData.state = document.querySelector<HTMLTableCaptionElement>(
				"#pagecontent caption"
			).textContent;
			break;
		}
		case "lifegen.html": {
			presenceData.details = "Using character background generator";
			break;
		}
		case "lootgen.html": {
			presenceData.details = "Using loot generator";
			presenceData.details = document.querySelector<HTMLButtonElement>(
				"#lootgen-lhs .ui-tab__btn-tab-head"
			).textContent;
			break;
		}
		case "maps.html": {
			presenceData.details = "Browsing maps";
			break;
		}
		case "names.html": {
			presenceData.details = "Browsing list of names";
			presenceData.state = `${
				document.querySelector<HTMLTableCaptionElement>("#pagecontent caption")
					.textContent
			} names`;
			presenceData.buttons = [
				{
					label: "View Names",
					url: href,
				},
			];
			break;
		}
		case "statgen.html": {
			presenceData.details = "Using stat generator";
			presenceData.details = document.querySelector<HTMLDivElement>(
				".ui-tab-side__disp-active-tab-name"
			).textContent;
			break;
		}
		case "quickreference.html": {
			presenceData.details = "Browsing quick reference";
			presenceData.state =
				document.querySelector<HTMLSpanElement>(
					".entry-title-inner"
				).textContent;
			break;
		}
	}

	presence.setActivity(presenceData);
});
