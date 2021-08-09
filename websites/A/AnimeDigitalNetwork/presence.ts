const presence = new Presence({
    clientId: "808758769424138252"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  });

presence.on("UpdateData", async () => {
  const video: HTMLVideoElement = document.querySelector("video.vjs-tech"),
    presenceData: PresenceData = {
      largeImageKey: "logo"
    };

  if (document.location.pathname.includes("video") && video) {
    const episode = JSON.parse(
      document.querySelector(
        "#root > div > div > div.sc-pkSvE.kPCOPp > div > div:nth-child(1) > script"
      ).textContent
    );
    if (!isNaN(video.duration)) {
      const timestamps = presence.getTimestampsfromMedia(video);
      presenceData.details = episode.partOfSeries.name;
      presenceData.smallImageKey = video.paused ? "pause" : "play";
      presenceData.smallImageText = video.paused
        ? (await strings).pause
        : (await strings).play;
      presenceData.endTimestamp = timestamps[1];
      presenceData.buttons = [
        {
          label: "Watch Episode",
          url: document.location.href
        }
      ];

      if (video.paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    } else {
      presenceData.details = "Looking at";
      presenceData.state = episode.partOfSeries.name;
      presenceData.buttons = [
        {
          label: "View Page",
          url: document.location.href
        }
      ];
    }
  } else if (document.location.pathname.includes("video") && !video) {
    const catalogue = document.querySelector(
      "#root > div > div > div.sc-pkSvE.kPCOPp > div > div > div.sc-AxjAm.khAjwj.sc-psDXd.iazofB > div > h2 > span"
    );
    if (catalogue) 
      presenceData.details = "Browsing...";
     else {
      const episode = JSON.parse(
        document.querySelector(
          "#root > div > div > div.sc-pkSvE.kPCOPp > div > div > div.sc-psOyd.fIwdpb > script"
        ).textContent
      );
      presenceData.details = "Looking at";
      presenceData.state = episode.name;
      presenceData.buttons = [
        {
          label: "View Page",
          url: document.location.href
        }
      ];
    }
  } else 
    presenceData.details = "Browsing...";
  
  if (!presenceData.details) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});
