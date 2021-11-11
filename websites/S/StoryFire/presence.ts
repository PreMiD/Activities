const presence = new Presence({
    clientId: "779397757928210472"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  }),
  getTimestamps = (videoTime: number, videoDuration: number): number[] => {
    const startTime = Date.now();
    return [
      Math.floor(startTime / 1000),
      Math.floor(startTime / 1000) - videoTime + videoDuration
    ];
  };

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "storyfire"
    },
    video: HTMLVideoElement = document.querySelector(
      "#storyfire-player_html5_api"
    ),
    buttons = await presence.getSetting("buttons");

  if (document.location.pathname.startsWith("/video-details")) {
    const [startTimestamp, endTimestamp] = getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration)
    );

    presenceData.details = document.querySelector(
      ".title > div:not(.series)"
    ).textContent;
    presenceData.state = document.querySelector(".user-name").textContent;
    if (!video.paused) {
      presenceData.startTimestamp = startTimestamp;
      presenceData.endTimestamp = endTimestamp;
      presenceData.smallImageKey = "play";
      presenceData.smallImageText = (await strings).play;
    } else {
      presenceData.smallImageKey = "pause";
      presenceData.smallImageText = (await strings).pause;
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: "Watch",
          url: document.URL
        }
      ];
    }
  } else if (document.location.pathname.startsWith("/forgot-password"))
    presenceData.details = "Forgot Password";
  else if (document.location.pathname.startsWith("/social"))
    presenceData.details = "Viewing social";
  else if (document.location.pathname.startsWith("/leaderboard"))
    presenceData.details = "Viewing leaderboard";
  else if (document.location.pathname.startsWith("/blaze"))
    presenceData.details = "Viewing Blaze page";
  else if (document.location.pathname.startsWith("/profile"))
    presenceData.details = "Viewing their profile";
  else if (document.location.pathname.startsWith("/user")) {
    presenceData.details = "Viewing a user's profile";
    presenceData.state = document.querySelector(".username h3").textContent;
  } else if (document.location.pathname.startsWith("/story"))
    presenceData.details = "Writing a story";
  else if (document.location.pathname.startsWith("/legal-policies"))
    presenceData.details = "Viewing legal & policies";
  else if (document.location.pathname.startsWith("/search")) {
    presenceData.details = "Searching";
    presenceData.smallImageKey = "search";
    if (
      (await presence.getSetting("showsearchterm")) &&
      document.querySelector(".content-header > span")
    ) {
      presenceData.state = document.querySelector(
        ".content-header > span"
      ).childNodes[1].textContent;
    }
  }

  if (presenceData.details) presence.setActivity(presenceData);
  else presence.setActivity();
});
