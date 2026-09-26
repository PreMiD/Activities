import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1543259483159920721',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/TCGmini/assets/logo.png',
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

// Shared by the matchmaking-search screen and the live-match state below —
// both need to turn the raw `pocketboard_play_mode_v1` value into a label.
// "draft" was confirmed live on the matchmaking-search screen (previously
// left unmapped here because Draft needs 2 real players and couldn't be
// tested in a match).
// (A plain `Record<string, string>` param would type every property access
// as `string | undefined` under this project's `noUncheckedIndexedAccess`
// tsconfig option, so the exact keys are spelled out here instead.)
interface FormatStrings {
  formatStandard: string
  formatAdvanced: string
  formatSandbox: string
  formatDraft: string
  simulator: string
}

function getFormatLabel(strings: FormatStrings, rawFormat: string | null): string {
  const FORMAT_LABELS: Record<string, string> = {
    estandar: strings.formatStandard,
    advanced: strings.formatAdvanced,
    libre: strings.formatSandbox,
    draft: strings.formatDraft,
  }
  return (rawFormat && FORMAT_LABELS[rawFormat]) || strings.simulator
}

// Reset the "elapsed time" counter whenever the visitor moves to a different section.
let sectionTimestamp = Math.floor(Date.now() / 1000)
let lastSection: string | null = null

// Reset the "elapsed time" counter whenever a new matchmaking search starts.
let searchTimestamp = Math.floor(Date.now() / 1000)
let isSearching = false

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    homepage: 'general.viewHome',
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
    formatDraft: 'tcgmini.formatDraft',
    searchingMatch: 'tcgmini.searchingMatch',
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

  // Matchmaking search screen (shown while looking for an online opponent).
  // Confirmed live: this stays on the HOME page the whole time (`document.location.pathname`
  // never changes to `/board`), so it has to be handled before the
  // section/path logic below — otherwise it would just read as "browsing
  // the homepage". Sandbox never reaches this: it has no online queue (its
  // button opens the board directly instead of searching).
  //
  // Standard/Advanced use `.pvp-searching-wrap`, but Draft uses a completely
  // different element for the exact same screen: `#dr-online-search` (inside
  // a `#view-draft` panel) — confirmed live, `.pvp-searching-wrap` never
  // appears at all while searching in Draft.
  //
  // `.pvp-searching-wrap` is never removed from the DOM — cancelling the
  // search just hides it again — so its mere presence isn't enough; check
  // `offsetParent` too (null when the element or an ancestor is
  // `display: none`) to tell "hidden" apart from "actually showing".
  // `#dr-online-search` is removed outright on cancel, so it's already null
  // by then — the same check is harmless for it too.
  const searchingEl = document.querySelector<HTMLElement>('.pvp-searching-wrap, #dr-online-search')
  if (searchingEl?.offsetParent) {
    if (!isSearching) {
      searchTimestamp = Math.floor(Date.now() / 1000)
      isSearching = true
    }

    const rawFormat = localStorage.getItem('pocketboard_play_mode_v1')

    presenceData.details = strings.searchingMatch
    presenceData.state = getFormatLabel(strings, rawFormat)
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.searchingMatch
    presenceData.startTimestamp = searchTimestamp

    presence.setActivity(presenceData)
    return
  }
  isSearching = false

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
      // Format: stored in localStorage, confirmed by testing all 4 modes
      // (the 3 already reachable live, plus "draft" confirmed via the
      // matchmaking-search screen).
      const rawFormat = localStorage.getItem('pocketboard_play_mode_v1')
      const formatLabel = getFormatLabel(strings, rawFormat)

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
