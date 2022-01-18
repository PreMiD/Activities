const presence = new Presence({
    clientId: "867452106016161822"
  }),
  browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", () => {
  const presenceData: PresenceData = {
    largeImageKey: "large_image",
    details: "LABY.net",
    startTimestamp: browsingTimestamp
  };
  if (document.location.pathname.startsWith("/skins"))
    presenceData.details = "Viewing Skins";
  else if (document.location.pathname.startsWith("/capes"))
    presenceData.details = "Viewing Minecraft capes";
  else if (document.location.pathname.startsWith("/cloaks"))
    presenceData.details = "Viewing LabyMod cloaks";
  else if (document.location.pathname.startsWith("/badges"))
    presenceData.details = "Viewing LABY.net badges";
  else if (document.location.pathname.startsWith("/settings"))
    presenceData.details = "Viewing profile settings";
  else if (document.location.pathname.startsWith("/@")) {
    presenceData.details = "Viewing Profile of:";
    presenceData.state =
      document.querySelector("div.col-12>h1")?.textContent ??
      "an invalid account";
    presenceData.buttons = [
      {
        label: `View ${
          document.querySelector("div.col-12>h1")?.textContent ?? "Unknown"
        }'s profile`,
        url: window.location.href
      }
    ];
  } else if (document.location.pathname.startsWith("/skin")) {
    presenceData.details = "Viewing a Minecraft skin";
    presenceData.buttons = [
      {
        label: "View this Minecraft skin",
        url: window.location.href
      }
    ];
  } else if (document.location.pathname.startsWith("/cape")) {
    presenceData.details = "Viewing Cape:";
    presenceData.state = document.querySelector("div.mb-1>h1")?.textContent ?? "Unknown";
    presenceData.buttons = [
      {
        label: `View ${
          document.querySelector("div.mb-1>h1")?.textContent ?? "Unknown"
        } cape`,
        url: window.location.href
      }
    ];
  } else if (document.location.pathname.startsWith("/cloak")) {
    presenceData.details = "Viewing a LabyMod Cloak";
    presenceData.buttons = [
      {
        label: "View this Cloak",
        url: window.location.href
      }
    ];
  } else if (document.location.pathname.startsWith("/badge")) {
    presenceData.details = "Viewing badge:";
    presenceData.state = document.querySelector("div.mb-1>h1")?.textContent ?? "Unknown Badge";
    presenceData.buttons = [
      {
        label: `View ${
          document.querySelector("div.mb-1>h1")?.textContent ?? "Unknown Badge"
        } badge`,
        url: window.location.href
      }
    ];
  } else if (document.location.pathname.startsWith("/server")) {
    presenceData.details = "Viewing server:";
    presenceData.state = document.querySelector(
      "div.server-info-wrapper>h1"
    ).textContent;
    presenceData.buttons = [
      {
        label: `View ${
          document.querySelector("div.server-info-wrapper>h1")?.textContent ?? "Unknown Cape"
        }`,
        url: window.location.href
      }
    ];
  }

  if (presenceData.details) presence.setActivity(presenceData);
  else presence.setActivity();
});
