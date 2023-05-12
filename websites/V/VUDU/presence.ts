// Initialize the presence
const presence = new Presence({
	clientId: "697983563857002517",
});

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/PFdbnIf.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/wh885z3.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

// Global variables
let startTime = Date.now(),
	videoPlayer: HTMLVideoElement,
	videoDuration: number,
	cuTime: number,
	endTime: number,
	videoState = "paused", // Default
	metadata: string,
	// Set the default presence data for when the video is loading
	presenceData: PresenceData = {
		largeImageKey:
			"vudularge" /*The key (file name) of the Large Image on the presence. These are uploaded and named in the Rich Presence section of your application, called Art Assets*/,
		details: "Browsing VUDU",
	};

// Get the title
function grabMetadata(): void {
	// Get the close button first (Don't worry this will make sense)
	const closeButton = document.querySelector('[aria-label="Close"]');

	// If there's not a close button, then the user isn't watching anything
	if (!closeButton) return;

	// Get all the elements inside of the parent that are span (there should only be one) and get the innerHTML
	metadata = closeButton.parentElement.querySelectorAll("span")[0].textContent;
}

// Get the video player element
function getVideoPlayer(): void {
	// VUDU plays movies in an iFrame. Cool! Let's get that iFrame
	const VUDUIFrame = document.querySelector(
			"#contentPlayerFrame"
		) as HTMLIFrameElement,
		// Finally... get the video
		videoPlayer = (
			VUDUIFrame.contentDocument || VUDUIFrame.contentWindow.document
		).querySelector("#videoPlayer") as HTMLVideoElement;

	videoDuration = videoPlayer.duration; // duration of movie in seconds

	cuTime = videoPlayer.currentTime; // where the user is currently at
}

function calculateEndTime(): void {
	videoState = "playing"; // Tell PreMID the video is playing correctly (aka don't update the end time again)
	startTime = Date.now(); // Get the point where the user started watching
	endTime = startTime + (videoDuration - cuTime) * 1000; // Get the end of the video (time left)

	if (isNaN(endTime)) {
		// If the video DIDN'T load correctly then endTime will be NaN
		videoState = "loading"; // Video is still loading, calculate again
		calculateEndTime();
	}
}

function pausePresence(): void {
	videoState = "paused"; // Tell PreMID the user paused, this lets us calculate endTime again when the user starts playing
}

setInterval(grabMetadata, 10000); // Metadata shouldn't ever really change... so this is fine
setInterval(getVideoPlayer, 1000); // If I was dumb enough to run this every frame I would, but I'm considerate and so it shall only run every second

presence.on("UpdateData", () => {
	// Video doesn't exist, and there's no metadata either.
	// Aka, user isn't watching anything.
	if (videoPlayer && metadata) {
		// When the video pauses
		if (videoPlayer.paused) {
			// Only run this once
			if (videoState !== "paused") pausePresence();

			// Discord says "hey nice pause"
			presenceData = {
				largeImageKey:
					"vudularge" /*The key (file name) of the Large Image on the presence. These are uploaded and named in the Rich Presence section of your application, called Art Assets*/,
				details: `Watching ${metadata}`, //The upper section of the presence text
				state: "Paused",
			};
		} else {
			// Only run this once
			if (videoState !== "playing") calculateEndTime();

			// Set presence to movie data
			presenceData = {
				largeImageKey:
					"vudularge" /*The key (file name) of the Large Image on the presence. These are uploaded and named in the Rich Presence section of your application, called Art Assets*/,
				smallImageKey:
					"vudusmall" /*The key (file name) of the Large Image on the presence. These are uploaded and named in the Rich Presence section of your application, called Art Assets*/,
				smallImageText: "Watching movies", //The text which is displayed when hovering over the small image
				details: `Watching ${metadata}`, //The upper section of the presence text
				startTimestamp: startTime, //The unix epoch timestamp for when to start counting from
				endTimestamp: endTime, //If you want to show Time Left instead of Elapsed, this is the unix epoch timestamp at which the timer ends
			};
		}

		// Send that activity to discord
		presence.setActivity(presenceData);
	} else {
		// Clear activity

		presence.setActivity();
	}
});
