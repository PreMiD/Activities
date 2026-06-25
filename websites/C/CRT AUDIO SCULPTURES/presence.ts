import { ActivityType } from "premid";

const presence = new Presence({
  clientId: "1519448916469350601",
});

// Your existing favicon/logo, reused as the small corner badge on the card.
const CRT_LOGO =
  "https://dl.dropboxusercontent.com/scl/fi/1frrc96dnawl5c4w0hzu1/logo-crt.png?rlkey=4ffmgrqbcc84xxdx5x2cdh2ak&st=kkmc2go6";

// Fixed start/end timestamps for the CURRENT track, computed once and reused
// on every tick. Recomputing from Date.now() + currentTime on every tick
// causes the displayed timer to jitter by ±1s as the two values round
// independently.
let cachedTrackKey: string | null = null;
let cachedStart: number | null = null;
let cachedEnd: number | null = null;

presence.on("UpdateData", async () => {
  const titleEl = document.querySelector<HTMLElement>("#nowPlayingTitle");
  const artistEl = document.querySelector<HTMLElement>("#nowPlayingArtist");
  const thumbEl = document.querySelector<HTMLImageElement>("#nowPlayingThumb");
  const audioEl = document.querySelector<HTMLAudioElement>("audio");

  const title = titleEl?.textContent?.trim();
  const artist = artistEl?.textContent?.trim();

  // Nothing loaded into the player yet.
  if (!title || title === "—") {
    presence.clearActivity();
    cachedTrackKey = null;
    return;
  }

  const isPlaying = audioEl ? !audioEl.paused : false;
  const thumbnail = thumbEl?.src && thumbEl.src.startsWith("http") ? thumbEl.src : CRT_LOGO;

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    details: title,
    state: artist
      ? isPlaying
        ? artist
        : `${artist} · Paused`
      : isPlaying
        ? "Unknown Artist"
        : "Unknown Artist · Paused",
    largeImageKey: thumbnail,
    buttons: [
      {
        label: "Open CRT // AUDIO SCULPTURES",
        url: "https://mzn-visuals.github.io/crt-audio-sculptures/",
      },
    ],
  };

  const trackKey = `${title}::${artist}`;

  if (audioEl && audioEl.duration && isPlaying) {
    // Recompute the fixed start/end pair only when the track changes,
    // or when we don't have one cached yet (e.g. resuming after a pause).
    if (trackKey !== cachedTrackKey || cachedStart === null) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const elapsed = Math.floor(audioEl.currentTime);
      const remaining = Math.ceil(audioEl.duration - audioEl.currentTime);
      cachedStart = nowSeconds - elapsed;
      cachedEnd = nowSeconds + remaining;
      cachedTrackKey = trackKey;
    }
    presenceData.startTimestamp = cachedStart;
    presenceData.endTimestamp = cachedEnd;
  } else {
    // Paused (or no media yet): clear timestamps so Discord's timer
    // actually stops, and drop the cache so resuming recalculates cleanly.
    delete presenceData.startTimestamp;
    delete presenceData.endTimestamp;
    cachedStart = null;
    cachedEnd = null;
  }

  presence.setActivity(presenceData);
});

