const presence = new Presence({
  clientId: "symphony-radio"
});

const API_URL = "https://panel.symphradio.live/api/stats";
const SITE_URL = "https://symphonyradio.co.uk";

let lastData: any = null;

async function getStats() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

presence.on("UpdateData", async () => {
  const browsing = await presence.getSetting("browsing");

  if (!document.location.hostname.includes("symphonyradio.co.uk")) {
    if (browsing) {
      presence.setActivity({
        details: "Browsing Symphony Radio",
        largeImageKey: "logo",
        largeImageText: "Symphony Radio",
        startTimestamp: Date.now()
      });
    }
    return;
  }

  const data = await getStats();
  if (!data || !data.nowPlaying) return;

  lastData = data;

  const track = data.song?.track ?? "Live Radio";
  const artist = data.song?.artist ?? "Symphony Radio";
  const listeners = data.listeners?.current ?? 0;

  const start = Math.floor(data.timing.startedAt * 1000);
  const end = Math.floor(data.timing.finishAt * 1000);

  presence.setActivity({
    details: `${track}`,
    state: `${artist} • ${listeners} listening`,
    largeImageKey: "logo",
    largeImageText: "Symphony Radio",
    smallImageKey: "play",
    smallImageText: "Live",
    startTimestamp: start,
    endTimestamp: end,
    buttons: [
      {
        label: "Listen Live",
        url: SITE_URL
      }
    ]
  });
});
