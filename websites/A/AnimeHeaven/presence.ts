const presence = new Presence({
    clientId: "822949091776004177"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  });

/**
 * Get timestamps (borrowed from twist.moe Presence)
 * @param {Number} videoTime Current video time seconds
 * @param {Number} videoDuration Video duration seconds
 */
function getTimestamps(
  videoTime: number,
  videoDuration: number
): Array<number> {
  const startTime = Date.now(),
    endTime = Math.floor(startTime / 1000) - videoTime + videoDuration;
  return [Math.floor(startTime / 1000), endTime];
}

let lastPlaybackState = null,
  playback,
  browsingStamp = Math.floor(Date.now() / 1000);

if (lastPlaybackState != playback) {
  lastPlaybackState = playback;
  browsingStamp = Math.floor(Date.now() / 1000);
}

let iFrameVideo: HTMLVideoElement;
presence.on("iFrameData", ({ video }: { video: HTMLVideoElement }) => {
  iFrameVideo = video;
});

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "logo"
    },
    path = window.location.pathname.toLowerCase();

  presenceData.state = "Browsing...";
  presenceData.startTimestamp = browsingStamp;

  if (path.startsWith("/detail")) {
    const title = document.querySelector(
      ".infobox .infoboxc .infodesbox .infodes h1"
    ).textContent;
    presenceData.details = title;
  } else if (path.startsWith("/watch")) {
    const title = document.querySelector(".now2 .c a").textContent,
      episode = document
        .querySelector(".now2 .c")
        .lastChild.textContent.substring(3);
    presenceData.details = title;
    presenceData.state = episode;

    if (iFrameVideo) {
      const video = iFrameVideo;

      presenceData.smallImageKey = video.paused ? "pause" : "play";
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play;

      if (!video.paused) {
        const [startTimestamp, endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration)
        );
        presenceData.startTimestamp = startTimestamp;
        presenceData.endTimestamp = endTimestamp;
      }

      return presence.setActivity(presenceData, !video.paused);
    }
  }

  presence.setActivity(presenceData, true);
});
