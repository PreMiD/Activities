const presence = new Presence({
    clientId: "641432995764633612"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  }),
  browsingStamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "al"
  };

  if (
    document.location.pathname === "/" ||
    document.location.pathname === "/home"
  ) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Viewing home page";
  } else if (document.location.pathname.includes("/player/")) {
    const video = document.querySelector<HTMLVideoElement>("#video-component"),
      { currentTime, duration, paused } = video,
      [, endTimestamp] = presence.getTimestamps(
        Math.floor(currentTime),
        Math.floor(duration)
      ),
      title = document.querySelector(".primary-title").textContent,
      user = document.querySelector(".secondary-title").textContent;

    if (!isNaN(duration)) {
      presenceData.smallImageKey = paused ? "pause" : "play";
      presenceData.smallImageText = paused
        ? (await strings).pause
        : (await strings).play;
      presenceData.endTimestamp = endTimestamp;

      presenceData.details = title;
      presenceData.state = user;

      if (paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    } else if (isNaN(duration)) {
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = "Looing at:";
      presenceData.state = `${title} | ${user}`;
    }
  } else if (document.location.pathname.includes("/shows/")) {
    if (document.querySelector(".show-title") !== null) {
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = "Viewing show:";
      presenceData.state = document.querySelector(".show-title").textContent;
    } else if (document.location.pathname.includes("/search")) {
      presenceData.startTimestamp = browsingStamp;
      presenceData.smallImageKey = "search";
      presenceData.details = "Searching for:";
      presenceData.state = document
        .querySelector(".shelf-header-title")
        .textContent.replace("Search Results for ", "")
        .replace("'", "");
    } else {
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = "Browsing for shows...";
    }
  } else if (document.location.pathname.includes("/genres/")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Viewing genre:";
    presenceData.state = document.querySelector(
      ".shelf-header-title"
    ).textContent;
    presenceData.smallImageKey = "reading";
  } else if (document.location.pathname.includes("/genres")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Browsing genres...";
  } else if (document.location.pathname.includes("/simulcasts")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Browsing simulcasts...";
  } else if (document.location.pathname.includes("/movies")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Browsing movies...";
  } else if (document.location.pathname.includes("/watchlist")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Viewing their watchlist...";
  } else if (document.location.pathname.includes("/profile")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Viewing their profile...";
  }

  if (presenceData.details === null) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});
