export const ReafyGames: Record<string, string> = {
  ace_race: 'Ace Race',
  battle_box: 'Battle Box',
  bingo_but_fast: 'Bingo but Fast',
  build_mart: 'Build Mart',
  foot_race: 'Foot Race',
  grid_runners: 'Grid Runners',
  hole_in_the_wall: 'Hole in the Wall',
  meltdown: 'Meltdown',
  parkour_tag: 'Parkour Tag',
  parkour_warrior: 'Parkour Warrior',
  parkour_warrior_classic: 'Parkour Warrior Classic',
  railroad_rush: 'Railroad Rush',
  rocket_spleef: 'Rocket Spleef',
  rocket_spleef_rush: 'Rocket Spleef Rush',
  sands_of_time: 'Sands of Time',
  sky_battle: 'Sky Battle',
  skyblockle: 'Skyblockle',
  survival_games: 'Survival Games',
  tgttosawaf: 'TGTTOSAWAF',
}

// The fixed logo is a hosted 512px asset; selected-game icons keep their website URLs.
export const ReafyLogo: string | Blob = 'https://cdn.rcd.gg/PreMiD/websites/M/MCC%20%2B%20Island/assets/19.png'
export const ReafyGameIcons: Record<string, string | Blob> = Object.fromEntries(
  Object.keys(ReafyGames).map(game => [game, `https://reafystats.com/game-icons/${game}.webp`]),
)
