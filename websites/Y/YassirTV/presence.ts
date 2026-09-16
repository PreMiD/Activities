import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1549514873711501364',
})

enum ActivityAssets {
  // Placeholder icon — swap for YassirTV's real logo (square, ideally 512x512)
  Logo = 'https://sir-tv-apk.com/assets/store-icon-512.png',
  // Upload live-dot.png (generated alongside this file) to a host like
  // Imgur and paste the direct image URL here — Discord needs a real URL,
  // it can't read a local file.
  LiveDot = 'https://i.ibb.co/SDvNjsDY/6aaadb82e5ef86-05272767-Processed.png',
}

// Used only while "browsing" (not on a live match page) so elapsed time
// doesn't reset every UpdateData tick
let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatching = false

// The live player is embedded in an iframe, so presence.ts can't reach its
// <video> tag directly — iframe.ts reads it and sends this shape across
interface IFrameData {
  video?: {
    paused: boolean
    ended: boolean
    readyState: number
    currentTime: number
    duration: number
  }
}
let iFrameData: IFrameData = {}
presence.on('iFrameData', (data: IFrameData) => {
  iFrameData = data
})

// ---------------------------------------------------------------------------
// SELECTORS — the match page fills this content in with JavaScript after
// load, so these are best-guess placeholders, not confirmed values.
//
// To find the real ones: open the live match page, press F12, right-click
// the team name / score / status text on the page -> "Inspect", then copy
// the class or id shown in DevTools and paste it below.
// (PreMiD's own DevTools "PreMiD" tab, described in the Developer Tools
// guide, is useful for confirming what data your activity is actually
// picking up once this is loaded as an activity in dev mode.)
// ---------------------------------------------------------------------------
const SELECTORS = {
  homeTeam: '.team-home .team-name, .home-team .name',
  awayTeam: '.team-away .team-name, .away-team .name',
  score: '.match-score, .score',
  matchStatus: '.match-status, .live-badge',
}

function text(selector: string): string | null {
  return document.querySelector<HTMLElement>(selector)?.textContent?.trim() || null
}

function getMatchId(): string | null {
  return new URLSearchParams(document.location.search).get('match')
}

// Pulls translated versions of these common labels from PreMiD's own
// string library (maintained by their translation team), keyed to whatever
// language the user picked in the "lang" setting. Falls back to English.
async function getStrings() {
  return presence.getStrings({
    live: 'general.live',
    paused: 'general.paused',
    browsing: 'general.browsing',
  })
}

// The page title carries the site's own branding alongside the match name,
// e.g. "<match> | Siiir TV". Split on pipe/dash-style SEPARATORS only — not
// a plain " - ", since that's also how scorelines are written ("1 - 0"),
// and splitting on it would chop the score in half. Drop any chunk that's
// just the site name, and keep the longest real chunk left over.
function cleanTitle(title: string): string {
  const BRANDING = /si+r\s*tv|yas+ir\s*tv|سير|ياسر/i

  const parts = title
    .split(/\s*[|\u2013\u2014\u00BB\u00AB]\s*/)
    .map(part => part.trim())
    .filter(part => part && !BRANDING.test(part))

  if (!parts.length)
    return title.trim()

  return parts.reduce((a, b) => (b.length > a.length ? b : a))
}

// Extracts the live match minute from the page title, e.g. "52'"
function parseMinuteFromTitle(title: string): string | null {
  const match = title.match(/(\d{1,3})['\u2019\u02BC]/)
  return match ? `${match[1]}'` : null
}

presence.on('UpdateData', async () => {
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')
  const strings = await getStrings()

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
  }

  const matchId = getMatchId()
  const onMatchPage = document.location.pathname.includes('/hard/') && matchId

  if (onMatchPage) {
    const home = text(SELECTORS.homeTeam)
    const away = text(SELECTORS.awayTeam)
    const score = text(SELECTORS.score)
    const status = text(SELECTORS.matchStatus)
    const video = iFrameData.video

    // --- Alternative approach if DOM scraping above doesn't work ---------
    // Sites like this often populate match data from a background request
    // using the `match` id in the URL. If you find that request in the
    // Network tab (e.g. something like /api/match/<id>), you can read it
    // directly instead of scraping the DOM, using onRequest (ext 2.14+):
    //
    // if (supports(presence, 'onRequest')) {
    //   presence.onRequest({ url: '/api/match', method: 'GET' }, (req) => {
    //     if (!req.responseBody) return
    //     const data = JSON.parse(req.responseBody)
    //     // use data.homeTeam, data.awayTeam, data.score, etc.
    //   })
    // }
    // -----------------------------------------------------------------

    if (home && away) {
      presenceData.details = score ? `${home} ${score} ${away}` : `${home} vs ${away}`
    }
    else {
      // Selectors above haven't been matched to the real page yet, so fall
      // back to the page title with the site branding stripped out
      presenceData.details = document.title
        ? cleanTitle(document.title)
        : `Match #${matchId}`
    }

    // Prefer the live match minute from the title, then any status element,
    // then fall back to the generic "Live" string
    const minute = parseMinuteFromTitle(document.title)
    presenceData.state = minute || status || strings.live

    if (video) {
      // readyState >= 3 (HAVE_FUTURE_DATA) means it actually has enough
      // buffered data to play smoothly right now, not just "not paused"
      const isBuffering = video.readyState < 3
      const isPlaying = !video.paused && !video.ended

      if (isPlaying && !isBuffering) {
        // Actively playing, not stalled — show the red "live" dot
        presenceData.smallImageKey = ActivityAssets.LiveDot
        presenceData.smallImageText = strings.live
      }
      else if (!isPlaying) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = strings.paused
      }
      else {
        // Playing but buffering/loading — no dot. No PreMiD common string
        // for "buffering" as of writing, so this stays a literal fallback;
        // check https://api.premid.app/v2/langFile/presence/en/ periodically
        presenceData.state = 'Loading…'
      }
    }

    // Only meaningful for on-demand replays; live streams usually report
    // Infinity/NaN duration, so we fall back to a simple elapsed timer
    if (video && Number.isFinite(video.duration) && showTimestamp) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
        video.currentTime,
        video.duration,
      )
    }
    else if (showTimestamp) {
      if (!wasWatching)
        browsingTimestamp = Math.floor(Date.now() / 1000)
      presenceData.startTimestamp = browsingTimestamp
    }

    wasWatching = true

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Match',
          url: document.location.href,
        },
      ]
    }
  }
  else {
    if (wasWatching) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatching = false
    }
    presenceData.details = `${strings.browsing} YassirTV`
    if (showTimestamp)
      presenceData.startTimestamp = browsingTimestamp
  }

  presence.setActivity(presenceData)
})
