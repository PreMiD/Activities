const presence = new Presence({
  clientId: "810203651317432351"
}),
strings = presence.getStrings({
  play: "presence.playback.playing",
  pause: "presence.playback.paused"
});

function getTimestamps(
videoTime: number,
videoDuration: number
): Array<number> {
const startTime = Date.now(),
  endTime = Math.floor(startTime / 1000) - videoTime + videoDuration;
return [Math.floor(startTime / 1000), endTime];
}
const browsingStamp = Math.floor(Date.now() / 1000);

let timestamps,
  video:HTMLVideoElement,
  currentTime: number,
  duration: number,
  paused: boolean;
presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "geno",
    startTimestamp: browsingStamp

  },

title = document.title; //title of the page
  
  if (document.location.pathname == "/" ) {
    presenceData.details = "Exploring Genoanime";
  } else if (document.location.pathname.includes("/browse")) {
    presenceData.details = "Exploring Genoanime library";
    presenceData.buttons = [{label:"View Library",url: document.location.href}];
  }
  else if (document.location.pathname.includes("/details")) {
    presenceData.details = "Browsing...";
  } 
  else if (document.location.pathname.includes("/watch")) {
    presenceData.details = title;
    presenceData.state = 'Episode '+ String(document.location.href.split("episode=")[1]);
    presenceData.buttons = [{label:"Watch Episode",url: document.location.href}];
    video = document.querySelector(
      "div > div.plyr__video-wrapper > video"
    );
    (currentTime = video.currentTime),
    (duration = video.duration),
    (paused = video.paused),
    (timestamps = getTimestamps(
      Math.floor(currentTime),
      Math.floor(duration)
    ));
    if (!isNaN(duration)) {
      presenceData.smallImageKey = paused ? "pause-v1" : "play-v1";
      presenceData.smallImageText = paused
        ? (await strings).pause
        : (await strings).play;
      presenceData.startTimestamp = timestamps[0];
      presenceData.endTimestamp = timestamps[1];
      if (paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    }
 }
  else if (document.location.pathname.includes("/search")) {
    presenceData.details = "Searching Catalogue";
  }
  else if (document.location.pathname.includes("/amv")) {
    presenceData.details = "Watching AMV videos";
    presenceData.buttons = [{label:"Watch Video",url: document.location.href}];
 }

  else if (document.location.pathname.includes("/favorite")) {
    presenceData.details = "Browsing Favourites";
  }
  
  else if (document.location.pathname.includes("/schedule")) {
    presenceData.details = "Checking Schedule";
    presenceData.buttons = [{label:"View Schedule",url: document.location.href}];
  }
  if (presenceData.details == null) {
    presence.setTrayTitle();
    presence.setActivity();
  } else {
    presence.setActivity(presenceData);
  }
});
