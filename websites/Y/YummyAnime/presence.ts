import { ActivityType, Assets, getTimestamps } from "premid";

declare class Presence {
  constructor(options: { clientId: string });
  on(event: string, callback: (data: any) => void): void;
  setActivity(activity: any): void;
  getSetting<T>(key: string): Promise<T>;
}

const presence = new Presence({
  clientId: "1045800378228281345",
});

interface VideoState {
  duration: number;
  currentTime: number;
  paused: boolean;
  referrer?: string;
}

let iframeVideo: VideoState = {
  duration: 0,
  currentTime: 0,
  paused: true,
};

let lastPathname = document.location.pathname;

presence.on("iFrameData", (data: VideoState) => {
  if (data.referrer) {
    try {
      const refUrl = new URL(data.referrer);
      const currentUrl = new URL(document.location.href);

      if (refUrl.origin !== currentUrl.origin) return;

      const normalize = (p: string) => p.replace(/\/$/, "");

      if (
        refUrl.pathname !== "/" &&
        normalize(refUrl.pathname) !== normalize(currentUrl.pathname)
      ) {
      }
    } catch {
      // ignore parsing errors
    }
  }

  iframeVideo = {
    duration: data.duration ?? 0,
    currentTime: data.currentTime ?? 0,
    paused: data.paused ?? true,
    referrer: data.referrer,
  };
});

function getKnownDuration(video: HTMLVideoElement): number {
  const d = video.duration;
  if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY) return d;

  try {
    if (video.seekable?.length) {
      const end = video.seekable.end(video.seekable.length - 1);
      if (Number.isFinite(end) && end > 0) return end;
    }
  } catch {
    // ignore
  }

  try {
    if (video.buffered?.length) {
      const end = video.buffered.end(video.buffered.length - 1);
      if (Number.isFinite(end) && end > 0) return end;
    }
  } catch {
    // ignore
  }
  return Number.NaN;
}

function isVideoMostlyVisible(video: HTMLVideoElement): boolean {
  const r = video.getBoundingClientRect();
  if (r.width > 0 && r.height > 0) return r.width >= 32 && r.height >= 18;
  return video.videoWidth > 0 && video.videoHeight > 0;
}

function collectVideos(root: Document | ShadowRoot): HTMLVideoElement[] {
  const out: HTMLVideoElement[] = [];
  for (const v of root.querySelectorAll("video")) out.push(v);

  for (const el of root.querySelectorAll("*")) {
    if (el.shadowRoot) out.push(...collectVideos(el.shadowRoot));
  }
  return out;
}

function pickBestVideoFromPage(): HTMLVideoElement | null {
  const videos = collectVideos(document).filter(isVideoMostlyVisible);
  if (!videos.length) return null;

  const withDuration = videos.filter((v) => {
    const d = getKnownDuration(v);
    return Number.isFinite(d) && d > 0;
  });

  if (!withDuration.length) {
    const playing = videos.filter((v) => !v.paused && v.currentTime > 0);
    if (playing.length) return playing[0] ?? null;
  }

  const pool = withDuration.length ? withDuration : videos;

  return pool.reduce((a, b) => {
    const da = getKnownDuration(a);
    const db = getKnownDuration(b);
    const ad = Number.isFinite(da) ? da : 0;
    const bd = Number.isFinite(db) ? db : 0;
    return bd >= ad ? b : a;
  });
}

function mainPageVideoState(): VideoState | null {
  const video = pickBestVideoFromPage();
  if (!video) return null;

  const duration = getKnownDuration(video);

  if ((!Number.isFinite(duration) || duration <= 0) && !video.paused) {
    return {
      duration: 0,
      currentTime: video.currentTime,
      paused: video.paused,
    };
  }

  if (!Number.isFinite(duration) || duration <= 0) return null;

  return {
    duration,
    currentTime: video.currentTime,
    paused: video.paused,
  };
}

function getPlaybackVideo(): VideoState | null {
  if (iframeVideo.duration > 0 || !iframeVideo.paused) return iframeVideo;

  return mainPageVideoState();
}

