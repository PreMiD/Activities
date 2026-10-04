(() => {
  "use strict";

  const iframe = new iFrame();
  let lastSend = 0;

  function knownDuration(video: HTMLVideoElement): number {
    if (Number.isFinite(video.duration) && video.duration > 0) return video.duration;

    try {
      if (video.seekable.length) return video.seekable.end(video.seekable.length - 1);
      if (video.buffered.length) return video.buffered.end(video.buffered.length - 1);
    } catch {
      // Some providers throw while their media source is being replaced.
    }

    return 0;
  }

  function collectVideos(root: ParentNode): HTMLVideoElement[] {
    const videos = Array.from(root.querySelectorAll<HTMLVideoElement>("video"));

    for (const element of root.querySelectorAll<HTMLElement>("*")) {
      if (element.shadowRoot) videos.push(...collectVideos(element.shadowRoot));
    }

    return videos;
  }

  function bestVideo(): HTMLVideoElement | null {
    const videos = collectVideos(document);

    return videos.sort((a, b) => {
      const playingDifference = Number(!a.paused) - Number(!b.paused);
      return playingDifference || knownDuration(a) - knownDuration(b);
    }).at(-1) ?? null;
  }

  function cleanText(value: unknown): string {
    return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  }

  function episodeFromText(value: unknown): string {
    const text = cleanText(value);
    if (!text) return "";

    const seasonEpisode = text.match(
      /(?:сезон|season)\s*(\d+).*?(?:серия|эпизод|episode|ep)\s*(\d+)/i
    ) || text.match(
      /(\d+)\s*(?:сезон|season).*?(\d+)\s*(?:серия|эпизод|episode|ep)/i
    ) || text.match(/\bS(?:eason)?\s*(\d+)\s*E(?:pisode|p)?\s*(\d+)\b/i);

    if (seasonEpisode) return `Сезон ${seasonEpisode[1]} • серия ${seasonEpisode[2]}`;

    const episode = text.match(/(?:серия|эпизод|episode|ep)\s*(\d+)/i)
      || text.match(/(\d+)\s*(?:серия|эпизод|episode|ep)/i);

    return episode ? `Серия ${episode[1]}` : "";
  }

  function selectedOption(selector: string): string {
    const select = document.querySelector<HTMLSelectElement>(selector);
    const option = select?.selectedOptions[0]
      ?? select?.querySelector<HTMLOptionElement>("option:checked");

    return cleanText(option?.dataset.title || option?.textContent || select?.value);
  }

  function findEpisode(): string {
    // Kodik exposes the currently selected season and episode in real selects.
    const kodikSeason = selectedOption(".serial-seasons-box select");
    const kodikEpisode = selectedOption(".serial-series-box select");

    if (kodikEpisode) {
      const parsed = episodeFromText(`${kodikSeason} ${kodikEpisode}`);
      if (parsed) return parsed;
    }

    const dataElement = document.querySelector<HTMLElement>(
      '[data-season][data-episode], [data-season].active[data-series], [data-season][aria-current="true"]'
    );

    if (dataElement) {
      const season = cleanText(dataElement.dataset.season || "");
      const episode = cleanText(
        dataElement.dataset.episode || dataElement.dataset.series || ""
      );

      if (episode) return season ? `Сезон ${season} • серия ${episode}` : `Серия ${episode}`;
    }

    const selectors = [
      '[aria-current="true"]',
      '[aria-selected="true"]',
      '[data-selected="true"]',
      '[data-selected="1"]',
      '[data-active="true"]',
      '[class*="episode"][class*="active"]',
      '[class*="Episode"][class*="Active"]',
      '[class*="series"][class*="active"]'
    ];

    const texts = selectors
      .flatMap(selector => Array.from(document.querySelectorAll<HTMLElement>(selector)))
      .map(element => cleanText(element.textContent))
      .filter(text => text && text.length <= 100);

    const title = cleanText(navigator.mediaSession?.metadata?.title)
      || cleanText(document.title);

    for (const candidate of [...texts, title]) {
      const parsed = episodeFromText(candidate);
      if (parsed) return parsed;
    }

    // Initial Collaps/NextEmbed selection before its title-change callback runs.
    const config = document.querySelector<HTMLScriptElement>('script[data-name="mk"]')?.textContent || "";
    const initial = config.match(
      /\bcurrent\s*:\s*\{\s*season\s*:\s*(\d+)\s*,\s*episode\s*:\s*(["'])([^"']+)\2\s*\}/s
    );

    return initial ? `Сезон ${initial[1]} • серия ${initial[3]}` : "";
  }

  async function send(force = false): Promise<void> {
    const now = Date.now();
    if (!force && now - lastSend < 750) return;

    lastSend = now;

    const video = bestVideo();
    const url = await iframe.getUrl();

    iframe.send({
      url,
      duration: video ? knownDuration(video) : 0,
      currentTime: video?.currentTime ?? 0,
      paused: video?.paused !== false,
      episode: findEpisode()
    });
  }

  iframe.on("UpdateData", () => void send(true));

  for (const event of [
    "loadedmetadata",
    "durationchange",
    "play",
    "pause",
    "seeked",
    "timeupdate"
  ]) {
    document.addEventListener(
      event,
      () => void send(event !== "timeupdate"),
      true
    );
  }

  let mutationTimer: ReturnType<typeof setTimeout> | undefined;

  new MutationObserver(() => {
    if (mutationTimer !== undefined) clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => void send(true), 400);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
