const presence = new Presence({
    clientId: "889918462477095012"
  }),
  browsingTimestamp = new Date().getTime();

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "logo",
      startTimestamp: browsingTimestamp
    },
    pathnames = location.pathname.split("/");

  if (pathnames[1] === "") {
    //Uploads
    const subCount =
        document.querySelector(".simplebar-content")?.children.length,
      showCount = await presence.getSetting("subscriptions");

    presenceData.details = "Vieweing uploads";

    if (showCount && subCount > 0) {
      presenceData.state = `${subCount - 1} ${
        subCount > 2 ? "Subscriptions" : "Subscription"
      }`;
    }
  } else if (pathnames[1] === "discover") {
    //Homepage

    presenceData.details = "Viewing Homepage";
    presenceData.state = "Say Hello To Floatplane";
  } else if (pathnames[1] === "browse") {
    //Browsing
    const searchTerm = (
        document.querySelector(".search-bar") as HTMLInputElement
      )?.value,
      channelCount = document.querySelector(".creator-cards")?.children.length;

    presenceData.details = "Browsing";
    presenceData.state = `${channelCount} Channels`;
    presenceData.smallImageKey = "reading";
    presenceData.smallImageText = "Browsing";

    if (searchTerm) {
      let stringFormated;

      switch (channelCount) {
        case 1:
          if (document.querySelector(".search-not-found")) {
            stringFormated = "No Results";
            break;
          }
          stringFormated = `1 Channel`;
          break;

        default:
          stringFormated = `${channelCount} Channels`;
      }

      presenceData.details = `Searching: ${searchTerm}`;
      presenceData.state = stringFormated;
      presenceData.smallImageKey = "search";
      presenceData.smallImageText = "Searching";
    }
  } else if (pathnames[1] === "channel") {
    //Viewing a channel
    const channelTitle = document.querySelector(".channel-title")?.textContent;

    //Wait for page to load
    if (!channelTitle) return;

    presenceData.details = "Viewing channel:";
    presenceData.state = channelTitle;

    presenceData.largeImageKey = pathnames[2].toLowerCase();

    presenceData.smallImageKey = "logo";
    presenceData.smallImageText = document.title;

    presenceData.buttons = [{ label: "View Channel", url: location.href }];

    if (pathnames[3] === "live") {
      //Not tested - should work

      //Stream
      const title = document.querySelector(".title-text")?.textContent,
        video = document.querySelector("video") as HTMLVideoElement;

      if (!video) return;

      const timestamps = presence.getTimestampsfromMedia(video);

      presenceData.details = title;

      delete presenceData.startTimestamp;

      presenceData.endTimestamp = timestamps[1] ?? -1;

      presenceData.smallImageKey = "live";
      presenceData.smallImageText = "Live";
      presenceData.buttons = [
        {
          label: "View Stream",
          url: location.href
        },
        {
          label: "View Channel",
          url: (document.querySelector(".channel-title") as HTMLLinkElement)
            ?.href
        }
      ];
    }
  } else if (pathnames[2] === "profile") {
    //User

    const channelTitle = document.querySelector(".channel-title").textContent;

    //Wait for page to load
    if (!channelTitle) return;

    presenceData.details = "Viewing user:";
    presenceData.state = channelTitle;

    presenceData.buttons = [{ label: "View User", url: location.href }];
  } else if (pathnames[2] === "settings") {
    //Settings

    presenceData.details = "Viewing thier";
    presenceData.state = "Settings";
  } else if (pathnames[2] === "help") {
    //Help pages

    presenceData.details = "Viewing:";
    presenceData.state = "Support pages";
  } else if (pathnames[1] === "support") {
    //Support Pages
    const searchTerm = (document.querySelector("#search") as HTMLInputElement)
        .value,
      faqCount = document.querySelectorAll(".question-answer").length;

    presenceData.details = "Viewing FAQ";
    presenceData.state = `${faqCount} topics`;

    if (searchTerm) {
      let stringFormated;

      switch (faqCount) {
        case 1:
          stringFormated = `1 Topic`;
          break;
        case 0:
          stringFormated = "No Results";
          break;
        default:
          stringFormated = `${faqCount} Topics`;
      }

      presenceData.details = `Searching FAQ: ${searchTerm}`;
      presenceData.state = stringFormated;
      presenceData.smallImageKey = "search";
      presenceData.smallImageText = "Searching";
    }
  } else if (pathnames[1] === "legal") {
    //Support Pages

    presenceData.details = "Legal Stuff";
    presenceData.buttons = [
      {
        label: "Terms of Service",
        url: "https://www.floatplane.com/legal/terms"
      },
      {
        label: "Privacy Policy",
        url: "https://www.floatplane.com/legal/privacy"
      }
    ];
  } else if (pathnames[1] === "post") {
    //Video
    const title = document.querySelector(".title-text")?.textContent,
      channel = document.querySelector(".channel-title")?.textContent,
      channelURL = (
        document.querySelector(".channel-title") as HTMLLinkElement
      )?.href.toLowerCase(),
      video = document.querySelector("video") as HTMLVideoElement;

    //Wait for page to load
    if (!video) return;

    const timestamps = presence.getTimestampsfromMedia(video);

    presenceData.details = title;
    presenceData.state = channel;

    presenceData.largeImageKey = channelURL?.split("/").slice(-1)[0];

    delete presenceData.startTimestamp;

    presenceData.endTimestamp = timestamps[1];

    presenceData.smallImageKey = video.paused ? "pause" : "play";
    presenceData.smallImageText = video.paused ? "Paused" : "Playing";
    presenceData.buttons = [
      {
        label: "View Video",
        url: location.href
      },
      {
        label: "View Channel",
        url: (document.querySelector(".channel-title") as HTMLLinkElement).href
      }
    ];

    if (video.paused) {
      delete presenceData.startTimestamp;
      delete presenceData.endTimestamp;
    }
  }

  const showButtons = await presence.getSetting("buttons");

  if (!showButtons) delete presenceData.buttons;

  if (!presenceData.details) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});
