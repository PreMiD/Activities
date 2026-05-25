import { ActivityType, Assets, getTimestamps } from "premid"

// Presence must be declared before any other variable
const presence = new Presence({ clientId: "1508462512339943425" })

enum ActivityAssets {
  Logo = "https://i.imgur.com/QLfdRng.png"
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPathname = ""
let wasWatchingVideo = false

// ── Helpers ────────────────────────────────────────────────────────────────

function getVideo(): HTMLVideoElement | null {
  const v = document.querySelector<HTMLVideoElement>("video")
  return v && v.readyState > 0 ? v : null
}

/**
 * Confirmed selector from live DOM:
 * <span class="mr-2 !line-clamp-2 w-full ... font-semibold tracking-wide ...">
 */
function getAnimeTitle(): string {
  const fromSpan =
    document.querySelector<HTMLElement>("span.mr-2.w-full.tracking-wide")?.innerText?.trim() ??
    document.querySelector<HTMLElement>("span.opacity-90.tracking-wide")?.innerText?.trim()

  if (fromSpan) return fromSpan

  return (
    document.title.replace(/ Episode \d+.*$/i, "").replace(/ -\s*AnimeX(one)?/i, "").trim() ||
    "Unknown Anime"
  )
}

/** AniList cover: <img src="https://s4.anilist.co/.../cover/..."> */
function getAnimeCover(): string | undefined {
  return (
    document.querySelector<HTMLImageElement>("img[src*='s4.anilist.co'][src*='/cover/']")?.src ??
    undefined
  )
}

/** Episode number from URL: /watch/slug-ANILISTID-episode-N */
function getEpisodeNumber(): number | null {
  const match = document.location.pathname.match(/episode-(\d+)/i)
  if (!match?.[1]) return null
  return parseInt(match[1], 10)
}

/** AniList ID extracted from URL slug */
function getAniListId(): string | null {
  const { pathname } = document.location
  const match =
    pathname.match(/-(\d{4,6})-episode-\d+$/) ??
    pathname.match(/-(\d{4,6})$/)
  return match?.[1] ?? null
}

/** AniList URL from on-page link or constructed from slug ID */
function getAniListUrl(): string | null {
  const id = getAniListId()
  return (
    document.querySelector<HTMLAnchorElement>("a[href*='anilist.co/anime/']")?.href ??
    (id ? `https://anilist.co/anime/${id}` : null)
  )
}

/** Active Sub/Dub mode from toggle button */
function getSubDubMode(): string | null {
  return (
    document.querySelector<HTMLElement>("button.bg-primary span:last-child")?.innerText?.trim() ??
    null
  )
}

/** Genre tags from the anime info page (max 3) */
function getGenres(): string {
  return [...document.querySelectorAll<HTMLElement>("a[href*='catalog?genres']")]
    .map(a => a.innerText.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ")
}

// ── Main ───────────────────────────────────────────────────────────────────

presence.on("UpdateData", async () => {
  const [showButtons, showTimestamp] = await Promise.all([
    presence.getSetting<boolean>("showButtons").catch(() => true),
    presence.getSetting<boolean>("showTimestamp").catch(() => true)
  ])

  const strings = await presence.getStrings({
    play:     "general.playing",
    pause:    "general.paused",
    browse:   "general.browsing",
    viewPage: "general.viewPage"
  })

  const { pathname, href } = document.location

  // Reset timestamp on every SPA navigation
  if (pathname !== lastPathname) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    lastPathname = pathname
  }

  const presenceData: PresenceData = {
    largeImageKey:  ActivityAssets.Logo,
    largeImageText: "AnimeX",
    type:           ActivityType.Watching
  }

  // ── /watch/ — Episode page ──────────────────────────────────────────────
  if (pathname.startsWith("/watch/")) {
    const animeTitle = getAnimeTitle()
    const episodeNum = getEpisodeNumber()
    const subDub     = getSubDubMode()
    const animeCover = getAnimeCover()
    const anilistUrl = getAniListUrl()
    const video      = getVideo()

    presenceData.largeImageKey  = animeCover ?? ActivityAssets.Logo
    presenceData.largeImageText = episodeNum !== null
      ? `Episode ${episodeNum}`
      : subDub
        ? `${animeTitle} \u00b7 ${subDub}`
        : animeTitle

    presenceData.details = animeTitle
    presenceData.state =
      (episodeNum !== null ? `Episode ${episodeNum}` : "Unknown Episode") +
      (subDub ? ` \u00b7 ${subDub}` : "")

    if (video) {
      const paused = video.paused
      presenceData.smallImageKey  = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? strings.pause : strings.play

      if (showTimestamp && !paused && !isNaN(video.duration) && video.duration > 0) {
        ;[presenceData.startTimestamp, presenceData.endTimestamp] =
          getTimestamps(video.currentTime, video.duration)
      } else if (showTimestamp && paused) {
        presenceData.startTimestamp = browsingTimestamp
        delete presenceData.endTimestamp
      } else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }

      wasWatchingVideo = true
    } else {
      presenceData.smallImageKey  = Assets.Play
      presenceData.smallImageText = strings.play

      if (showTimestamp) {
        presenceData.startTimestamp = browsingTimestamp
      } else {
        delete presenceData.startTimestamp
      }
      delete presenceData.endTimestamp
      wasWatchingVideo = false
    }

    if (showButtons) {
      presenceData.buttons = anilistUrl
        ? [
            { label: "Watch Episode", url: href },
            { label: "View on AniList", url: anilistUrl }
          ]
        : [{ label: "Watch Episode", url: href }]
    } else {
      delete presenceData.buttons
    }

  // ── /anime/ — Info page ─────────────────────────────────────────────────
  } else if (pathname.startsWith("/anime/")) {
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
    }

    const title =
      document.querySelector<HTMLElement>("h1, span.mr-2.w-full.tracking-wide")
        ?.innerText?.trim() ??
      pathname.replace("/anime/", "").replace(/-\d+$/, "").replace(/-/g, " ")

    const animeCover = getAnimeCover()
    const anilistUrl = getAniListUrl()
    const genres     = getGenres()

    presenceData.largeImageKey  = animeCover ?? ActivityAssets.Logo
    presenceData.largeImageText = genres || "AnimeX"
    presenceData.details        = strings.viewPage ?? "Viewing anime"
    presenceData.state          = title
    presenceData.smallImageKey  = Assets.Search
    presenceData.smallImageText = strings.browse

    if (showTimestamp) {
      presenceData.startTimestamp = browsingTimestamp
    } else {
      delete presenceData.startTimestamp
    }
    delete presenceData.endTimestamp

    if (showButtons) {
      presenceData.buttons = anilistUrl
        ? [
            { label: "View Anime", url: href },
            { label: "View on AniList", url: anilistUrl }
          ]
        : [{ label: "View Anime", url: href }]
    } else {
      delete presenceData.buttons
    }

  // ── /catalog — Browse / Search ──────────────────────────────────────────
  } else if (pathname.startsWith("/catalog")) {
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
    }

