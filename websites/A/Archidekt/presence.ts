import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1493019553456717824',
})

const FORMAT_MAP: Record<number, string> = {
  1: 'Standard',
  2: 'Modern',
  3: 'Commander',
  4: 'Legacy',
  5: 'Vintage',
  6: 'Pauper',
  7: 'Custom',
  8: 'Frontier',
  9: 'Future Standard',
  10: 'Penny Dreadful',
  11: '1v1 Commander',
  12: 'Duel Commander',
  13: 'Brawl',
  14: 'Oathbreaker',
  15: 'Pioneer',
  16: 'Historic',
  17: 'Pauper EDH',
  18: 'Explorer',
  19: 'Gladiator',
  20: 'Premodern',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let currentPage = ''

/**
 * Parse deck info from the page title.
 *
 * Patterns:
 *   Deck:      "Fun With Fungus • (Golgari Commander deck) • Archidekt"
 *   Sandbox:   "Sandbox • (Custom deck) • Archidekt"
 *   Playtest:  "Archidekt playtester - Fun With Fungus"
 *   Homepage:  "MTG Deck Builder - Archidekt"
 */
function parseTitleInfo(): {
  deckName: string | null
  format: string | null
} {
  const title = document.title

  // Playtester: "Archidekt playtester - DeckName"
  if (title.startsWith('Archidekt playtester')) {
    const deckName = title.replace('Archidekt playtester - ', '').trim() || null
    return { deckName, format: null }
  }

  // Deck/Sandbox: "Name • (ColorIdentity Format deck) • Archidekt"
  // Split on • to avoid regex backtracking issues
  const parts = title.split('•').map(p => p.trim())
  if (parts.length === 3 && parts[2] === 'Archidekt') {
    const rawName = parts[0]!
    // Extract format from "(Golgari Commander deck)" → "Golgari Commander"
    const parenthetical = parts[1]!.match(/^\((.+) deck\)$/)
    if (parenthetical) {
      const formatPart = parenthetical[1]!.trim()

      const knownFormats = [
        'Commander',
        'Standard',
        'Modern',
        'Legacy',
        'Vintage',
        'Pauper',
        'Pioneer',
        'Oathbreaker',
        'Brawl',
        'Historic',
        'Gladiator',
        'Premodern',
        'Explorer',
        'Custom',
        'Penny Dreadful',
        'Frontier',
        'Duel Commander',
        '1v1 Commander',
        'Pauper EDH',
        'Future Standard',
      ]

      let format: string | null = null
      for (const f of knownFormats) {
        if (formatPart.endsWith(f) || formatPart === f) {
          format = f
          break
        }
      }
      if (!format)
        format = formatPart.split(' ').pop() ?? null

      const deckName = rawName === 'Sandbox' ? null : rawName
      return { deckName, format }
    }
  }

  return { deckName: null, format: null }
}

/**
 * Get format name from the twitter:data2 meta tag.
 * Archidekt sets <meta name="twitter:data2" content="Commander">.
 */
function getFormatFromMeta(): string | null {
  return document.querySelector<HTMLMetaElement>('meta[name="twitter:data2"]')
    ?.content ?? null
}

/**
 * Extract deck data from __NEXT_DATA__ script tag.
 * Available on deck pages at props.pageProps.redux.deck
 */
function getNextDataDeck(): {
  name: string | null
  format: number | null
  cardCount: number | null
} {
  try {
    const el = document.querySelector<HTMLScriptElement>('#__NEXT_DATA__')
    if (!el?.textContent)
      return { name: null, format: null, cardCount: null }

    const data = JSON.parse(el.textContent)
    const deck = data?.props?.pageProps?.redux?.deck

    if (!deck)
      return { name: null, format: null, cardCount: null }

    const cardMap = deck.cardMap ?? deck.cards
    let cardCount: number | null = null
    if (cardMap && typeof cardMap === 'object')
      cardCount = Object.keys(cardMap).length

    return {
      name: deck.name ?? null,
      format: deck.format ?? deck.deckFormat ?? null,
      cardCount,
    }
  }
  catch {
    return { name: null, format: null, cardCount: null }
  }
}

/**
 * Scan DOM text for card count and estimated cost.
 * These are client-side rendered so not in SSR HTML.
 */
function scrapeDeckStats(): { cardCount: number | null, cost: string | null } {
  let cardCount: number | null = null
  let cost: string | null = null

  const bodyText = document.body.textContent ?? ''

  const countMatch = bodyText.match(/Deck Size:\s*(\d+)/)
  if (countMatch)
    cardCount = Number.parseInt(countMatch[1]!, 10)

  const costMatch = bodyText.match(/Est(?:\.|imated)?\s*deck\s*cost:\s*([\d.,]+)\s*([€$£])/)
  if (costMatch)
    cost = `${costMatch[2]}${costMatch[1]}`

  if (!cost) {
    const costMatch2 = bodyText.match(/Est(?:\.|imated)?\s*deck\s*cost:\s*([€$£])([\d.,]+)/)
    if (costMatch2)
      cost = `${costMatch2[1]}${costMatch2[2]}`
  }

  return { cardCount, cost }
}

function getPageType(): 'homepage' | 'deck' | 'sandbox' | 'playtest' | 'browsing' {
  const path = document.location.pathname

  if (path === '/' || path === '')
    return 'homepage'
  if (path === '/sandbox')
    return 'sandbox'
  if (path.startsWith('/playtester-v2/'))
    return 'playtest'
  if (/^\/decks\/\d+/.test(path)) {
    if (path.endsWith('/playtest'))
      return 'playtest'
    return 'deck'
  }

  return 'browsing'
}

function getDeckIdFromUrl(): string | null {
  const path = document.location.pathname

  const deckMatch = path.match(/^\/decks\/(\d+)/)
  if (deckMatch)
    return deckMatch[1]!

  const playtestMatch = path.match(/^\/playtester-v2\/(\d+)/)
  if (playtestMatch)
    return playtestMatch[1]!

  return null
}

presence.on('UpdateData', async () => {
  const [showButton, showCost, privacyMode] = await Promise.all([
    presence.getSetting<boolean>('showButton'),
    presence.getSetting<boolean>('showCost'),
    presence.getSetting<boolean>('privacyMode'),
  ])

  const pageType = getPageType()
  const deckId = getDeckIdFromUrl()
  const pageKey = `${pageType}:${deckId ?? 'none'}`

  if (pageKey !== currentPage) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    currentPage = pageKey
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/ubVFpDR.png',
    startTimestamp: browsingTimestamp,
  }

  switch (pageType) {
    case 'deck':
    case 'sandbox': {
      const titleInfo = parseTitleInfo()
      const nextData = getNextDataDeck()

      // Deck name: title > __NEXT_DATA__
      const deckName = titleInfo.deckName ?? nextData.name

      // Format: title > twitter:data2 meta > __NEXT_DATA__ format map
      let format = titleInfo.format ?? getFormatFromMeta()
      if (!format && nextData.format !== null)
        format = FORMAT_MAP[nextData.format] ?? null

      // Card count: DOM text > __NEXT_DATA__
      const stats = scrapeDeckStats()
      const cardCount = stats.cardCount ?? nextData.cardCount

      // Details line
      if (privacyMode || !deckName) {
        presenceData.details = pageType === 'sandbox'
          ? 'Building a new deck'
          : 'Building a deck'
      }
      else {
        presenceData.details = deckName.length > 100
          ? `Building ${deckName.substring(0, 97)}...`
          : `Building ${deckName}`
      }

      // State line: "Format • N cards" optionally + " • €cost"
      const stateParts: string[] = []
      if (format)
        stateParts.push(format)
      if (cardCount !== null)
        stateParts.push(`${cardCount} cards`)
      if (showCost && stats.cost && !privacyMode)
        stateParts.push(stats.cost)

      if (stateParts.length > 0)
        presenceData.state = stateParts.join(' \u2022 ')

      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Building'

      // View Deck button — only for saved decks, not sandbox
      if (showButton && !privacyMode && pageType === 'deck' && deckId) {
        presenceData.buttons = [
          {
            label: 'View Deck',
            url: `https://archidekt.com${document.location.pathname}`,
          },
        ]
      }

      break
    }

    case 'playtest': {
      const titleInfo = parseTitleInfo()
      const nextData = getNextDataDeck()

      const deckName = titleInfo.deckName ?? nextData.name

      let format = getFormatFromMeta()
      if (!format && nextData.format !== null)
        format = FORMAT_MAP[nextData.format!] ?? null

      // Details line
      if (privacyMode || !deckName) {
        presenceData.details = 'Playtesting a deck'
      }
      else {
        presenceData.details = deckName.length > 95
          ? `Playtesting ${deckName.substring(0, 92)}...`
          : `Playtesting ${deckName}`
      }

      if (format)
        presenceData.state = format

      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playtesting'

      // Button links to the deck page, not the playtester URL
      if (showButton && !privacyMode && deckId) {
        presenceData.buttons = [
          {
            label: 'View Deck',
            url: `https://archidekt.com/decks/${deckId}`,
          },
        ]
      }

      break
    }

    case 'homepage': {
      presenceData.details = 'Browsing Archidekt'
      presenceData.state = 'Exploring decks'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Browsing'
      break
    }

    default: {
      presenceData.details = 'Browsing Archidekt'

      const path = document.location.pathname
      if (path.startsWith('/search/decks')) {
        presenceData.state = 'Searching decks'
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Searching'
      }
      else if (path.startsWith('/search/cards')) {
        presenceData.state = 'Searching cards'
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Searching'
      }
      else if (path.startsWith('/u/')) {
        presenceData.state = 'Viewing a profile'
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Viewing'
      }
      else if (path.startsWith('/collection')) {
        presenceData.state = 'Managing collection'
        presenceData.smallImageKey = Assets.Writing
        presenceData.smallImageText = 'Collection'
      }
      else {
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Browsing'
      }

      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.setActivity()
})
