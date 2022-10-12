const presence = new Presence({
		clientId: "1029595348844429382",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/zn1sM5L.png",
			startTimestamp: browsingTimestamp,
		},
		mainPath = window.location.pathname[1] ?? "";

	switch (mainPath) {
		case "register":
		case "login": {
			presenceData.details = "Logging in";
			break;
		}
		case "create-zip-archive": {
			presenceData.details = "Creating zip archives";
			break;
		}
		case "extract-zip-archive": {
			presenceData.details = "Extracting zip archives";
			break;
		}
		case "merge-pdf": {
			presenceData.details = "Merging files into a PDF";
			break;
		}
		case "apis": {
			presenceData.details = "Viewing an API's about page";
			presenceData.state = document.querySelector("h1").textContent;
			break;
		}
		case "api": {
			presenceData.details = "Browsing the API documentation";
			presenceData.state = document.querySelector<HTMLHeadingElement>(
				".content-header-title"
			).textContent;
			break;
		}
		case "dashboard": {
			presenceData.details = "Viewing dashboard";
			presenceData.state =
				document.querySelector<HTMLLIElement>(".active").textContent;
			break;
		}
		case "settings": {
			presenceData.details = "Managing account settings";
			break;
		}
		default: {
			if (
				mainPath === "" ||
				mainPath.endsWith("-converter") ||
				/-to-/.test(mainPath)
			)
				presenceData.details = "Converting files";
			else if (
				mainPath === "save-website-pdf" ||
				/^website-[a-z]+-screenshot$/.test(mainPath)
			)
				presenceData.details = "Creating website screenshots";
			else {
				presenceData.details = "Browsing";
				presenceData.state = document.title.match(
					/^(.*?)( \| CloudConvert)?$/
				)[1];
			}
		}
	}

	presence.setActivity(presenceData);
});