function isAnimeItemPage(pathname: string): boolean {
  if (document.querySelector(".poster-block")) return true;

  if (pathname.includes("/catalog/item/")) return true;

  return (
    /\/item\/\d+/i.test(pathname) ||
    /\/catalog\/\d+/i.test(pathname) ||
    /\/anime\//i.test(pathname) ||
    /\/watch\//i.test(pathname) ||
    /\/serial\//i.test(pathname) ||
    /\/title\//i.test(pathname) ||
    /\/release\//i.test(pathname)
  );
}

function episodeFromUrl(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  for (const key of ["episode", "ep", "serie", "s"]) {
    const v = params.get(key);
    if (v && /^\d+$/.test(v)) return v;
  }

  const m = pathname.match(/(?:episode|ep|ser(?:iya)?)[-_]?(\d+)/i);
  if (m?.[1]) return m[1];

  return "";
}

function getActiveEpisode(pathname: string, search: string): string {
  const fromUrl = episodeFromUrl(pathname, search);
  if (fromUrl) return fromUrl;

  const oldBtn = document.querySelector('div[class*="pQCG"]');
  if (oldBtn) {
    const text = oldBtn.textContent?.trim();
    if (text && !Number.isNaN(Number(text))) return text;
  }

  const aria = document.querySelector(
    '[aria-current="true"], [aria-selected="true"]',
  );
  if (aria) {
    const text = aria.textContent?.trim();
    const num = text?.match(/\d+/);
    if (num) return num[0];
  }

  const newSiteVersion = document.querySelector(
    'section.c5.c6 .oT .sB [data-selected="1"]',
  );
  if (newSiteVersion) {
    const text = newSiteVersion.textContent?.trim();
    const match = text?.match(/(\d+)/);
    if (match && match[1]) return match[1];
  }

  const containers = [
    ".episodes-container",
    ".episodes-list",
    ".series-list",
    '[class*="episodes"]',
    '[class*="series"]',
  ];

  for (const selector of containers) {
    const container = document.querySelector(selector);
    if (container) {
      const active = container.querySelector(
        '.active, .selected, .current, [class*="active"], [class*="selected"]',
      );
      if (active) {
        const text = active.textContent?.trim();
        const num = text?.match(/\d+/);
        if (num) return num[0];
      }
    }
  }

  const allActive = document.querySelectorAll(".active, .selected, .current");
  for (const el of allActive) {
    const text = el.textContent?.trim();
    if (!text || text.length > 20) continue;

    if (/^\d+$/.test(text)) return text;

    const m = text.match(
      /^(?:series|ep|episode|серия|выпуск)?\s*(\d+)\s*(?:series|ep|episode|серия|выпуск)?$/i,
    );
    if (m?.[1]) return m[1];
  }

  return "";
}

function resolveAbsoluteUrl(url: string): string {
  const t = url.trim();
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("/")) return `${location.origin}${t}`;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `${location.origin}/${t.replace(/^\//, "")}`;
}

function isSkippableImageUrl(url: string): boolean {
  const u = url.toLowerCase();
  if (!u || u.length < 8) return true;
  if (u.includes("favicon")) return true;
  if (u.includes("icon-32") || u.includes("icon-16")) return true;
  if (u.includes("gravatar")) return true;
  if (/\bavatars?\b/.test(u) || /\bavatar[._/-]/i.test(u)) return true;
  return false;
}

function posterUrlForDiscord(raw: string): string {
  return resolveAbsoluteUrl(raw);
}

function imgEffectiveSrc(img: HTMLImageElement): string {
  return (
    img.getAttribute("src") ||
    img.getAttribute("data-src") ||
    img.getAttribute("data-lazy-src") ||
    img.getAttribute("data-original") ||
    img.currentSrc ||
    img.src ||
    ""
  ).trim();
}

