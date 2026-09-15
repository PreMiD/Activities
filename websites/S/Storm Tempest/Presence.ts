/**
 * Storm Tempest — PreMiD Presence
 *
 * Confirmed from the site's homepage: top-level sections are
 * Mangasto (/mangasto), Anisto (/anisto), Movisto (/movisto),
 * Booksto (/booksto), Novelsto (/novelsto), Codesto (/codesto),
 * Tvsto (/tvsto), Toolsto (/toolsto), Gamesto (/gamesto), and an AI Chat
 * section. These route-level checks are solid.
 *
 * DOM extraction uses multiple fallback selectors to handle various page
 * structures. Safe fallbacks ensure we never display undefined/null/blank.
 */

const presence = new Presence({
  clientId: '1233213267053248633',
})

const startTimestamp = Math.floor(Date.now() / 1000)

function safeText(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim()
  if (!trimmed || /^(?:undefined|null|nan)$/.test(trimmed.toLowerCase())) {
    return fallback
  }
  return trimmed
}

/**
 * Extract text content from multiple possible selectors.
 * Returns first non-empty result or fallback.
 */
function extractFromSelectors(selectors: string[], fallback = ''): string {
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector)
      const text = safeText(el?.textContent, '')
      if (text) return text
    } catch {
      // Invalid selector, try next
    }
  }
  return fallback
}

/**
 * Extract number from text using multiple strategies.
 */
function extractNumber(text: string | null | undefined): string {
  if (!text) return ''
  const match = text.match(/\d+/)
  return match ? match[0] : ''
}

/**
 * Get anime info: title, server, episode number
 */
function getAnisto() {
  const title = extractFromSelectors([
    '[data-anime-title]',
    '.anime-title',
    '.video-title',
    'h1',
    '.title',
    '[class*="title"]',
  ])

  const server = extractFromSelectors([
    '[data-server].active',
    '[data-server][aria-selected="true"]',
    '.server.active',
    '.active-server',
    '[class*="server"][class*="active"]',
  ])

  const epText = extractFromSelectors([
    '[data-episode-number]',
    '.episode-number',
    '[class*="episode"]',
  ])
  const episode = extractNumber(epText)

  if (!title) {
    return null // not on a watch page or page not loaded yet
  }

  return { title, server, episode }
}

/**
 * Get manga info: title, chapter number
 */
function getMangasto() {
  const title = extractFromSelectors([
    '[data-manga-title]',
    '.manga-title',
    '.read-title',
    'h1',
    '.title',
    '[class*="title"]',
  ])

  const chapterText = extractFromSelectors([
    '[data-chapter-number]',
    '.chapter-number',
    '[class*="chapter"]',
  ])
  const chapter = extractNumber(chapterText)

  if (!title) {
    return null
  }

  return { title, chapter }
}

/**
 * Get movie/series info: title, server
 */
function getMovisto() {
  const title = extractFromSelectors([
    '[data-movie-title]',
    '.movie-title',
    '.video-title',
    'h1',
    '.title',
    '[class*="title"]',
  ])

  const server = extractFromSelectors([
    '[data-server].active',
    '[data-server][aria-selected="true"]',
    '.server.active',
    '.active-server',
    '[class*="server"][class*="active"]',
  ])

  if (!title) {
    return null
  }

  return { title, server }
}

function buildActivity(path: string): PresenceData {
  const base: PresenceData = {
    largeImageKey: Assets.Logo,
    startTimestamp,
    buttons: [{ label: 'Open Storm Tempest', url: window.location.href }],
  }

  if (path === '/' || path === '') {
    return { ...base, details: 'On the homepage', state: 'Choosing what to do' }
  }

  if (path.startsWith('/anisto')) {
    const watching = getAnisto()
    if (watching) {
      return {
        ...base,
        details: `Watching ${watching.title}`,
        state: watching.episode
          ? `${watching.server || 'Unknown server'} — Episode ${watching.episode}`
          : watching.server || 'Unknown server',
      }
    }
    return { ...base, details: 'Browsing Anisto', state: 'Looking for an anime to watch' }
  }

  if (path.startsWith('/mangasto')) {
    const reading = getMangasto()
    if (reading) {
      return {
        ...base,
        details: `Reading ${reading.title}`,
        state: reading.chapter ? `Chapter ${reading.chapter}` : 'Reading',
      }
    }
    return { ...base, details: 'Browsing Mangasto', state: 'Looking for a manga to read' }
  }

  if (path.startsWith('/movisto')) {
    const watching = getMovisto()
    if (watching) {
      return {
        ...base,
        details: `Watching ${watching.title}`,
        state: watching.server || 'Unknown server',
      }
    }
    return { ...base, details: 'Browsing Movisto', state: 'Looking for something to watch' }
  }

  if (path.startsWith('/booksto')) {
    return { ...base, details: 'Browsing Booksto', state: 'Reading Arabic literature' }
  }

  if (path.startsWith('/novelsto')) {
    return { ...base, details: 'Browsing Novelsto', state: 'Reading translated novels' }
  }

  if (path.startsWith('/codesto')) {
    return { ...base, details: 'Using Codesto', state: 'Writing/running code' }
  }

  if (path.startsWith('/tvsto')) {
    return { ...base, details: 'Browsing Tvsto', state: 'Watching live TV' }
  }

  if (path.startsWith('/toolsto')) {
    return { ...base, details: 'Using Toolsto', state: 'Using a dev utility' }
  }

  if (path.startsWith('/gamesto')) {
    return { ...base, details: 'Browsing Gamesto', state: 'Playing a game' }
  }

  return { ...base, details: 'Browsing Storm Tempest', state: '' }
}

presence.on('UpdateData', async () => {
  presence.setActivity(buildActivity(window.location.pathname))
})
