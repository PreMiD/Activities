const presence = new Presence({
    clientId: "842112189618978897"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  });

function getTime(list: string[]): number {
  let ret = 0;
  for (let index = list.length - 1; index >= 0; index--)
    ret += parseInt(list[index]) * 60 ** index;

  return ret;
}

function getTimestamps(audioDuration: string): Array<number> {
  const splitAudioDuration = audioDuration.split(":").reverse(),
    parsedAudioDuration = getTime(splitAudioDuration),
    startTime = Date.now(),
    endTime = Math.floor(startTime / 1000) + parsedAudioDuration;
  return [Math.floor(startTime / 1000), endTime];
}

presence.on("UpdateData", async () => {
  const data: PresenceData = {
      largeImageKey: "applemusic-logo"
    },
    playerCheck = document.querySelector(
      "div.web-chrome-playback-lcd__playback-description.playback-description-not-loaded"
    )
      ? false
      : true;

  if (playerCheck) {
    const title = document
        .querySelector(
          ".web-chrome-playback-lcd__song-name-scroll-inner-text-wrapper"
        )
        ?.textContent.trim(),
      author =
        document
          .querySelector(
            ".web-chrome-playback-lcd__sub-copy-scroll-inner-text-wrapper"
          )
          ?.textContent.split("—")[0] ||
        document.querySelector(
          ".ember-view.web-chrome-playback-lcd__sub-copy-scroll-link"
        )?.textContent,
      audioTime = document.querySelector(
        ".web-chrome-playback-lcd__time-end"
      )?.textContent,
      paused = document.querySelector(
        ".web-chrome-playback-controls__playback-btn[aria-label='Play']"
      )
        ? true
        : false;

    data.details = title;
    data.state = author;
    data.smallImageKey = paused ? "pause" : "play";
    data.smallImageText = paused ? (await strings).pause : (await strings).play;
    if (audioTime) [data.startTimestamp, data.endTimestamp] = getTimestamps(audioTime);

    if (paused) {
      delete data.startTimestamp;
      delete data.endTimestamp;
    }

    if (!data.details) presence.clearActivity();
    else presence.setActivity(data);
  } else presence.clearActivity();
});
