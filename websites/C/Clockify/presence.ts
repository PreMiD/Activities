import { ActivityType, Assets } from "premid"
/* 
  TODO:  
    - Fix url not working properly (probable root cause)
	- Check regExp in metadata.json file, it might be incorrect and not matching the URLs properly, causing the presence to not update as expected.

  Tips: 
    - Try using the url "app.clockify.me" instead of "www.clockify.me" in the metadata.json file, as Clockify's main application is hosted on that subdomain. 
    - Also, ensure that the regular expression in the metadata.json file correctly matches the URLs you want to track.
*/ 

const presence = new Presence({
	clientId: "1468581338117308446",
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on("UpdateData", async () => {
	const path = document.location.pathname

	const presenceData: PresenceData = {
		largeImageKey: "logo",
		smallImageKey: Assets.Play,
		startTimestamp: browsingTimestamp,
		type: ActivityType.Watching,
		details: "On Clockify",
		state: "Browsing",
	}

	if (path.startsWith("/tracker")) {
		presenceData.details = "Tracking time"
		presenceData.state = "Managing tasks"
	} else if (path.startsWith("/reports")) {
		presenceData.details = "Viewing reports"
		presenceData.state = "Analyzing tracked time"
	} else if (path.startsWith("/projects")) {
		presenceData.details = "Managing projects"
		presenceData.state = "Organizing workspace"
	} else if (path.startsWith("/clients")) {
		presenceData.details = "Managing clients"
		presenceData.state = "Organizing workspace"
	} else if (path.startsWith("/team")) {
		presenceData.details = "Managing team"
		presenceData.state = "Viewing members"
	} else if (path.startsWith("/settings")) {
		presenceData.details = "In settings"
		presenceData.state = "Configuring Clockify"
	}

	presence.setActivity(presenceData)
})