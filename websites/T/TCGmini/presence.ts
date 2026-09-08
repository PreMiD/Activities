import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1543259483159920721',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Ks9Sgo1.png',
}

// TCGmini is a single-page app: the router changes `document.location.pathname`
// without a full page reload. Only Spanish (/es/...) uses its own, translated
// slugs (tablero/cartas/mazos/perfil); every other locale — English (unprefixed)
// and the ja/it/fr/pt/ko translations — reuses the English slugs (board/cards/
// decks/profile). "jp" and "kr" are not real locale prefixes on this site.
const LOCALE_PREFIX = /^\/(?:es|ja|it|fr|pt|ko)(?=\/|$)/
const SECTION_ALIASES: Record<string, string> = {
  tablero: 'board',
  cartas: 'cards',
  mazos: 'decks',
}

// Reset the "elapsed time" counter whenever the visitor moves to a different section.
let sectionTimestamp = Math.floor(Date.now() / 1000)
let lastSection: string | null = null

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    homepage: 'tcgmini.homepage',
    simulator: 'tcgmini.simulator',
    inMatch: 'tcgmini.inMatch',
    searchingCards: 'tcgmini.searchingCards',
    buildingDeck: 'tcgmini.buildingDeck',
    checkingMeta: 'tcgmini.checkingMeta',
    draftingDeck: 'tcgmini.draftingDeck',
    makingTierlist: 'tcgmini.makingTierlist',
    browsingSite: 'tcgmini.browsingSite',
    formatStandard: 'tcgmini.formatStandard',
    formatAdvanced: 'tcgmini.formatAdvanced',
    formatSandbox: 'tcgmini.formatSandbox',
    winning: 'tcgmini.winning',
    losing: 'tcgmini.losing',
    tied: 'tcgmini.tied',
    victory: 'tcgmini.victory',
    defeat: 'tcgmini.defeat',
    matchEnded: 'tcgmini.matchEnded',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  const path = document.location.pathname.replace(LOCALE_PREFIX, '') || '/'
  const rawSection = path.split('/')[1] || 'home'
  const section = SECTION_ALIASES[rawSection] ?? rawSection

  if (section !== lastSection) {
    sectionTimestamp = Math.floor(Date.now() / 1000)
    lastSection = section
  }

  switch (section) {
    case 'home': {
      presenceData.details = strings.homepage
      break
    }
    case 'board': {
      // Playing/simulating a match on the board.
      // Format: stored in localStorage, confirmed by testing all 3 reachable
      // modes live. "draft" is intentionally left unmapped — its real value
      // couldn't be confirmed (Draft needs 2 real players to test).
      const FORMAT_LABELS: Record<string, string> = {
        estandar: strings.formatStandard,
        advanced: strings.formatAdvanced,
        libre: strings.formatSandbox,
      }
      const rawFormat = localStorage.getItem('pocketboard_play_mode_v1')
      const formatLabel = (rawFormat && FORMAT_LABELS[rawFormat]) || strings.simulator

      // End-of-match result screen. `.pvp-fin` is only present in the DOM
      // while that overlay is showing (it's removed on "Play again"/"Leave"),
      // so this naturally reverts to the live in-match state below once it's
      // gone. Read directly from the DOM (shared with the page, unlike
      // `window` globals) — `.pvp-fin-score` always lists the local player's
      // score first, same "me first" convention confirmed elsewhere.
      const finEl = document.querySelector('.pvp-fin')
      if (finEl) {
        const [finMine = 0, finTheirs = 0] = (finEl.querySelector('.pvp-fin-score')?.textContent ?? '')
          .split(/\D+/)
          .filter(Boolean)
          .map(Number)
        const finLabel = finMine > finTheirs ? strings.victory : finMine < finTheirs ? strings.defeat : strings.tied

        presenceData.details = formatLabel
        presenceData.state = `${finLabel} ${finMine}-${finTheirs}`
        presenceData.smallImageKey = Assets.Stop
        presenceData.smallImageText = strings.matchEnded
        break
      }

      // Score: `_pbScores` is TCGmini's own live score object, read from the
      // page's realm via getPageVariable (presence.ts runs in an isolated JS
      // context, so `window._pbScores` here would always be undefined).
      // Confirmed directly in the site's source (see `_pvpZoneSync` /
      // `_pvpStartMatch` comments): in a match the local player is ALWAYS p1,
      // the opponent is ALWAYS p2, regardless of host/guest role.
      const { _pbScores } = await presence.getPageVariable<{ _pbScores?: { p1: number, p2: number } }>('_pbScores')
      const mine = _pbScores?.p1 ?? 0
      const theirs = _pbScores?.p2 ?? 0
      const resultLabel = mine > theirs ? strings.winning : mine < theirs ? strings.losing : strings.tied

      presenceData.details = `${strings.inMatch}: ${formatLabel}`
      presenceData.state = `${resultLabel} ${mine}-${theirs}`
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.inMatch
      presenceData.startTimestamp = sectionTimestamp
      break
    }
    case 'cards': {
      // Card search/database. `#search-input` is a stable id, unlike the
      // placeholder text which is translated per locale.
      const query = document.querySelector<HTMLInputElement>('#search-input')?.value

      presenceData.details = strings.searchingCards
      presenceData.state = query ? `"${query}"` : undefined
      presenceData.smallImageKey = Assets.Search
      break
    }
    case 'decks': {
      presenceData.details = strings.buildingDeck
      presenceData.smallImageKey = Assets.Writing
      break
    }
    case 'meta': {
      presenceData.details = strings.checkingMeta
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case 'draft': {
      presenceData.details = strings.draftingDeck
      presenceData.smallImageKey = Assets.Writing
      break
    }
    case 'tierlist': {
      presenceData.details = strings.makingTierlist
      presenceData.smallImageKey = Assets.Writing
      break
    }
    default: {
      presenceData.details = strings.browsingSite
    }
  }

  presence.setActivity(presenceData)
})
