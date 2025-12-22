import { Assets, ActivityType } from "premid";

const presence = new Presence({
  clientId: "1232573225108508672",
});

enum ActivityAssets {
  Logo = "https://i.imgur.com/jbdFZ2C.png",
}

/* ======================
   Cache GLOBAL
====================== */
let cachedSlug: any = null;
let cachedTitle: string | null = null;
let cachedPoster: string | null = null;
let startTimestamp: number | null = null;

/* ======================
   Helpers
====================== */
function getSlug(): any {
  const m = location.pathname.match(/^\/media\/([^/]+)/);
  return m ? m[1] : null;
}

function getEpisode(): string | null {
  const m = location.pathname.match(/\/media\/[^/]+\/(\d+)/);
  return m ? `Episodio ${m[1]}` : null;
}

function isMainAnimePage(): boolean {
  return /^\/media\/[^/]+\/?$/.test(location.pathname);
}

function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector("video");
}

function isVideoPaused(): boolean {
  const video = getVideoElement();
  return video ? video.paused : false;
}

function getVideoTimestamps(): { start?: number; end?: number } | null {
  const video = getVideoElement();
  if (!video || !video.duration) return null;
  
  const currentTime = video.currentTime;
  const duration = video.duration;
  const remaining = duration - currentTime;
  
  return {
    start: Math.floor(Date.now() / 1000),
    end: Math.floor(Date.now() / 1000 + remaining),
  };
}

async function fetchMainAnimePoster(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`/media/${slug}`);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const img = doc.querySelector<HTMLImageElement>('img[src*="/covers/"]');
    return img?.src ?? null;
  } catch (err) {
    console.error("Error fetching main anime page:", err);
    return null;
  }
}

async function readAnimePage(): Promise<void> {
  const slug = getSlug();
  if (!slug) return;
  
  // Obtenemos título solo si estamos en la página principal
  if (isMainAnimePage()) {
    const titleEl = document.querySelector("h1, h2");
    cachedTitle = titleEl?.textContent
      ?.replace(/^Ver\s+/i, "")
      .replace(/ Online Sub Español.*$/i, "")
      .trim() ?? document.title.replace(/\s+-\s+AnimeAV1/i, "").trim();
    
    // Si estamos en la página principal, intentar obtener el poster directamente
    const img = document.querySelector<HTMLImageElement>('img[src*="/covers/"]');
    if (img?.src) cachedPoster = img.src;
  } else {
    // Si NO estamos en la página principal Y no tenemos datos en caché
    // hacemos fetch a la página principal para obtener título y poster
    if (!cachedTitle || !cachedPoster) {
      const mainPageData = await fetchMainAnimeData(slug);
      if (!cachedTitle) cachedTitle = mainPageData.title;
      if (!cachedPoster) cachedPoster = mainPageData.poster;
    }
  }
}

async function fetchMainAnimeData(slug: string): Promise<{title: string; poster: string}> {
  try {
    const response = await fetch(`https://animeav1.com/media/${slug}`);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    
    const img = doc.querySelector<HTMLImageElement>('img[src*="/covers/"]');
    const poster = img?.src ?? ActivityAssets.Logo;
    
    const titleEl = doc.querySelector("h1, h2");
    const title = titleEl?.textContent
      ?.replace(/^Ver\s+/i, "")
      .replace(/ Online Sub Español.*$/i, "")
      .trim() ?? "AnimeAV1";
    
    return { title, poster };
  } catch (err) {
    console.error("Error fetching main anime page:", err);
    return { title: "AnimeAV1", poster: ActivityAssets.Logo };
  }
}

/* ======================
   Presence
====================== */
presence.on("UpdateData", async () => {
  const slug = getSlug();
  
  // Si no estamos en ningún anime (página de inicio, búsqueda, etc.)
  if (!slug) {
    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      details: "Navegando",
      state: "Buscando qué anime ver...",
      largeImageKey: ActivityAssets.Logo,
      largeImageText: "AnimeAV1 - Plugin by Dasp",
      smallImageKey: Assets.Search,
      smallImageText: "Explorando el catálogo",
      startTimestamp: startTimestamp ?? Math.floor(Date.now() / 1000),
    };
    presence.setActivity(presenceData);
    
    // Reset cache
    cachedSlug = null;
    cachedTitle = null;
    cachedPoster = null;
    return;
  }
  
  // Reset si cambió de anime
  if (cachedSlug !== slug) {
    cachedSlug = slug;
    cachedTitle = null;
    cachedPoster = null;
    startTimestamp = Math.floor(Date.now() / 1000);
  }
  
  await readAnimePage();
  
  const episode = getEpisode();
  const video = getVideoElement();
  const videoPaused = isVideoPaused();
  
  let stateText: string;
  let smallIcon: string;
  let smallIconText: string;
  
  if (isMainAnimePage()) {
    stateText = "Buscando episodio...";
    smallIcon = Assets.Search;
    smallIconText = "Explorando";
  } else if (video) {
    stateText = episode ?? "Viendo";
    smallIcon = videoPaused ? Assets.Pause : Assets.Play;
    smallIconText = videoPaused ? "En pausa" : "Reproduciendo";
  } else {
    stateText = episode ?? "Viendo";
    smallIcon = Assets.Play;
    smallIconText = "Viendo";
  }
  
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: cachedTitle ?? "AnimeAV1",
    state: stateText,
    largeImageKey: cachedPoster ?? ActivityAssets.Logo,
    largeImageText: cachedTitle ?? "AnimeAV1",
    smallImageKey: smallIcon,
    smallImageText: smallIconText,
  };
  
  // Si hay un video y no está en la página principal, agregar timestamps
  if (!isMainAnimePage() && episode && video) {
    const timestamps = getVideoTimestamps();
    if (timestamps && !videoPaused) {
      presenceData.startTimestamp = timestamps.start;
      presenceData.endTimestamp = timestamps.end;
    } else {
      // Si está pausado, mantener el timestamp inicial sin endTimestamp
      presenceData.startTimestamp = startTimestamp ?? undefined;
    }
  } else {
    presenceData.startTimestamp = startTimestamp ?? undefined;
  }
  
  presence.setActivity(presenceData);
});

export default presence;