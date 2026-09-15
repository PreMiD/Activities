const presence = new Presence({
  clientId: "1233213267053248633",
});

const startTimestamp = Math.floor(Date.now() / 1000);

function safeText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed || /^(undefined|null|nan)$/i.test(trimmed)) return fallback;
  return trimmed;
}

/** TODO(verify): confirm on a real anime page. */
function getAnisto() {
  const titleEl = document.querySelector("[data-anime-title], h1"); // TODO(verify)
  const title = safeText(titleEl?.textContent, "");

  const serverEl = document.querySelector(
    '[data-server].active, [data-server][aria-selected="true"]', // TODO(verify)
  );
  const server = safeText(serverEl?.textContent, "");

  const epEl = document.querySelector("[data-episode-number]"); // TODO(verify)
  const epMatch = (epEl?.getAttribute("data-episode-number") ?? epEl?.textContent)?.match(/(\d+)/);
  const episode = epMatch ? epMatch[1] : "";

  if (!title) return null; // not actually on a watch page / not loaded yet

  return { title, server, episode };
}

/** TODO(verify): confirm on a real manga chapter page. */
function getMangasto() {
  const titleEl = document.querySelector("[data-manga-title], h1"); // TODO(verify)
  const title = safeText(titleEl?.textContent, "");

  const chapterEl = document.querySelector("[data-chapter-number]"); // TODO(verify)
  const chMatch = (chapterEl?.getAttribute("data-chapter-number") ?? chapterEl?.textContent)?.match(/(\d+)/);
  const chapter = chMatch ? chMatch[1] : "";

  if (!title) return null;

  return { title, chapter };
}

/** TODO(verify): confirm on a real movie/series page. */
function getMovisto() {
  const titleEl = document.querySelector("[data-movie-title], h1"); // TODO(verify)
  const title = safeText(titleEl?.textContent, "");

  const serverEl = document.querySelector(
    '[data-server].active, [data-server][aria-selected="true"]', // TODO(verify)
  );
  const server = safeText(serverEl?.textContent, "");

  if (!title) return null;

  return { title, server };
}

function buildActivity(path: string): PresenceData {
  const base: PresenceData = {
    largeImageKey: Assets.Logo,
    startTimestamp,
    buttons: [{ label: "Open StormD", url: window.location.href }],
  };

  if (path === "/" || path === "") {
    return { ...base, details: "On the homepage", state: "Choosing what to do" };
  }

  if (path.startsWith("/anisto")) {
    const watching = getAnisto();
    if (watching) {
      return {
        ...base,
        details: `Watching ${watching.title}`,
        state: watching.episode
          ? `${safeText(watching.server, "Unknown server")} — Episode ${watching.episode}`
          : safeText(watching.server, "Unknown server"),
      };
    }
    return { ...base, details: "Browsing Anisto", state: "Looking for an anime to watch" };
  }

  if (path.startsWith("/mangasto")) {
    const reading = getMangasto();
    if (reading) {
      return {
        ...base,
        details: `Reading ${reading.title}`,
        state: reading.chapter ? `Chapter ${reading.chapter}` : "Reading",
      };
    }
    return { ...base, details: "Browsing Mangasto", state: "Looking for a manga to read" };
  }

  if (path.startsWith("/movisto")) {
    const watching = getMovisto();
    if (watching) {
      return {
        ...base,
        details: `Watching ${watching.title}`,
        state: safeText(watching.server, "Unknown server"),
      };
    }
    return { ...base, details: "Browsing Movisto", state: "Looking for something to watch" };
  }

  if (path.startsWith("/booksto")) {
    return { ...base, details: "Browsing Booksto", state: "Reading Arabic literature" };
  }

  if (path.startsWith("/novelsto")) {
    return { ...base, details: "Browsing Novelsto", state: "Reading translated novels" };
  }

  if (path.startsWith("/codesto")) {
    return { ...base, details: "Using Codesto", state: "Writing/running code" };
  }

  if (path.startsWith("/tvsto")) {
    return { ...base, details: "Browsing Tvsto", state: "Watching live TV" };
  }

  if (path.startsWith("/toolsto")) {
    return { ...base, details: "Using Toolsto", state: "Using a dev utility" };
  }

  if (path.startsWith("/gamesto")) {
    return { ...base, details: "Browsing Gamesto", state: "Playing a game" };
  }

  return { ...base, details: "Browsing StormD", state: "" };
}

presence.on("UpdateData", async () => {
  presence.setActivity(buildActivity(window.location.pathname));
});
