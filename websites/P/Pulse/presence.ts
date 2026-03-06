import { ActivityType, Assets } from "premid"

const presence = new Presence({
  clientId: "1474592409101799609"
});

let startTime = Date.now();
let lastSong = "";

presence.on("UpdateData", async () => {
  const audioElement = document.querySelector("audio");
  const isPlaying = audioElement ? !audioElement.paused : false;

  if (!isPlaying) {
    presence.clearActivity();
    return;
  }

  const metadata = navigator.mediaSession?.metadata;
  const songTitle = metadata?.title || "Live Stream";
  const artistName = metadata?.artist || "Pulse Radio";

  if (songTitle !== lastSong) {
    startTime = Date.now();
    lastSong = songTitle;
  }

  const payload: any = {
    type: ActivityType.Listening,
    details: songTitle,
    state: artistName,
    largeImageKey: "https://i.imgur.com/YbAX77N.png",
    smallImageKey: Assets.Play,
    smallImageText: "Streaming Now",
    startTimestamp: startTime,
    buttons: [
      {
        label: "Listen on Pulse Radio",
        url: "https://pulse-radio-kappa.vercel.app/"
      },
      {
        label: "Get This Presence",
        url: "https://premid.app"
      }
    ]
  };

  try {
    presence.setActivity(payload);
  } catch (err) {
    // Silent catch
  }
});