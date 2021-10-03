const presence = new Presence({
  clientId: "711871296346128395"
});

let strings,
  clipTitle,
  rewardString,
  titleSiteCreator,
  titleDashboard = "Dashboard";
const browsingStamp = Math.floor(Date.now() / 1000),
  userType = [
    "Viewing the ",
    "Viewing their ",
    "Modifying their ",
    "Creating their "
  ];

presence.on("UpdateData", async () => {
  strings = await presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  });
  const presenceData: PresenceData = {
    largeImageKey: "logo"
  };

  switch (window.location.hostname) {
    case "howto.streamlabs.com":
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = `${userType[0]}Forums`;
      break;
    case "support.streamlabs.com":
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = `${userType[0]}Support Pages`;
      break;
    case "dev.streamlabs.com":
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = `${userType[0]}API Documentation`;
      break;
    case "ideas.streamlabs.com":
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = `${userType[0]}Feature Suggestions`;
      break;
  }

  if (window.location.hostname === "streamlabs.com") {
    switch (document.location.pathname) {
      case "/":
        presenceData.startTimestamp = browsingStamp;
        presenceData.details = "Home Page";
        break;
      case "/login":
        presenceData.startTimestamp = browsingStamp;
        presenceData.details = "Logging in";
        break;
      case "/clips":
        presenceData.startTimestamp = browsingStamp;
        presenceData.details = `${userType1}Clips`;
        break;
      case "/best-donation-clips":
        presenceData.startTimestamp = browsingStamp;
        presenceData.details = `${userType[0]}Best Clips`;
        break;
    }

    if (document.location.pathname.includes("/clips/watch")) {
      const video: HTMLVideoElement =
        document.querySelector(".video-js > video");
      [clipTitle, clipTitle1, clipTitle2] = document
        .querySelector(".clip__action-info > div:nth-child(1)")
        .innerHTML.split(" ");
      switch (!video.paused) {
        case true:
          presenceData.smallImageKey = "play";
          presenceData.smallImageText = strings.play;
          presenceData.endTimestamp = new Date(
            Date.now() + (video.duration - video.currentTime) * 1000
          ).getTime();
          break;
        case false:
          presenceData.smallImageKey = "pause";
          presenceData.smallImageText = strings.pause;
          presenceData.endTimestamp = null;
          break;
      }
      presenceData.details = `Watching ${clipTitle} to`;
      presenceData.state = clipTitle2;
    } else if (document.location.pathname.includes("/dashboard")) {
      switch (document.location.hash) {
        case "#/widgets":
          titleDashboard = `${userType1}Widgets`;
          break;
        case "#/cloudbot/mod-tools":
          titleDashboard = `${userType1}Cloudbot`;
          break;
        case "#/stats":
          titleDashboard = `${userType1}Dashboard`;
          break;
        case "#/alertbox":
          titleDashboard = `${userType1}Alert Boxes`;
          break;
        case "#/merchadmin":
          titleDashboard = `${userType2}Merch Store`;
          break;
        case "#/charity":
          titleDashboard = `${userType}Charity Campaigns`;
          break;
        case "#/university":
          titleDashboard = `${userType}University Lessons`;
          break;
        case "#/streamlabs-rewards":
          titleDashboard = `${userType1}Rewards`;
          rewardString = document.querySelector(
            "#sl__dashboard > div > div.content > div.dashboard-content > div.dashboard-body > div > div > div:nth-child(1) > div:nth-child(1) > span"
          ).innerHTML;
          presenceData.state =
            rewardString.charAt(0).toUpperCase() + rewardString.slice(1);
          //Streamlabs rewards does not captilise first string of the teir.
          break;
      }
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = titleDashboard;
    } else if (document.location.pathname.includes("/editor")) {
      titleSiteCreator = `${userType[3]}Site`;
      presenceData.startTimestamp = browsingStamp;
      presenceData.details = titleSiteCreator;
    }
  }

  if (document.location.pathname.includes("/clips/watch")) {
    const video: HTMLVideoElement = document.querySelector(".video-js > video");
    clipTitle = document
      .querySelector(".clip__action-info > div:nth-child(1)")
      .innerHTML.split(" ");
    switch (!video.paused) {
      case true:
        presenceData.smallImageKey = "play";
        presenceData.smallImageText = strings.play;
        presenceData.endTimestamp = new Date(
          Date.now() + (video.duration - video.currentTime) * 1000
        ).getTime();
        break;
      case false:
        presenceData.smallImageKey = "pause";
        presenceData.smallImageText = strings.pause;
        presenceData.endTimestamp = new Date(
          Date.now() + (video.duration - video.currentTime) * 1000
        ).getTime();
        break;
      default:
        presenceData.smallImageKey = null;
        presenceData.smallImageText = null;
        break;
    }
    presenceData.details = `Watching ${clipTitle[0]} to`;
    presenceData.state = clipTitle[2];
  } else if (document.location.pathname.includes("/dashboard")) {
    switch (document.location.hash) {
      case "#/widgets":
        titleDashboard = `${userType1}Widgets`;
        break;
      case "#/cloudbot/mod-tools":
        titleDashboard = `${userType1}Cloudbot`;
        break;
      case "#/stats":
        titleDashboard = `${userType1}Dashboard`;
        break;
      case "#/alertbox":
        titleDashboard = `${userType1}Alert Boxes`;
        break;
      case "#/merchadmin":
        titleDashboard = `${userType[2]}Merch Store`;
        break;
      case "#/charity":
        titleDashboard = `${userType[0]}Charity Campaigns`;
        break;
      case "#/university":
        titleDashboard = `${userType[0]}University Lessons`;
        break;
      case "#/streamlabs-rewards":
        titleDashboard = `${userType1}Rewards`;
        rewardString = document.querySelector(
          "#sl__dashboard > div > div.content > div.dashboard-content > div.dashboard-body > div > div > div:nth-child(1) > div:nth-child(1) > span"
        ).innerHTML;
        presenceData.state =
          rewardString.charAt(0).toUpperCase() + rewardString.slice(1);
        //Streamlabs rewards does not captilise first string of the teir.
        break;
    }
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = titleDashboard;
  } else if (document.location.pathname.includes("/editor")) {
    titleSiteCreator = `${userType[3]}Site`;
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = titleSiteCreator;
  }

  if (presenceData.details === null) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});
