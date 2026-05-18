const presence = new Presence({
  clientId: "1234567890123456789", // Will be replaced by PreMiD during submission
});

let lastTitle = "";
let lastArtist = "";
let lastCover = "";
let lastDuration = 0;
let lastCurrentTime = 0;
let lastIsPlaying = false;
let startTimestamp = 0;
let endTimestamp = 0;

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "logo", // Sound4All logo
    largeImageText: "Sound4All",
  };

  // Get player data from DOM or global state
  const playerData = getPlayerData();

  if (!playerData || !playerData.title) {
    // No playback
    presenceData.details = "Browsing";
    presenceData.state = "Exploring library";
    presence.setActivity(presenceData);
    return;
  }

  const {
    title,
    artist,
    coverUrl,
    isPlaying,
    currentTime,
    duration,
  } = playerData;

  // Update timestamps only if track changed or play/pause toggled
  if (
    title !== lastTitle ||
    artist !== lastArtist ||
    isPlaying !== lastIsPlaying
  ) {
    if (isPlaying && duration > 0) {
      const now = Date.now();
      startTimestamp = now - currentTime * 1000;
      endTimestamp = now + (duration - currentTime) * 1000;
    } else {
      startTimestamp = 0;
      endTimestamp = 0;
    }

    lastTitle = title;
    lastArtist = artist;
    lastCover = coverUrl || "";
    lastDuration = duration;
    lastIsPlaying = isPlaying;
  }

  // Update currentTime for progress bar
  lastCurrentTime = currentTime;

  presenceData.details = title;
  presenceData.state = artist;

  // Song cover as small image
  if (coverUrl) {
    presenceData.smallImageKey = coverUrl;
    presenceData.smallImageText = "Cover";
  }

  // Progress bar
  if (isPlaying && duration > 0) {
    presenceData.startTimestamp = startTimestamp;
    presenceData.endTimestamp = endTimestamp;
  } else if (!isPlaying) {
    // Show "Paused" instead of progress bar
    presenceData.smallImageKey = "pause";
    presenceData.smallImageText = "Paused";
  }

  presence.setActivity(presenceData);
});

/**
 * Get player data from DOM or global state
 * Adapted to Sound4All's HTML structure
 */
function getPlayerData(): {
  title: string;
  artist: string;
  coverUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
} | null {
  try {
    // Method 1: Try to get from Zustand store (if exposed globally)
    // @ts-ignore
    if (window.__SOUND4ALL_PLAYER_STATE__) {
      // @ts-ignore
      const state = window.__SOUND4ALL_PLAYER_STATE__;
      const track = state.queue?.[state.index];
      if (track) {
        return {
          title: track.title || "Unknown Title",
          artist: track.artist || "Unknown Artist",
          coverUrl: track.coverUrl || null,
          isPlaying: state.isPlaying || false,
          currentTime: state.currentTime || 0,
          duration: state.duration || track.durationSec || 0,
        };
      }
    }

    // Method 2: Parse DOM (fallback)
    // Look for mini player or full player
    const titleElement = document.querySelector(
      '[aria-label="Ouvrir le lecteur"] .truncate.text-sm.font-medium, .text-xl.font-bold.leading-tight'
    );
    const artistElement = document.querySelector(
      '[aria-label="Ouvrir le lecteur"] .truncate.text-xs.text-text-muted, .text-white\\/70.mt-1.truncate'
    );
    const playButton = document.querySelector(
      '[aria-label="Pause"], [aria-label="Lecture"]'
    );
    const progressBar = document.querySelector<HTMLInputElement>(
      'input[type="range"][aria-label="Progression"]'
    );
    const coverImg = document.querySelector<HTMLImageElement>(
      '[aria-label="Ouvrir le lecteur"] img, .aspect-square img'
    );

    if (!titleElement || !artistElement) {
      return null;
    }

    const title = titleElement.textContent?.trim() || "Unknown Title";
    const artist = artistElement.textContent?.trim() || "Unknown Artist";
    const isPlaying = playButton?.getAttribute("aria-label") === "Pause";
    const currentTime = progressBar ? parseFloat(progressBar.value) : 0;
    const duration = progressBar ? parseFloat(progressBar.max) : 0;
    const coverUrl = coverImg?.src || null;

    return {
      title,
      artist,
      coverUrl,
      isPlaying,
      currentTime,
      duration,
    };
  } catch (error) {
    console.error("[Sound4All PreMiD] Error getting player data:", error);
    return null;
  }
}
