import { Presence } from "premid";

const presence = new Presence({
  clientId: "1293248356353245224"
});

const startTime = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  presence.setActivity({
    largeImageKey: "https://www.s4ml.club/favicon.svg",
    largeImageText: "S4 Master League",
    details: "on Xero",
    state: "www.s4ml.club",
    startTimestamp: startTime,
    buttons: [
      {
        label: "Join S4ML",
        url: "https://www.s4ml.club"
      }
    ]
  });
});
