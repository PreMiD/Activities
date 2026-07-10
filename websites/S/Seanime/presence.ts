import { ActivityType, Assets, getTimestamps, StatusDisplayType, timestampFromFormat } from 'premid'

// Define assets outside the update loop
enum ActivityAssets {
  Logo = 'https://i.imgur.com/glQ9FOt.png',
}

const presence = new Presence({
  clientId: '1483241564619669546',
})

// Browsing timestamp lives outside UpdateData so it stays consistent.
// It only resets when we switch from watching back to browsing.
let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatchingVideo = false

/**
 * Best estimate of the true playback position, in seconds, and when it
 * was last updated. Three sources feed it, in order of trust:
 *  1. A LIVE UI readout — absolute truth, snaps the estimate.
 *  2. A frozen readout while playback advances (controls auto-hidden) —
 *     accumulate wall-clock time × playback speed.
 *  3. A frozen readout while playback is stalled (buffering / transcode
 *     spin-up) — hold the position still.
 */
let est: { position: number, at: number } | null = null

// Last sent timestamps — reused while stable so Discord's own clock
// animates the bar instead of us re-sending jittering values.
let anchor: { start: number, end: number } | null = null

// Freshness tracking: the readout text freezes when the control bar
// auto-hides, so a value is only "live" if it changed recently.
let lastUiCurrent: number | null = null
let lastUiChangeAt = 0

// Advancement tracking: video.currentTime is unreliable as an absolute
// position (segment-relative after transcoded seeks), but whether it's
// MOVING is a rock-solid "is playback actually progressing" signal.
// The poll can outpace currentTime's update granularity, so a stall is
// only declared after a sustained period of zero movement.
let lastVideoTime = -1
let lastVideoAdvanceAt = 0

/**
 * Single DOM pass that finds both the chapter label ("Chapter 12")
 * and the page counter ("4 / 38") for the manga reader.
 */
function findMangaInfo(): { chapter: string | null, page: string | null } {
  let chapter: string | null = null
  let page: string | null = null

  const nodes = document.querySelectorAll('div, span')
  for (const n of nodes) {
    const text = n.textContent?.trim()
    if (!text)
      continue
    if (!chapter && /^chapter\s*\d+/i.test(text))
      chapter = text
    if (!page && /^\d+\s*\/\s*\d+$/.test(text))
      page = text
    if (chapter && page)
      break
  }
  return { chapter, page }
}

/**
 * Reads the player's own timestamp readout from the UI.
 * Handles both display modes: elapsed ("11:12 / 24:27") and
 * remaining ("-13:15 / 24:27", toggled by clicking the readout).
 */
function getPlayerTimes(): [number, number] | null {
  const el = document.querySelector('[data-vc-element="timestamp"]')
  const text = el?.textContent?.trim()

  if (!el || !text || !text.includes('/'))
    return null

  const [currentRaw = '', durationRaw = ''] = text.split('/').map(s => s.trim())

  const duration = timestampFromFormat(durationRaw)
  if (duration <= 0)
    return null

  // timestampFromFormat() returns 0 for "-13:15", so strip the sign and
  // convert remaining time back to elapsed ourselves.
  const isRemaining
    = el.getAttribute('data-vc-timestamp-type') === 'remaining'
      || currentRaw.startsWith('-')
  const cleanCurrent = currentRaw.replace(/^-/, '')

  // Reject loading placeholders like "--:--" outright — parsing them as 0
  // would poison the estimate.
  if (!/^\d+(?::\d{1,2}){0,2}$/.test(cleanCurrent))
    return null

  const parsed = timestampFromFormat(cleanCurrent)
  const current = isRemaining ? duration - parsed : parsed

  // Sanity bounds — reject garbage reads
  if (current < 0 || current > duration + 1)
    return null

  return [Math.min(current, duration), duration]
}

/**
 * The regExp in metadata.json matches ANY port on localhost, LAN IPs,
 * and Tailscale (*.ts.net) hosts — so before doing anything, verify the
 * page is actually Seanime. Otherwise this would trigger on any random
 * local dev server.
 */
function isSeanime(): boolean {
  return (
    document.title.includes('Seanime')
    || !!document.querySelector('link[rel~="icon"][href*="seanime" i]')
    || !!document.querySelector('img[src*="seanime" i], img[alt*="seanime" i]')
  )
}

