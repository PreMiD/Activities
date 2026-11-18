const gameNames: Record<string, string> = {
  game_sky_battle: 'Sky Battle',
  game_meltdown: 'Meltdown',
  game_parkour_tag: 'Parkour Tag',
  game_railroad_rush: 'Railroad Rush',
  game_ace_race: 'Ace Race',
  game_sands_of_time: 'Sands of Time',
  game_rocket_spleef: 'Rocket Spleef Rush',
  game_rocket_spleef_rush: 'Rocket Spleef Rush',
  game_grid_runners: 'Grid Runners',
  game_dodge_bolt: 'Dodgebolt',
  game_dodgebolt: 'Dodgebolt',
  game_battle_box: 'Battle Box',
  game_hole_in_the_wall: 'Hole in the Wall',
  game_parkour_warrior: 'Parkour Warrior',
  game_tgttosawaf: 'To Get to the Other Side',
  game_tgttos: 'To Get to the Other Side',
  game_build_mart: 'Build Mart',
  game_survival_games: 'Survival Games',
  game_bingo_but_fast: 'Bingo but Fast',
}

interface LiveStatus {
  label: string
  countdown?: number
}

interface GameSelection {
  selectedIndex?: number
  latestIndex?: number
  latestImage?: HTMLImageElement
}

interface LiveSnapshot {
  event: string
  panelGameNumber?: number
  updatedAt: number
  data: Partial<PresenceData>
}

interface DodgeboltWinnerSnapshot {
  event: string
  winner: string
  imageUrl?: string
  selectedIndex?: number
  latestIndex?: number
  data: Partial<PresenceData>
}

let latestLiveSnapshot: LiveSnapshot | undefined
let dodgeboltWinnerSnapshot: DodgeboltWinnerSnapshot | undefined
const liveSnapshotTtl = 30_000

function cleanText(value?: string | null): string | undefined {
  return value?.replace(/\s+/g, ' ').trim() || undefined
}

function parseCountdown(value?: string | null): number | undefined {
  const parts = value?.split(':').map(part => part.trim())
  if (!parts || (parts.length !== 2 && parts.length !== 3) || parts.some(part => !/^\d+$/.test(part)))
    return undefined
  const values = parts.map(Number)
  const seconds = values.at(-1) ?? 0
  const minutes = values.at(-2) ?? 0
  const hours = values.length === 3 ? values[0] ?? 0 : 0
  if (seconds >= 60 || minutes >= 60)
    return undefined
  return hours * 3600 + minutes * 60 + seconds
}

function getLiveStatus(): LiveStatus | undefined {
  for (const title of document.querySelectorAll<HTMLElement>('.liveStatTitle')) {
    const label = cleanText(title.textContent)
    if (!label)
      continue
    const value = cleanText(title.parentElement?.querySelector('.liveStatData')?.textContent)
    if (label === 'Event paused')
      return { label }
    const countdown = parseCountdown(value)
    if (countdown !== undefined)
      return { label, countdown: countdown || undefined }
  }
}

function getGameInfo(): { number?: string, name?: string, multiplier?: string, round?: string } {
  const info = document.querySelector('.gameInfo .boxHeader')
  const number = cleanText(info?.querySelector('h1')?.textContent)
  const name = cleanText(info?.querySelector('h2')?.textContent)
  const multiplier = cleanText(document.querySelector('.gameInfo .liveStat.multiplier .liveStatData')?.textContent)
    ?.replace(/\s+/g, '')
  const round = cleanText(document.querySelector('.gameInfo .liveStat.rounds .liveStatData')?.textContent)
    ?.replace(/\s*\/\s*/g, '/')
  return { number, name, multiplier, round }
}

function currentGameImage(): HTMLImageElement | null {
  return document.querySelector<HTMLImageElement>('.gameInfo .boxHeader img') ?? selectedGameImage()
}

function selectedGameImage(): HTMLImageElement | null {
  return document.querySelector<HTMLImageElement>('.games .selectedGame img')
}

function getGameSelection(): GameSelection {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.games .game')]
  const indexOf = (button: HTMLButtonElement): number | undefined => {
    const match = button.getAttribute('aria-label')?.match(/^Game (\d+)$/)
    return match ? Number(match[1]) : undefined
  }
  const selected = buttons.find(button => button.classList.contains('selectedGame'))
  const available = buttons
    .filter(button => !button.disabled && !button.classList.contains('hiddenHistoricalGame'))
    .map(button => ({ button, index: indexOf(button) }))
    .filter((entry): entry is { button: HTMLButtonElement, index: number } => entry.index !== undefined)
    .sort((a, b) => b.index - a.index)[0]

  return {
    selectedIndex: selected ? indexOf(selected) : undefined,
    latestIndex: available?.index,
    latestImage: available?.button.querySelector('img') ?? undefined,
  }
}

