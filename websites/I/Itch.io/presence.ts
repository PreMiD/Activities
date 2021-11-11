const presence = new Presence({
    clientId: "752464948965408768"
  }),
  browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "logo"
  };

  if (document.location.hostname.includes("itch.io")) {
    const 
      { pathname } = document.location;

    if (const presence = new Presence({
    clientId: "752464948965408768"
  }),
  browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "logo"
  };

  if (document.location.hostname.includes("itch.io")) {
    const { hostname } = document.location,
      { pathname } = document.location;

    if (hostname.split(".")[0] !== "itch") {
      if (pathname === "/") {
        presenceData.startTimestamp = browsingTimestamp;
        presenceData.details = "Viewing Developer Profile";
        presenceData.state = document.title.replace(" - itch.io", "");
      } else {
        const [gameName, devName] = document.title.split(" by ");
        presenceData.details = gameName;
        presenceData.state = devName;
        if (document.querySelector(".game_loaded")) {
          presenceData.startTimestamp = browsingTimestamp;
          presenceData.smallImageKey = "play";
          presenceData.smallImageText = "Playing";
        }
        if (pathname.split("/")[2] === "devlog")
          presenceData.state = `${devName}'s Devlog`;
      }
    } else if (
      pathname.startsWith("/board") ||
      pathname.startsWith("/community")
    ) {
      presenceData.startTimestamp = browsingTimestamp;
      presenceData.details = "In Community Discussion";
    } else if (
      pathname.startsWith("/jam") &&
      pathname.split("/")[2] &&
      document.querySelector(".jam_header_widget")
    ) {
      presenceData.startTimestamp = browsingTimestamp;
      presenceData.details = (
        document.querySelector(".jam_title_header") as HTMLElement
      ).textContent;
      presenceData.state = `Jam ${
        (document.querySelector(".jam_host_header") as HTMLElement).textContent
      }`;
    } else {
      presenceData.startTimestamp = browsingTimestamp;
      switch (pathname) {
        //Games
        case "/games":
          presenceData.details = "Browsing Games";
          break;
        //Devlogs
        case "/devlogs":
          presenceData.details = "Browsing Devlogs";
          break;
        //Jams
        case "/jams":
          presenceData.details = "Browsing Jams";
          break;
        //Dashboard
        case "/dashboard":
          presenceData.details = "Dashboard";
          break;
        //Feed
        case "/my-feed":
          presenceData.details = "Browsing My Feed";
          break;
        case "/featured-games-feed":
          presenceData.details = "Browsing Featured Games Feed";
          break;
        case "/feed":
          presenceData.details = "Browsing Global Feed";
          break;
        //Default Idle
        default:
          presenceData.details = "Idling";
          break;
      }
    }
  }

if (presenceData.details) presence.setActivity(presenceData);
else presence.setActivity(); 
});
.split(".")[0] !== "itch") {
      if (pathname === "/") {
        presenceData.startTimestamp = browsingTimestamp;
        presenceData.details = "Viewing Developer Profile";
        presenceData.state = document.title.replace(" - itch.io", "");
      } else {
        const [gameName, devName] = document.title.split(" by ");
        presenceData.details = gameName;
        presenceData.state = devName;
        if (document.querySelector(".game_loaded")) {
          presenceData.startTimestamp = browsingTimestamp;
          presenceData.smallImageKey = "play";
          presenceData.smallImageText = "Playing";
        }
        if (pathname.split("/")[2] === "devlog")
          presenceData.state = `${devName}'s Devlog`;
      }
    } else if (
      pathname.startsWith("/board") ||
      pathname.startsWith("/community")
    ) {
      presenceData.startTimestamp = browsingTimestamp;
      presenceData.details = "In Community Discussion";
    } else if (
      pathname.startsWith("/jam") &&
      pathname.split("/")[2] &&
      document.querySelector(".jam_header_widget")
    ) {
      presenceData.startTimestamp = browsingTimestamp;
      presenceData.details = (
        document.querySelector(".jam_title_header") as HTMLElement
      ).textContent;
      presenceData.state = `Jam ${
        (document.querySelector(".jam_host_header") as HTMLElement).textContent
      }`;
    } else {
      presenceData.startTimestamp = browsingTimestamp;
      switch (pathname) {
        //Games
        case "/games":
          presenceData.details = "Browsing Games";
          break;
        //Devlogs
        case "/devlogs":
          presenceData.details = "Browsing Devlogs";
          break;
        //Jams
        case "/jams":
          presenceData.details = "Browsing Jams";
          break;
        //Dashboard
        case "/dashboard":
          presenceData.details = "Dashboard";
          break;
        //Feed
        case "/my-feed":
          presenceData.details = "Browsing My Feed";
          break;
        case "/featured-games-feed":
          presenceData.details = "Browsing Featured Games Feed";
          break;
        case "/feed":
          presenceData.details = "Browsing Global Feed";
          break;
        //Default Idle
        default:
          presenceData.details = "Idling";
          break;
      }
    }
  }

if (presenceData.details) presence.setActivity(presenceData);
else presence.setActivity(); 
});
