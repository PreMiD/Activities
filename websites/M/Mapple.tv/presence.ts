import { Assets } from "preMid";

const presence = new Presence({
  clientId: "1400642676487098519",
});

function getAction(): string {
  const href = window.location.href;
  if (href.includes("/movie")) return "movie";
  if (href.includes("/tv")) return "tv";
  if (href.includes("/live-tv")) return "live";
  if (href.includes("/watch/channel/")) return "live";
  if (href.includes("/sports")) return "sports";
  if (href.includes("/audiobooks")) return "audiobooks";
  if (href.includes("/listen/")) return "audiobooks";
  return "home";
}

function getText(selector: string): string {
  return document.querySelector(selector)?.textContent?.trim() || "";
}

function getStatus(): string {
  const url = window.location.href;

  // Sports: extract from h2 element
  if (url.includes("/sports/")) {
    const h2 = document.querySelector("h2.text-transparent") as HTMLElement;
    return h2?.textContent?.trim() || "Browsing";
  }

  // Get content from meta tag
  const meta = document.querySelector(
    'meta[name="twitter:title"]',
  ) as HTMLMetaElement;
  const rawTitle = meta?.content?.trim();
  if (!rawTitle) return "Browsing";

  // Audiobooks: extract book title and author
  if (url.includes("/audiobooks") || url.includes("/listen/")) {
    const cleanedTitle = rawTitle.replace(/\s*–\s*MappleTV$/i, "");
    const titleMatch = cleanedTitle.match(/"([^"]+)"/);
    const authorMatch = cleanedTitle.match(/by\s+(.+)$/i);
    const book = titleMatch?.[1]?.trim() || "Unknown Title";
    const author = authorMatch?.[1]?.trim() || "Unknown Author";
    return `${book} by ${author}`;
  }

  // Live TV: remove 'Streaming - ' prefix
  if (url.includes("/watch/channel/")) {
    return rawTitle.replace(/^Streaming\s*-\s*/i, "").trim();
  }

  return `${rawTitle}`;
}

const constructAction: Record<string, string> = {
  movie: "Watching a Movie",
  tv: "Watching a TV Series",
  live: "Streaming Live TV",
  sports: "Watching Sports",
  audiobooks: "Listening to an Audiobook",
  home: "Browsing",
};

async function updatePresence() {
  const action = getAction();

  const [
    privacy,
    showBrowsing,
    showLive,
    showMovies,
    showTVShows,
    showAudiobooks,
    showSports,
  ] = await Promise.all([
    presence.getSetting<boolean>("privacy"),
    presence.getSetting<boolean>("browse"),
    presence.getSetting<boolean>("live"),
    presence.getSetting<boolean>("movies"),
    presence.getSetting<boolean>("tvshows"),
    presence.getSetting<boolean>("audiobooks"),
    presence.getSetting<boolean>("sports"),
  ]);

  // Privacy mode enabled — show nothing except icon + timestamps (if any)
  if (privacy) {
    const presenceData: PresenceData = {
      largeImageKey: "https://i.ibb.co/0H29dLk/mappletv.png",
    };

    const video = document.querySelector("video");
    if (video && getStatus().toLowerCase() !== "pause") {
      const [start, end] = presence.getTimestampsfromMedia(video);
      presenceData.startTimestamp = start;
      presenceData.endTimestamp = end;
      presenceData.smallImageKey = Assets.Play;
    } else if (video) {
      presenceData.smallImageKey = Assets.Pause;
    }

    presence.setActivity(presenceData);
    return;
  }

  const presenceData: PresenceData = {
    largeImageKey: "https://i.ibb.co/0H29dLk/mappletv.png",
    details: constructAction[action],
  };

  // Show 'Browsing' only if it's allowed
  if (!["movie", "tv", "sports", "live", "audiobooks"].includes(action)) {
    if (showBrowsing) {
      presenceData.details = "Home";
      presenceData.startTimestamp = Math.floor(Date.now() / 1000);
    } else {
      presenceData.details = "";
    }
    presence.setActivity(presenceData);
    return;
  }

  const allowDetail =
    (action === "movie" && showMovies) ||
    (action === "tv" && showTVShows) ||
    (action === "live" && showLive) ||
    (action === "audiobooks" && showAudiobooks) ||
    (action === "sports" && showSports);

  const video = document.querySelector("video");
  if (video && getStatus().toLowerCase() !== "pause") {
    const [start, end] = presence.getTimestampsfromMedia(video);
    presenceData.startTimestamp = start;
    presenceData.endTimestamp = end;
    presenceData.smallImageKey = Assets.Play;
  } else if (video) {
    presenceData.smallImageKey = Assets.Pause;
  }

  if (allowDetail) {
    const subtitle =
      getText(".player-title-bar") || getText("[class*=player-title-bar]");
    presenceData.state = `${getStatus()}${subtitle ? " | " + subtitle : ""}`;
  }

  presence.setActivity(presenceData);
}

function hookUrlChange(callback: () => void) {
  const pushState = history.pushState;
  const replaceState = history.replaceState;

  history.pushState = function () {
    pushState.apply(this, arguments as any);
    callback();
  };

  history.replaceState = function () {
    replaceState.apply(this, arguments as any);
    callback();
  };

  window.addEventListener("popstate", callback);

  const observer = new MutationObserver(() => {
    callback();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

presence.on("UpdateData", updatePresence);
hookUrlChange(updatePresence);