function applyPosterImage(presenceData: Record<string, unknown>): void {
  const tryAssign = (img: HTMLImageElement | null | undefined): boolean => {
    if (!img) return false;
    const raw = imgEffectiveSrc(img);
    if (!raw || isSkippableImageUrl(raw)) return false;
    presenceData.largeImageKey = posterUrlForDiscord(raw);
    return true;
  };

  if (
    tryAssign(
      document.querySelector("div.poster-block img") as HTMLImageElement,
    )
  )
    return;

  const posterish = document.querySelectorAll<HTMLImageElement>(
    'img[src*="imgproxy.yani.tv/posters"], img[data-src*="imgproxy.yani.tv/posters"]',
  );
  for (const img of posterish) {
    if (tryAssign(img)) return;
  }

  if (
    tryAssign(
      document.querySelector('div[class*="d4"] img') as HTMLImageElement,
    )
  )
    return;

  if (
    tryAssign(document.querySelector('[class*="d4"] img') as HTMLImageElement)
  )
    return;

  if (
    tryAssign(
      document.querySelector('main div[class*="d4"] img') as HTMLImageElement,
    )
  )
    return;

  if (
    tryAssign(
      document.querySelector('img[itemprop="image"]') as HTMLImageElement,
    )
  )
    return;

  for (const metaSel of [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[property="og:image:secure_url"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
  ]) {
    const content = document
      .querySelector(metaSel)
      ?.getAttribute("content")
      ?.trim();
    if (content && !isSkippableImageUrl(content)) {
      presenceData.largeImageKey = posterUrlForDiscord(content);
      return;
    }
  }
}

function isPlayerBlockInView(): boolean {
  const selectors = [
    "#video",
    '[class*="Player"]',
    '[class*="player"]',
    "video",
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const viewHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight,
    );
    if (!(rect.bottom < 0 || rect.top - viewHeight >= 0)) return true;
  }
  return false;
}

presence.on("UpdateData", async () => {
  if (lastPathname !== document.location.pathname) {
    lastPathname = document.location.pathname;
    iframeVideo = {
      duration: 0,
      currentTime: 0,
      paused: true,
    };
  }

  const { pathname, search } = document.location;

  const presenceData: Record<string, unknown> = {
    largeImageKey: "https://i.imgur.com/6XnAGga.jpeg",
    largeImageText: "YummyAnime",
    type: ActivityType.Watching,
  };

  if (pathname === "/" || pathname === "/index.html") {
    presenceData.details = "На главной странице";
    presenceData.state = "Выбирает аниме";
    presence.setActivity(presenceData);
    return;
  }

  if (!isAnimeItemPage(pathname)) {
    presenceData.details = "На сайте YummyAnime";

    const pageTitle = document.querySelector("h1")?.textContent?.trim();

    if (pageTitle) presenceData.state = pageTitle;
    else delete presenceData.state;

    delete presenceData.startTimestamp;
    delete presenceData.endTimestamp;

    presence.setActivity(presenceData);
    return;
  }

  const titleHeader = document.querySelector("h1");
  if (titleHeader) presenceData.details = titleHeader.textContent?.trim();
  else presenceData.details = "Смотрит аниме";

  applyPosterImage(presenceData);

  const currentEpisode = getActiveEpisode(pathname, search);
  const playback = getPlaybackVideo();

  if (playback && (playback.duration > 0 || !playback.paused)) {
    if (!playback.paused) {
      presenceData.state = currentEpisode
        ? `Смотрит серию: ${currentEpisode}`
        : "Смотрит видео";

      if (playback.duration > 0) {
        [presenceData.startTimestamp, presenceData.endTimestamp] =
          getTimestamps(playback.currentTime, playback.duration);
      } else {
        // Длительность неизвестна, показываем только прошедшее время
        presenceData.startTimestamp = Date.now() - playback.currentTime * 1000;
        delete presenceData.endTimestamp;
      }

      presenceData.smallImageKey = Assets.Play;
      presenceData.smallImageText = "Воспроизведение";
    } else {
      presenceData.state = currentEpisode
        ? `Серия ${currentEpisode} (Пауза)`
        : "На паузе";

      delete presenceData.startTimestamp;
      delete presenceData.endTimestamp;

      presenceData.smallImageKey = Assets.Pause;
      presenceData.smallImageText = "Пауза";
    }
  } else {
    delete presenceData.smallImageKey;
    delete presenceData.smallImageText;

    if (currentEpisode && isPlayerBlockInView())
      presenceData.state = `Готовится к просмотру: ${currentEpisode}`;
    else presenceData.state = "Читает описание";

    delete presenceData.startTimestamp;
    delete presenceData.endTimestamp;
  }

  presence.setActivity(presenceData);
});
