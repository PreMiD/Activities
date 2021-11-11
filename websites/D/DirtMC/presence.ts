const presence = new Presence({
    clientId: "631995227132919819" // CLIENT ID FOR YOUR PRESENCE
  }),
  browsingTimestamp = Math.floor(Date.now() / 1000);
let title: HTMLElement;

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "dirtmc"
  };

  presenceData.startTimestamp = browsingTimestamp;
  if (document.location.hostname === "dirtmc.net") {
    if (document.location.pathname === "/") {
      presenceData.details = "Viewing home page";

      presence.setActivity(presenceData);
    } else if (document.location.pathname === "/rules/") {
      presenceData.details = "Reading the rules";

      presenceData.smallImageKey = "reading";

      presence.setActivity(presenceData);
    } else if (document.location.pathname === "/how-to-play/") {
      presenceData.details = "Viewing how to play";

      presenceData.smallImageKey = "reading";

      presence.setActivity(presenceData);
    } else if (
      document.querySelector("#site-main > article > header > h1") !== null
    ) {
      title = document.querySelector("#site-main > article > header > h1");
      presenceData.details = "Reading thread:";
      if (title.textContent.length > 128)
        presenceData.state = `${title.textContent.substring(0, 125)}...`;
      else presenceData.state = title.textContent;

      presenceData.smallImageKey = "reading";
      presence.setActivity(presenceData);
    } else {
      presence.setActivity();
    }
  } else if (document.location.hostname === "buy.dirtmc.net") {
    title = document.querySelector("head > title");
    presenceData.details = "Store, viewing:";
    presenceData.state = title.textContent.replace("DirtMC | ", "");

    presence.setActivity(presenceData);
  } else {
    presence.setActivity();
  }
});