function gameAsset(image: HTMLImageElement): string | undefined {
  const source = image.currentSrc
    || image.getAttribute('srcset')?.split(',')[0]?.trim().split(/\s+/)[0]
    || image.getAttribute('src')
  if (!source)
    return undefined
  const url = new URL(source, document.location.href)
  const path = new URL(url.searchParams.get('url') || url.href, document.location.href).pathname
  return path.match(/\/(game_[\w-]+)\.[a-z]+$/i)?.[1]
}

function gameImageUrl(image: HTMLImageElement): string | undefined {
  const source = image.currentSrc
    || image.getAttribute('srcset')?.split(',')[0]?.trim().split(/\s+/)[0]
    || image.getAttribute('src')
  return source ? new URL(source, document.location.href).href : undefined
}

function getDodgeboltTeams(): string[] {
  return [...document.querySelectorAll<HTMLElement>('.dodgeboltData h3')]
    .map(team => cleanText(team.textContent))
    .filter((team): team is string => Boolean(team))
}

function getDodgeboltWinner(): { name: string, imageUrl?: string } | undefined {
  const winners = [...document.querySelectorAll<HTMLImageElement>('.winningTeam')]
    .map(image => cleanText(image.getAttribute('alt'))?.match(/^(.+?) has won!$/i)?.[1])
    .filter((team): team is string => Boolean(team))
  if (winners.length !== 1)
    return undefined

  const winnerCode = winners[0]?.toUpperCase()
  const winnerRow = [...document.querySelectorAll<HTMLElement>('.dodgeboltData')]
    .find((row) => {
      const iconAlt = cleanText(row.querySelector('img')?.getAttribute('alt'))
      return iconAlt?.match(/^(.+?)'s icon$/i)?.[1]?.toUpperCase() === winnerCode
    })
  const name = cleanText(winnerRow?.querySelector('h3')?.textContent)
  if (!name || !winnerRow)
    return undefined
  const icon = winnerRow.querySelector('img')
  return { name, imageUrl: icon ? gameImageUrl(icon) : undefined }
}

export function mccLiveSelection(): string {
  // Read event/game state and Dodgebolt matchup names, never leaderboard standings.
  const event = cleanText(document.querySelector('.eventNumber h1')?.textContent)
  const leaderboard = document.querySelector('.leaderboardSelect.activeLeaderboard')
  const image = currentGameImage()
  const status = getLiveStatus()
  const game = getGameInfo()
  const selection = getGameSelection()
  return JSON.stringify([
    event,
    Boolean(document.querySelector('.eventNumber.liveEventNumber')),
    leaderboard?.className,
    image?.getAttribute('srcset') || image?.getAttribute('src'),
    status?.label,
    game.number,
    game.name,
    selection.selectedIndex,
    selection.latestIndex,
    getDodgeboltTeams(),
    getDodgeboltWinner(),
  ])
}

export function isLiveMccView(): boolean {
  const status = getLiveStatus()
  return Boolean(document.querySelector('.eventNumber.liveEventNumber'))
    || status?.label === 'Event begins in'
    || status?.label === 'Event paused'
}

export function getMccLiveData(privacy: boolean): Partial<PresenceData> {
  const generic: Partial<PresenceData> = {
    name: 'Minecraft Championship LIVE',
    details: 'Looking at MCC Live',
  }
  if (privacy)
    return generic

  const status = getLiveStatus()
  const liveEvent = isLiveMccView()
  if (liveEvent) {
    const event = cleanText(document.querySelector('.eventNumber h1')?.textContent)
      ?.replace(/\s+LIVE$/i, '')
    const currentGame = getGameInfo()
    const selection = getGameSelection()
    const panelGameNumber = Number(currentGame.number?.match(/^Game\s+(\d+)/i)?.[1]) || undefined
    const latestPanelGameNumber = selection.latestIndex !== undefined ? selection.latestIndex + 1 : undefined
    const previousLiveSnapshot = latestLiveSnapshot
    const selectedPastGame = selection.selectedIndex !== undefined
      && selection.latestIndex !== undefined
      && selection.selectedIndex < selection.latestIndex
    const panelShowsPastGame = Boolean(panelGameNumber
      && latestPanelGameNumber
      && panelGameNumber < latestPanelGameNumber)
    const snapshotShowsPastGame = Boolean(previousLiveSnapshot
      && previousLiveSnapshot.event === event
      && panelGameNumber
      && previousLiveSnapshot.panelGameNumber
      && panelGameNumber < previousLiveSnapshot.panelGameNumber)
    const viewingPastGame = selectedPastGame || panelShowsPastGame || snapshotShowsPastGame

    if (viewingPastGame) {
      if (previousLiveSnapshot?.data.details === 'Game Winners') {
        latestLiveSnapshot = undefined
        dodgeboltWinnerSnapshot = undefined
        return generic
      }
      if (latestLiveSnapshot && latestLiveSnapshot.event === event && Date.now() - latestLiveSnapshot.updatedAt < liveSnapshotTtl)
        return { ...latestLiveSnapshot.data }
      return generic
    }

    latestLiveSnapshot = undefined
    const liveImage = currentGameImage()
    const imageAsset = liveImage ? gameAsset(liveImage) : undefined
    const liveGameName = currentGame.name
    const liveGameNumber = currentGame.number
    const multiplier = currentGame.multiplier
    const round = currentGame.round
    const dodgeboltTeams = /^dodgebolt$/i.test(liveGameName ?? '') ? getDodgeboltTeams() : []
    const dodgebolt = /^dodgebolt$/i.test(liveGameName ?? '')
    const cachedWinner = dodgeboltWinnerSnapshot
      && dodgeboltWinnerSnapshot.event === event
      && dodgeboltWinnerSnapshot.selectedIndex === selection.selectedIndex
      && dodgeboltWinnerSnapshot.latestIndex === selection.latestIndex
      ? dodgeboltWinnerSnapshot
      : undefined
    const detectedWinner = dodgebolt ? getDodgeboltWinner() : undefined
    const winner = detectedWinner
      ?? (dodgebolt && cachedWinner
        ? { name: cachedWinner.winner, imageUrl: cachedWinner.imageUrl }
        : undefined)
    const dodgeboltWinner = winner?.name
    const dodgeboltMatch = !dodgeboltWinner && dodgeboltTeams.length === 2
      ? `${dodgeboltTeams[0]} vs ${dodgeboltTeams[1]}`
      : undefined
    const phase = dodgeboltWinner
      ? 'Game Winners'
      : dodgebolt
        ? 'The Final Duel'
        : status?.label ?? liveGameName ?? 'MCC Live'
    const state = [
      event,
      liveGameNumber && liveGameName ? `${liveGameNumber} · ${liveGameName}` : liveGameNumber ?? liveGameName,
      dodgeboltWinner,
      dodgeboltMatch,
      multiplier ? `Multiplier ${multiplier}` : undefined,
      round ? `Round ${round}` : undefined,
    ]
      .filter(Boolean)
      .join(' · ')
    const result: Partial<PresenceData> = {
      name: 'Minecraft Championship LIVE',
      details: phase,
      state: state.slice(0, 128),
    }

    if (!viewingPastGame && status?.countdown !== undefined)
      result.endTimestamp = Math.floor(Date.now() / 1000) + status.countdown

    if (liveImage) {
      result.smallImageKey = gameImageUrl(liveImage)
      result.smallImageText = liveGameName ?? imageAsset
    }
    if (dodgeboltWinner) {
      delete result.endTimestamp
      if (winner.imageUrl)
        result.smallImageKey = winner.imageUrl
      result.smallImageText = dodgeboltWinner
      dodgeboltWinnerSnapshot = {
        event: event ?? '',
        winner: dodgeboltWinner,
        imageUrl: winner.imageUrl,
        selectedIndex: selection.selectedIndex,
        latestIndex: selection.latestIndex,
        data: { ...result },
      }
    }
    latestLiveSnapshot = { event: event ?? '', panelGameNumber, updatedAt: Date.now(), data: { ...result } }
    return result
  }

  const event = document.querySelector('.eventNumber h1')?.textContent?.replace(/\s+/g, ' ').trim().replace(/\s+LIVE$/i, '')
  const leaderboard = document.querySelector('.leaderboardSelect.activeLeaderboard')
  const selection = getGameSelection()
  if (dodgeboltWinnerSnapshot
    && event === dodgeboltWinnerSnapshot.event
    && selection.selectedIndex === dodgeboltWinnerSnapshot.selectedIndex
    && selection.latestIndex === dodgeboltWinnerSnapshot.latestIndex
    && /^dodgebolt$/i.test(getGameInfo().name ?? '')) {
    return { ...dodgeboltWinnerSnapshot.data }
  }
  else if (leaderboard) {
    dodgeboltWinnerSnapshot = undefined
    latestLiveSnapshot = undefined
  }
  else {
    dodgeboltWinnerSnapshot = undefined
    latestLiveSnapshot = undefined
  }

  const mode = leaderboard?.classList.contains('gameSelector')
    ? 'Game leaderboard'
    : leaderboard?.classList.contains('eventSelector')
      ? 'Event leaderboard'
      : undefined
  if (!event || !mode)
    return generic

  const result: Partial<PresenceData> = {
    name: 'Minecraft Championship LIVE',
    details: 'Looking at past MCC events',
    state: `${event.slice(0, 128 - mode.length - 3)} · ${mode}`,
  }
  const image = selectedGameImage()
  const asset = image ? gameAsset(image) : undefined
  const game = asset ? gameNames[asset] : undefined
  if (image && game) {
    result.smallImageKey = image
    result.smallImageText = game
  }
  return result
}
