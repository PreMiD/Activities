const presence: Presence = new Presence({
  clientId: "897325334200975360"
});

async function getStrings() {
  return presence.getStrings(
    {
      play: "general.playing",
      pause: "general.paused",
      browsing: "general.browsing",
      watchingMovie: "general.watchingMovie",
      watchingSeries: "general.watchingSeries",
      watchingLive: "general.watchingLive",
      watchEpisode: "general.buttonViewEpisode",
      watchVideo: "general.buttonWatchVideo",
      watchLive: "general.live",
      watchStream: "general.buttonWatchStream"
    },
    await presence.getSetting("lang").catch(() => "en")
  );
}

let strings = getStrings(),
  oldLang: string = null,
  title: string,
  subtitle: string,
  groupWatchCount: number;

presence.on("UpdateData", async () => {
  const newLang: string = await presence.getSetting("lang").catch(() => "en"),
    privacy: boolean = await presence.getSetting("privacy"),
    time: boolean = await presence.getSetting("time"),
    buttons: boolean = await presence.getSetting("buttons"),
    groupWatchBtn: boolean = await presence.getSetting("groupWatchBtn"),
    isHostSP = /(www\.)?starplus\.com/.test(location.hostname),
    presenceData: PresenceData & {
      partySize?: number;
      partyMax?: number;
    } = {};

  // Update strings when user sets language
  if (oldLang !== newLang) {
    oldLang = newLang;
    strings = getStrings();
  }

  if (isHostSP) presenceData.largeImageKey = "starplus-logo";

  // Star+ videos
  if (isHostSP && location.pathname.includes("/video/")) {
    const video: HTMLVideoElement = document.querySelector(
      ".btm-media-clients video"
    );

    if (video && !isNaN(video.duration)) {
      const groupWatchId = new URLSearchParams(location.search).get(
        "groupWatchId"
      );

      if (!privacy && groupWatchId) {
        groupWatchCount = Number(
          document.querySelector(
            ".btm-media-overlays-container .group-profiles-control .group-profiles-control__count"
          )?.textContent
        );
      }

      title = document.querySelector<HTMLDivElement>(
        ".btm-media-overlays-container .title-field"
      )?.textContent;
      subtitle = document.querySelector<HTMLDivElement>(
        ".btm-media-overlays-container .subtitle-field"
      )?.textContent; // episode or empty if it's a movie

      if (!privacy && groupWatchId) {
        presenceData.details = `${title} ${subtitle ? `- ${subtitle}` : ""}`;
        presenceData.state = "In a GroupWatch";
      } else if (privacy) {
        presenceData.state = subtitle
          ? (await strings).watchingSeries
          : (await strings).watchingMovie;
      } else {
        presenceData.details = title;
        presenceData.state = subtitle || "Movie";
      }

      presenceData.smallImageKey = video.paused ? "pause" : "play";
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play;
      [presenceData.startTimestamp, presenceData.endTimestamp] =
        presence.getTimestampsfromMedia(video);

      // remove timestamps if video is paused or user disabled timestamps
      if (video.paused || !time) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }

      // set GroupWatch participants size
      if (!privacy && groupWatchId) {
        presenceData.partySize = groupWatchCount;
        presenceData.partyMax = 7;
      }

      // add buttons, if enabled
      if (!privacy && buttons) {
        presenceData.buttons = [
          {
            label: subtitle
              ? (await strings).watchEpisode
              : (await strings).watchVideo,
            url: `https://www.starplus.com${location.pathname}`
          }
        ];

        // change button if GroupWatch is active and user enabled the button
        if (groupWatchId && groupWatchBtn) {
          presenceData.buttons.push({
            label: "Join GroupWatch",
            url: `https://www.starplus.com/groupwatch/${groupWatchId}`
          });
        }
      }

      if (title) presence.setActivity(presenceData, !video.paused);
    }

    //Star+ Livestreams
  } else if (isHostSP && location.pathname.includes("/live-event/")) {
    const video: HTMLVideoElement = document.querySelector(
      ".btm-media-clients video"
    );

    if (video && !isNaN(video.duration)) {
      title = document.querySelector<HTMLDivElement>(
        ".btm-media-overlays-container .title-field"
      )?.textContent;
      subtitle = document.querySelector<HTMLDivElement>(
        ".btm-media-overlays-container .subtitle-field"
      )?.textContent; // episode or empty if it's a movie

      if (!privacy) {
        presenceData.details = `${title} ${subtitle ? `- ${subtitle}` : ""}`;
        presenceData.state = (await strings).watchLive;
      } else if (privacy) presenceData.state = (await strings).watchingLive;

      presenceData.smallImageKey = video.paused ? "pause" : "play";
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play;

      // add buttons, if enabled
      if (!privacy && buttons) {
        presenceData.buttons = [
          {
            label: (await strings).watchStream,
            url: `https://www.starplus.com${location.pathname}`
          }
        ];
      }
      if (title) presence.setActivity(presenceData, !video.paused);
    }

    // GroupWatch lobby
  } else if (
    isHostSP &&
    !privacy &&
    location.pathname.includes("/groupwatch/")
  ) {
    groupWatchCount = document.querySelectorAll(
      ".gw-avatar-enter-done:not([id=gw-invite-button])"
    ).length;

    const seriesFields: NodeListOf<HTMLDivElement> = document.querySelectorAll(`
      #webAppScene main #group + div:not([id]) h3[style]:nth-of-type(1),
      #webAppScene main #group + div:not([id]) h3[style]:nth-of-type(2)
    `);

    if (seriesFields.length > 0) {
      title = seriesFields[0]?.textContent;
      subtitle = seriesFields[1]?.textContent;
    } else {
      title = document.querySelector<HTMLImageElement>(
        "#webAppScene main #group + div:not([id]) img[alt]"
      )?.alt;
    }

    presenceData.details = `${title} ${subtitle ? `- ${subtitle}` : ""}`;
    presenceData.state = "Starting a GroupWatch";
    // set GroupWatch participants size
    presenceData.partySize = groupWatchCount;
    presenceData.partyMax = 7;

    // add button, if enabled
    if (buttons && groupWatchBtn) {
      presenceData.buttons = [
        {
          label: "Join GroupWatch",
          url: location.pathname
        }
      ];
    }

    if (title) presence.setActivity(presenceData, false);

    //Browsing
  } else {
    presenceData.details = (await strings).browsing;
    presence.setActivity(presenceData);
  }
});