    const params = new URLSearchParams(document.location.search)
    const query  = params.get("search")
    const genre  = params.get("genres")

    presenceData.details        = query ? "Searching" : genre ? "Browsing genre" : strings.browse
    presenceData.state          = query ? `"${query}"` : (genre ?? "All anime")
    presenceData.smallImageKey  = Assets.Search
    presenceData.smallImageText = strings.browse

    if (showTimestamp) {
      presenceData.startTimestamp = browsingTimestamp
    } else {
      delete presenceData.startTimestamp
    }
    delete presenceData.endTimestamp
    delete presenceData.buttons

  // ── All other pages ─────────────────────────────────────────────────────
  } else {
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
    }

    const pageMap: Record<string, [string, string]> = {
      "/music":     [strings.browse, "Anime music"],
      "/community": [strings.browse, "Community"],
      "/schedule":  [strings.browse, "Schedule"],
      "/settings":  [strings.browse, "Settings"],
      "/home":      [strings.browse, "Home"],
      "/":          [strings.browse, "Home"]
    }

    const [details, state] =
      pageMap[pathname] ??
      [strings.browse, document.title.replace(/ - AnimeX(one)?/i, "").trim() || "AnimeX"]

    presenceData.details        = details
    presenceData.state          = state
    presenceData.smallImageKey  = Assets.Search
    presenceData.smallImageText = strings.browse

    if (showTimestamp) {
      presenceData.startTimestamp = browsingTimestamp
    } else {
      delete presenceData.startTimestamp
    }
    delete presenceData.endTimestamp
    delete presenceData.buttons
  }

  presence.setActivity(presenceData)
})