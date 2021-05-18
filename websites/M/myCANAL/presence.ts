var presence = new Presence({
    clientId: "844106861711196179"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused",
    live: "presence.activity.live"
  });

/**
 * Get Timestamps
 * @param {Number} videoTime Current video time seconds
 * @param {Number} videoDuration Video duration seconds
 */
function getTimestamps(
  videoTime: number,
  videoDuration: number
): Array<number> {
  var startTime = Date.now();
  var endTime = Math.floor(startTime / 1000) - videoTime + videoDuration;
  return [Math.floor(startTime / 1000), endTime];
}

var elapsed = Math.floor(Date.now() / 1000);
var title;

presence.on("UpdateData", async () => {
  const data: PresenceData = {
    largeImageKey: "logo"
  };

  var video: HTMLVideoElement = document.querySelector(
    ".aPWk0-TaQEzvggxIT6qvP"
  );
  if (video && !isNaN(video.duration)) {
    var Ad = document.querySelector("._3uUpH58Juk_Qbizq6j5ThG") ? true : false;
    if (!Ad) {
      var path = document.location.pathname;
      if (path.includes("/live/")) {
        title = document.querySelector("._3tdt8zwgvMCJ6v_sElXneQ").textContent;
        data.smallImageKey = "live";
        data.smallImageText = (await strings).live;
        data.startTimestamp = elapsed;
      } else {
        title = document.querySelector(".bodyTitle___DZEtt").textContent;
        var timestamps = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration)
        );
        data.smallImageKey = video.paused ? "pause" : "play";
        data.smallImageText = video.paused
          ? (await strings).pause
          : (await strings).play;
        (data.startTimestamp = timestamps[0]),
          (data.endTimestamp = timestamps[1]);
      }
      var subtitle = document.querySelector(
        "._39WJKEhrSYo7ftwMlFjZtA  ._3tdt8zwgvMCJ6v_sElXneQ"
      ).textContent;
      data.details = title;
      data.state = subtitle;

      if (video.paused) {
        delete data.startTimestamp;
        delete data.endTimestamp;
      }

      if (title !== null && subtitle !== null) {
        presence.setActivity(data, !video.paused);
      }
    } else {
      (data.details = "Watching an Ad"), presence.setActivity(data);
    }
  } else {
    (data.details = "Browsing..."), presence.setActivity(data);
  }
});