presence.on('UpdateData', async () => {
  if (!isSeanime()) {
    presence.clearActivity()
    return
  }

  const { pathname } = document.location
  const title = document.title.replace(' | Seanime', '').trim()

  // 1. Watching Video (checked first so the player always wins,
  //    even if the URL still matches another section)
  const video = document.querySelector('video')
  if (video && video.readyState > 0) {
    wasWatchingVideo = true

    const titleEl = document.querySelector('[data-vc-element="top-playback-info-title"]')
    const epNumEl = document.querySelector('[data-vc-element="top-playback-info-episode"] p.font-bold')
    const epNameEl = document.querySelector('[data-vc-element="top-playback-info-episode"] p.\\!font-normal')

    const animeName = titleEl?.textContent?.trim() || title
    const epNum = epNumEl?.textContent?.trim() || ''
    const epName = epNameEl?.textContent?.trim() || ''

    const epInfo = [epNum, epName].filter(Boolean).join(': ')
    const isPaused = video.paused

    // "name" replaces the bold header, so Discord shows
    // "Watching <Anime Name>" instead of "Watching Seanime".
    const videoPresenceData: PresenceData = {
      type: ActivityType.Watching,
      name: animeName,
      statusDisplayType: StatusDisplayType.Name,
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'Seanime',
      details: animeName,
      state: epInfo || 'Watching Video',
      smallImageKey: isPaused ? Assets.Pause : Assets.Play,
      smallImageText: isPaused ? 'Paused' : 'Playing',
    }

    const showTimestamp = await presence.getSetting<boolean>('showTimestamp').catch(() => true)

    // Manual compensation knob: positive values push the bar FORWARD.
    const offsetRaw = await presence.getSetting<string>('timeOffset').catch(() => '0')
    const offset = Math.max(-300, Math.min(300, Number.parseInt(offsetRaw, 10) || 0))

    const now = Date.now()

    // Is playback actually progressing? Sticky: one quiet poll must not
    // drop the bar — only a sustained 2s of zero movement is a stall.
    // The moment currentTime moves again, this flips back instantly.
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime
      lastVideoAdvanceAt = now
    }
    const advancing = now - lastVideoAdvanceAt <= 2000

    // Parse the readout and decide whether it's live or frozen
    const uiTimes = getPlayerTimes()
    if (uiTimes && uiTimes[0] !== lastUiCurrent) {
      lastUiCurrent = uiTimes[0]
      lastUiChangeAt = now
    }
    const readoutLive = uiTimes !== null && now - lastUiChangeAt <= 2000

    // ── Update the position estimate ──────────────────────────────────
    if (isPaused) {
      // Holding position; refresh `at` so no phantom time accumulates
      if (est)
        est = { position: est.position, at: now }
    }
    else if (readoutLive && uiTimes) {
      // Live readout is absolute truth
      est = { position: uiTimes[0], at: now }
    }
    else if (est && advancing) {
      // Controls hidden but playing: accumulate real time × speed
      const rate = video.playbackRate || 1
      est = { position: est.position + ((now - est.at) / 1000) * rate, at: now }
    }
    else if (est) {
      // Stalled (buffering / transcode spin-up): position holds still
      est = { position: est.position, at: now }
    }
    else if (uiTimes) {
      // No estimate yet and only a stale readout — best effort seed
      est = { position: uiTimes[0], at: now }
    }

    const duration = uiTimes?.[1] ?? (anchor ? anchor.end - anchor.start : 0)

    // ── Send timestamps ───────────────────────────────────────────────
    // Discord ticks the bar at 1x on its own. That's only correct while
    // playback is actually advancing — during stalls, drop the bar
    // entirely (like a pause) instead of letting it count fantasy time.
    if (showTimestamp && !isPaused && advancing && est && duration > 0) {
      const [start, end] = getTimestamps(est.position, duration)

      // ±2s hysteresis absorbs flooring jitter; real seeks snap through
      if (
        !anchor
        || anchor.end - anchor.start !== end - start
        || Math.abs(anchor.start - start) > 2
      ) {
        anchor = { start, end }
      }

      videoPresenceData.startTimestamp = anchor.start - offset
      videoPresenceData.endTimestamp = anchor.end - offset
    }
    else {
      // Paused or stalled → no bar; next advancing tick re-sends fresh
      anchor = null
    }

    presence.setActivity(videoPresenceData)
    return
  }

  // Not watching anymore → reset all playback state once
  if (wasWatchingVideo) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    wasWatchingVideo = false
    anchor = null
    est = null
    lastUiCurrent = null
    lastVideoTime = -1
    lastVideoAdvanceAt = 0
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  // 2. Reading Manga
  if (pathname.includes('/manga/entry')) {
    const { chapter, page } = findMangaInfo()

    // Bold header becomes the manga title
    presenceData.name = title
    presenceData.statusDisplayType = StatusDisplayType.Name
    presenceData.details = `Reading ${title}`

    if (!chapter && !page) {
      presenceData.state = 'Manga Info'
    }
    else {
      presenceData.state = page
        ? `${chapter ?? 'Reading'} • Page ${page}`
        : (chapter ?? 'Reading')
    }

    presence.setActivity(presenceData)
    return
  }

  // 3. Browsing Home/Base
  if (pathname === '/' || pathname === '') {
    presenceData.details = 'Browsing'
    presenceData.state = 'Looking for anime or manga'
    presence.setActivity(presenceData)
    return
  }

  // 4. Global Fallback
  presenceData.details = 'Browsing'
  presenceData.state = title

  presence.setActivity(presenceData)
})
