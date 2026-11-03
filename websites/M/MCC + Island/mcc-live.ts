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

function selectedGameImage(): HTMLImageElement | null {
  return document.querySelector<HTMLImageElement>('.games .selectedGame img')
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

export function mccLiveSelection(): string {
  // Only UI selection controls are inspected; standings and scores are never read.
  const event = document.querySelector('.eventNumber h1')?.textContent?.trim()
  const leaderboard = document.querySelector('.leaderboardSelect.activeLeaderboard')
  const image = selectedGameImage()
  return JSON.stringify([
    event,
    leaderboard?.className,
    image?.getAttribute('srcset') || image?.getAttribute('src'),
    Boolean(document.querySelector('.eventNumber.liveEventNumber')),
  ])
}

export function getMccLiveData(privacy: boolean): Partial<PresenceData> {
  const generic: Partial<PresenceData> = {
    name: 'Minecraft Championship LIVE',
    details: 'Looking at MCC Live',
  }
  if (privacy || document.querySelector('.eventNumber.liveEventNumber'))
    return generic

  const event = document.querySelector('.eventNumber h1')?.textContent?.replace(/\s+/g, ' ').trim()
  const leaderboard = document.querySelector('.leaderboardSelect.activeLeaderboard')
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
    result.smallImageText = `Selected game: ${game}`
  }
  return result
}
