const presence = new Presence({
  clientId: "1497201619912360028",
});

const browsingTimestamp = Math.floor(Date.now() / 1000);
const coverCache = new Map<string, string>();

const MIRURO_LOGO = "https://www.miruro.tv/android-chrome-512x512.png";

async function getAnimeCover(animeId: string): Promise<string> {
  if (coverCache.has(animeId)) return coverCache.get(animeId)!;

  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
  const anilistImg = imgs.find(
    (img) => img.src.includes("anilistcdn") && img.src.includes("anime/cover")
  );
  if (anilistImg?.src) {
    coverCache.set(animeId, anilistImg.src);
    return anilistImg.src;
  }

  try {
    const query = `{ Media(id: ${animeId}) { coverImage { large } } }`;
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    const cover = json?.data?.Media?.coverImage?.large;
    if (cover) {
      coverCache.set(animeId, cover);
      return cover;
    }
  } catch {}

  return MIRURO_LOGO;
}

presence.on("UpdateData", async () => {
  const path = location.pathname;

  if (path.startsWith("/watch/")) {
    const animeId = path.split("/")[2];
    const video = document.querySelector<HTMLVideoElement>("video");
    const episode = new URLSearchParams(location.search).get("ep");

    let animeTitle = "Unknown Anime";
    let episodeNum = episode ?? "?";

    const titleEl =
      document.querySelector<HTMLElement>("h1") ??
      document.querySelector<HTMLElement>(".anime-title a") ??
      document.querySelector<HTMLElement>("[class*='title']");

    if (titleEl?.textContent) {
      animeTitle = titleEl.textContent.trim();
    } else {
      const docTitle = document.title.replace("| Miruro", "").trim();
      const parts = docTitle.split(" - Episode ");
      if (parts.length === 2) {
        animeTitle = parts[0]?.trim() ?? "Unknown Anime";
        episodeNum = parts[1]?.trim() ?? "?";
      } else {
        animeTitle = docTitle;
      }
    }

    const cover = animeId ? await getAnimeCover(animeId) : MIRURO_LOGO;

    const presenceData: PresenceData = {
      type: 3 as 3,
      largeImageKey: cover,
      largeImageText: animeTitle,
      details: `Watching ${animeTitle}`,
      state: `Episode ${episodeNum}`,
      buttons: [{ label: "Watch on Miruro", url: location.href }],
    };

    if (video && !isNaN(video.duration) && video.duration > 0 && !video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] =
        presence.getTimestampsfromMedia(video);
    } else {
      presenceData.startTimestamp = browsingTimestamp;
    }

    presence.setActivity(presenceData);
  } else if (path.startsWith("/info/")) {
    const animeId = path.split("/")[2];
    const cover = animeId ? await getAnimeCover(animeId) : MIRURO_LOGO;

    const titleEl =
      document.querySelector<HTMLElement>("h1") ??
      document.querySelector<HTMLElement>("[class*='title']");
    const animeTitle =
      titleEl?.textContent?.trim() ??
      document.title.replace("| Miruro", "").trim();

    presence.setActivity({
      type: 0 as 0,
      largeImageKey: cover,
      details: "Browsing Anime",
      state: animeTitle,
      startTimestamp: browsingTimestamp,
      buttons: [{ label: "View on Miruro", url: location.href }],
    });
  } else if (path.startsWith("/search")) {
    const query = new URLSearchParams(location.search).get("query");

    presence.setActivity({
      type: 0 as 0,
      largeImageKey: MIRURO_LOGO,
      details: "Searching",
      state: query ? `"${query}"` : "Browsing",
      startTimestamp: browsingTimestamp,
    });
  } else if (path === "/" || path === "") {
    presence.setActivity({
      type: 0 as 0,
      largeImageKey: MIRURO_LOGO,
      details: "Browsing",
      state: "Home",
      startTimestamp: browsingTimestamp,
    });
  } else if (path.startsWith("/trending")) {
    presence.setActivity({
      type: 0 as 0,
      largeImageKey: MIRURO_LOGO,
      details: "Browsing",
      state: "Trending Anime",
      startTimestamp: browsingTimestamp,
    });
  } else if (path.startsWith("/schedule")) {
    presence.setActivity({
      type: 0 as 0,
      largeImageKey: MIRURO_LOGO,
      details: "Browsing",
      state: "Airing Schedule",
      startTimestamp: browsingTimestamp,
    });
  } else {
    presence.setActivity({
      type: 0 as 0,
      largeImageKey: MIRURO_LOGO,
      details: "Browsing Miruro",
      state: document.title.replace("| Miruro", "").trim(),
      startTimestamp: browsingTimestamp,
    });
  }
});
