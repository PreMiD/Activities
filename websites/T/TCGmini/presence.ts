import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1543259483159920721',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/TCGmini/assets/logo.png',
}

// Only Spanish (/es/) uses its own translated slugs (tablero/cartas/mazos/perfil);
// other locales reuse the English ones.
const LOCALE_PREFIX = /^\/(?:es|ja|it|fr|pt|ko)(?=\/|$)/
const SECTION_ALIASES: Record<string, string> = {
  tablero: 'board',
  cartas: 'cards',
  mazos: 'decks',
}

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

let sectionTimestamp = Math.floor(Date.now() / 1000)
let lastSection: string | null = null

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
      const rawFormat = localStorage.getItem('pocketboard_play_mode_v1')
      const formatLabel = getFormatLabel(strings, rawFormat)

      // `.pvp-fin` is only in the DOM while the end-of-match overlay shows;
      // `.pvp-fin-score` lists the local player's score first.
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

      // presence.ts runs in an isolated JS context, so `_pbScores` must be
      // read via getPageVariable; the local player is always p1.
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
