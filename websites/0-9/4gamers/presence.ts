const presence = new Presence({
    clientId: "648494004870184981"
  }),
  browsingTimestamp = Math.floor(Date.now() / 1000);

let title: string;

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "4gamers",
    startTimestamp: browsingTimestamp
  };

  if (document.location.hostname === "www.4gamers.com.tw") {
    if (document.location.pathname === "/") {
      presenceData.details = "Viewing home page";
    } else if (document.location.pathname.includes("/new")) {
      title = document.getElementsByClassName("news-header-title")[0].innerHTML;

      presenceData.details = title;
      presenceData.state = `Category: ${
        document.getElementsByClassName("news-header-category ")[0].innerHTML
      }`;
    } else if (document.location.pathname.includes("magazine")) {
      title = document.getElementsByClassName("magazine-content-title")[0]
        .innerHTML;

      presenceData.details = title;
      presenceData.state = `Publish Date: ${
        document.getElementsByClassName("magazine-content-time")[0].innerHTML
      }`;
    } else if (document.location.pathname.includes("tournament"))
      presenceData.details = "賽事專欄";
  }
  if (presenceData.details) presence.setActivity(presenceData);
  else presence.setActivity();
});
