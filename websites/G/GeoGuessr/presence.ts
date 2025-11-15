import { divisionIcons, gameModeIcons, logo, mapAvatar, mapAvatarOfficial, movementIcons } from './assets.js'

const presence = new Presence({
  clientId: '1378447904682807376',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

interface CacheEntry {
  data: any
  timestamp: number
}
const fetchCache: { [url: string]: CacheEntry } = {}
async function fetchUrl(url: string, useCache: boolean = false, cacheTime: number = 60000): Promise<any> {
  if (useCache && fetchCache[url]) {
    const cacheEntry = fetchCache[url]
    const currentTime = Date.now()

    if (currentTime - cacheEntry.timestamp < cacheTime) {
      return Promise.resolve(cacheEntry.data)
    }
    else {
      delete fetchCache[url]
    }
  }

  try {
    const response = await fetch(url, { credentials: 'include' })

    if (!response.ok) {
      throw new Error(`HTTP error; status: ${response.status}`)
    }

    const data = await response.json()

    if (useCache) {
      fetchCache[url] = {
        data,
        timestamp: Date.now(),
      }
    }

    return data
  }
  catch (error) {
    console.error('Fetch error:', error)
    return null
  }
}

const presenceData: PresenceData = {
  largeImageKey: logo,
  startTimestamp: browsingTimestamp,
}

const alreadyFetchedList: { [key: string]: any } = {}
const cooldowns: { [key: string]: any } = {}

let strings: any
let infoFromFirstPath: { [key: string]: any }

let spookyGuessrDay: any
let health: any
let spookyGuessrMode: any

const spookyGuessrMaps: any = {
  Normal: '66014417ff2366aa9a7504df',
  Hard: '62a44b22040f04bd36e8a914',
  Nightmare: '68c7e1f6c44ba050949032c8',
}

async function updateStrings() {
  strings = await presence.getStrings({
    brCountries: 'geoguessr.brCountries',
    brDistance: 'geoguessr.brDistance',
    brRemaining: 'geoguessr.brRemaining',
    bullseye: 'geoguessr.bullseye',
    challenge: 'geoguessr.challenge',
    cityStreaks: 'geoguessr.cityStreaks',
    classicScore: 'geoguessr.classicScore',
    classicStreakCount: 'geoguessr.classicStreakCount',
    division: 'geoguessr.division',
    duels: 'geoguessr.duels',
    inMenu: 'geoguessr.inMenu',
    inParty: 'geoguessr.inParty',
    inRanked: 'geoguessr.inRanked',
    inUnranked: 'geoguessr.inUnranked',
    unranked: 'geoguessr.unranked',
    liveChallenge: 'geoguessr.liveChallenge',
    maps: 'geoguessr.maps',
    matchmaking: 'geoguessr.matchmaking',
    movementMoving: 'geoguessr.movementMoving',
    movementNmpz: 'geoguessr.movementNmpz',
    movementNoMove: 'geoguessr.movementNoMove',
    multiplayer: 'geoguessr.multiplayer',
    party: 'geoguessr.party',
    partyPlayerCount: 'geoguessr.partyPlayerCount',
    privacy: 'general.privacy',
    quiz: 'geoguessr.quiz',
    store: 'general.store',
    streaks: 'geoguessr.streaks',
    support: 'general.support',
    teamDuels: 'geoguessr.teamDuels',
    terms: 'general.terms',
    viewAProfile: 'general.viewAProfile',
    viewActivities: 'geoguessr.viewActivities',
    viewCommunity: 'geoguessr.viewCommunity',
    viewHelppage: 'general.viewHelppage',
    viewMap: 'geoguessr.viewMap',
    spookyGuessr: 'geoguessr.spookyGuessr',
    spookyGuessrDay: 'geoguessr.spookyGuessrDay',
    health: 'geoguessr.health',
    rating: 'geoguessr.rating',
  })
  infoFromFirstPath = {
    'shop': {
      details: strings.store,
    },
    'merch': {
      details: strings.store,
    },
    'support': {
      details: strings.support,
    },
    'user': {
      details: strings.viewAProfile,
    },
    'community-rules': {
      details: strings.viewHelppage,
    },
    'activities': {
      details: strings.viewActivity,
    },
    'community': {
      details: strings.viewCommunity,
    },
    'terms': {
      details: strings.terms,
    },
    'privacy': {
      details: strings.privacy,
    },
    'maps': {
      details: strings.maps,
    },
    'quiz': {
      largeImageKey: gameModeIcons.quiz,
      details: strings.quiz,
    },
    'campaign': {
      largeImageKey: gameModeIcons.campaign,
      details: strings.campaign,
    },
    'singleplayer': {
      largeImageKey: gameModeIcons.campaign,
      details: strings.campaign,
    },
    'streaks': {
      largeImageKey: gameModeIcons.streaks,
      details: strings.streaks,
    },
    'community-streaks': {
      largeImageKey: gameModeIcons.streaks,
      details: strings.streaks,
    },
    'competitive-streak': {
      largeImageKey: gameModeIcons.city_streaks,
      details: strings.cityStreaks,
    },
  }
}

const isFetchingSelfUserId = false
let selfUserIdCache: string
async function getSelfUserId() {
  if (selfUserIdCache) {
    return selfUserIdCache
  }
  if (isFetchingSelfUserId) {
    return null
  }
  const profileInfo = await fetchUrl('https://www.geoguessr.com/api/v3/profiles', true)
  selfUserIdCache = profileInfo.user.id
  return selfUserIdCache
}

// These are the supported GeoGuessr languages
// We're removing it from the URL to make playing with
// other languages still display RP
const geoGuessrLanguages = [
  'en',
  'de',
  'es',
  'fr',
  'it',
  'nl',
  'pt',
  'sv',
  'tr',
  'ja',
  'pl',
]

let pathCache: any = []
let urlCache: any

let soloDivision: any
let soloRatingString: any

let isUnranked: boolean = false
let currentGameMode: string = ''

presence.on('UpdateData', async () => {
  const currentRawURL = document.location.href
  const currentURL = new URL(currentRawURL)
  const currentPath = currentURL.pathname
    .replace(/^\/|\/$|\/index\.html$|.html$/g, '')
    .split('/')

  // If the player has the GeoGuessr website as a different language,
  // remove the language from the URL paths
  if (currentPath[0] && geoGuessrLanguages.includes(currentPath[0])) {
    currentPath.splice(0, 1)
  }
  const lastPath = pathCache
  const isNewURL = currentRawURL !== urlCache
  pathCache = currentPath
  urlCache = currentRawURL

  if (!strings) {
    await updateStrings()
  }

  function isConnected() {
    return urlCache === currentRawURL
  }

  function findGameMode() {
    if (cooldowns.findGameMode) {
      return
    }
    cooldowns.findGameMode = true
    setTimeout(() => {
      cooldowns.findGameMode = false
    }, 2500)
    // Find it in Pause menu
    const pauseMenuInfo = document.querySelectorAll('[class^="duels-settings_gameInfoContent__"]')
    if (pauseMenuInfo[0]) {
      const pauseMenuText = pauseMenuInfo[0].textContent ?? ''
      const gameModeName = pauseMenuText.split(': ')[2] ?? currentGameMode
      currentGameMode = gameModeName
    }
    // Find it in matchmaking screen
    const matchmakingModeTitle = document.querySelectorAll('[class^="game-mode-brand_title__"]')
    if (matchmakingModeTitle[0]) {
      currentGameMode = matchmakingModeTitle[0].textContent ?? currentGameMode
    }
    // Find it in spectator screen
    const gameModeTitleSpectator = document.querySelectorAll('[class^="post-guess-player-spectator_sidePanelSubTitle__"]')
    if (gameModeTitleSpectator[0]) {
      currentGameMode = gameModeTitleSpectator[0].textContent ?? currentGameMode
    }

    return currentGameMode
  }

  async function setHealthUI(prefix: string, autoSetGamemode: boolean) {
    findGameMode()
    if (cooldowns.health) {
      return
    }
    cooldowns.health = true
    setTimeout(() => {
      cooldowns.health = false
    }, 5000)
    const healthUI = document.querySelectorAll('[class^="health-bar-2_barLabel__"]')
    let scoreText: any
    if (healthUI.length >= 2) {
      const firstLabel = healthUI[0] as HTMLElement
      const secondLabel = healthUI[1] as HTMLElement
      if (firstLabel && secondLabel && firstLabel.textContent && secondLabel.textContent) {
        scoreText = ` | ${firstLabel.textContent} - ${secondLabel.textContent}`
      }
    }
    if (autoSetGamemode && currentGameMode !== '') {
      prefix = `${currentGameMode} ${prefix}`
    }
    if (!isConnected()) {
      return
    }
    presenceData.details = `${prefix}${scoreText || ''}`
  }
  async function getMapIconFromInfo(mapInfo: any) {
    if (!isConnected() || !mapInfo) {
      return
    }
    const mapId = mapInfo.slug || mapInfo.id
    if (mapId && mapInfo.images && mapInfo.images.backgroundLarge && mapAvatarOfficial[mapId]) {
      return {
        url: mapAvatarOfficial[mapId],
        name: mapInfo.name,
      }
    }
    else {
      return {
        url: mapAvatar[`${mapInfo.avatar.background}-${mapInfo.avatar.landscape}-${mapInfo.avatar.decoration}-${mapInfo.avatar.ground}`] || logo,
        name: mapInfo.name,
      }
    }
  }

  async function getMapIconFromId(mapId: string) {
    if (!mapId) {
      // Invalid maps; return
      return
    }
    else if (mapId === 'country-streak') {
      return {
        url: mapAvatarOfficial.world,
        name: 'Country Streak',
      }
    }
    else if (mapId === 'us-state-streak') {
      return {
        url: mapAvatarOfficial.usa,
        name: 'US State Streak',
      }
    }
    const mapInfo = await fetchUrl(`https://www.geoguessr.com/api/maps/${mapId}`, true)
    return await getMapIconFromInfo(mapInfo)
  }

  async function setDivisionInfo(divisionName: any = null, rating: any = null) {
    if (isUnranked) {
      presenceData.state = strings.inUnranked
      presenceData.smallImageKey = divisionIcons.Unranked
      presenceData.smallImageText = strings.unranked
      return
    }
    if (!divisionName) {
      const selfUserId = await getSelfUserId()
      if (!selfUserId) {
        return
      }
      const rankedInfo = await fetchUrl(`https://www.geoguessr.com/api/v4/ranked-system/progress/${selfUserId}`, true)
      if (!rankedInfo) {
        return
      }
      divisionName = rankedInfo.divisionName
      soloDivision = divisionName
      if (rankedInfo.rating) {
        soloRatingString = strings.rating.replace('{0}', rankedInfo.rating)
        rating = soloRatingString
      }
    }
    if (!isConnected()) {
      return
    }
    presenceData.state = strings.division.replace('{0}', divisionName)
    const divisionIcon = divisionIcons[divisionName]
    if (divisionIcon) {
      presenceData.smallImageKey = divisionIcon
      if (rating) {
        presenceData.smallImageText = rating
      }
      else {
        presenceData.smallImageText = divisionName
      }
    }
    else {
      presenceData.smallImageKey = divisionIcons.Unranked
      presenceData.smallImageText = divisionName
    }
  }

  if (currentPath[0] === 'game') {
    if (!cooldowns[currentPath[0]]) {
      cooldowns[currentPath[0]] = true
      setTimeout(() => {
        cooldowns[currentPath[0] as string] = false
      }, 5000)
      // Handle classic games
      const gameId = currentPath[1]
      const gameInfo = await fetchUrl(`https://www.geoguessr.com/api/v3/games/${gameId}`, true)
      if (!isConnected()) {
        return
      }
      const mapName = gameInfo.mapName
      const mapId = gameInfo.map
      presenceData.largeImageText = mapName
      presenceData.buttons = [
        {
          label: strings.viewMap,
          url: `https://www.geoguessr.com/maps/${mapId}`,
        },
      ]
      const mapIconInfo = await getMapIconFromId(mapId)
      if (!isConnected()) {
        return
      }
      if (mapIconInfo && mapIconInfo.url) {
        presenceData.largeImageKey = mapIconInfo.url
      }
      else {
        presenceData.largeImageKey = logo
      }
      let gameMode = strings.movementMoving
      presenceData.smallImageKey = movementIcons.moving
      if (gameInfo.forbidMoving) {
        gameMode = strings.movementNoMove
        presenceData.smallImageKey = movementIcons.noMove
        if (gameInfo.forbidZooming && gameInfo.forbidRotating) {
          gameMode = strings.movementNmpz
          presenceData.smallImageKey = movementIcons.nmpz
        }
      }
      presenceData.smallImageText = gameMode

      if (gameInfo.mode === 'streak') {
        const statsRoundContainer = document.querySelector('[class*="status_section__"][data-qa="round-number"]')
        const streaksValue = statsRoundContainer && statsRoundContainer.querySelector('[class*="status_streaksValue__"]')
        presenceData.smallImageKey = gameModeIcons.streaks
        presenceData.smallImageText = strings.streaks
        presenceData.details = `${gameMode} | ${strings.classicStreakCount
          .replace('{0}', (streaksValue && streaksValue.textContent) || gameInfo.player.totalStreak || 0)
        }`
        presenceData.state = mapName
      }
      else {
        const statsScoreContainer = document.querySelector('[class*="status_section__"][data-qa="score"]')
        const statsScoreValue = statsScoreContainer && statsScoreContainer.querySelector('[class*="status_value__"]')

        const statsRoundContainer = document.querySelector('[class*="status_section__"][data-qa="round-number"]')
        const statsRoundValue = statsRoundContainer && statsRoundContainer.querySelector('[class*="status_value__"]')
        const statsRoundValues = statsRoundValue && statsRoundValue.textContent && statsRoundValue.textContent.split(' / ').map(Number)
        if (gameInfo.type === 'challenge') {
          presenceData.state = mapName
          presenceData.smallImageKey = gameModeIcons.challenges
          presenceData.smallImageText = strings.challenge
          presenceData.details = `${gameMode} ${strings.challenge} | ${strings.classicScore
            .replace('{0}', (statsScoreValue && statsScoreValue.textContent) || gameInfo.player.totalScore.amount)
            .replace('{1}', (statsRoundValues && statsRoundValues[0]) || gameInfo.round)
            .replace('{2}', (statsRoundValues && statsRoundValues[1]) || gameInfo.roundCount)
          }`
        }
        else {
          presenceData.details = `${gameMode} | ${strings.classicScore
            .replace('{0}', (statsScoreValue && statsScoreValue.textContent) || gameInfo.player.totalScore.amount)
            .replace('{1}', (statsRoundValues && statsRoundValues[0]) || gameInfo.round)
            .replace('{2}', (statsRoundValues && statsRoundValues[1]) || gameInfo.roundCount)
          }`
          presenceData.state = mapName
        }
      }
    }
  }

  else if (currentPath[0] === 'challenge') {
    if (!alreadyFetchedList.challenge) {
      alreadyFetchedList.challenge = true
      const gameId = currentPath[1]
      const gameInfo = await fetchUrl(`https://www.geoguessr.com/api/v3/challenges/${gameId}`, true)
      if (!isConnected()) {
        return
      }
      const mapName = gameInfo.map.name
      const mapId = gameInfo.map.id
      presenceData.largeImageText = mapName
      presenceData.buttons = [
        {
          label: strings.viewMap,
          url: `https://www.geoguessr.com/maps/${mapId}`,
        },
      ]
      const mapIconInfo = await getMapIconFromInfo(gameInfo.map)
      if (!isConnected()) {
        return
      }
      if (mapIconInfo && mapIconInfo.url) {
        presenceData.largeImageKey = mapIconInfo.url
      }
      else {
        presenceData.largeImageKey = logo
      }
      let gameMode = strings.movementMoving
      if (gameInfo.forbidMoving) {
        gameMode = strings.movementNoMove
        if (gameInfo.forbidZooming && gameInfo.forbidRotating) {
          gameMode = strings.movementNmpz
        }
      }
      presenceData.details = `${gameMode} ${strings.challenge}`
      presenceData.smallImageKey = gameModeIcons.challenges
      presenceData.smallImageText = strings.challenge
      presenceData.state = mapName
    }
  }
  else if (currentPath[0] === 'duels' || currentPath[0] === 'team-duels') {
    // duels (Legacy UI support)
    if (currentPath[0] && !cooldowns[currentPath[0]]) {
      cooldowns[currentPath[0]] = true
      setTimeout(() => {
        cooldowns[currentPath[0] as string] = false
      }, 5000)
      const gameId = currentPath[1]
      const gameInfo = await fetchUrl(`https://game-server.geoguessr.com/api/duels/${gameId}`, true)
      if (!isConnected()) {
        return
      }
      const isRanked = gameInfo.options.competitiveGameMode !== 'None'
      const isTeams = gameInfo.teams[0].players.length > 1 || gameInfo.teams[1].players.length > 1
      const gameType = (isTeams && strings.teamDuels) || strings.duels

      let gameMode = strings.movementMoving
      if (gameInfo.movementOptions.forbidMoving) {
        gameMode = strings.movementNoMove
        if (gameInfo.movementOptions.forbidRotating && gameInfo.movementOptions.forbidZooming) {
          gameMode = strings.movementNmpz
        }
      }
      setHealthUI(`${gameMode} ${gameType}`, false)
      delete presenceData.buttons

      if (isRanked) {
        presenceData.largeImageKey = (isTeams && gameModeIcons.team_duels) || gameModeIcons.solo_duels
        presenceData.state = strings.inRanked
        delete presenceData.smallImageKey
        if (!isTeams) {
          setDivisionInfo(soloDivision, soloRatingString)
        }
      }
      else if (gameInfo.options.gameContext.type === 'PartyV2') {
        presenceData.smallImageKey = gameModeIcons.party
        presenceData.smallImageText = strings.party
        presenceData.largeImageKey = (isTeams && gameModeIcons.team_duels) || gameModeIcons.solo_duels
        presenceData.state = strings.inParty
      }
      else {
        presenceData.largeImageKey = (isTeams && gameModeIcons.team_duels) || gameModeIcons.solo_duels
        presenceData.state = strings.inUnranked
        presenceData.smallImageKey = divisionIcons.Unranked
        presenceData.smallImageText = strings.unranked
      }
    }
  }
  else if (currentPath[0] && currentPath[0] === 'matchmaking') {
    const gameModeTextList = document.querySelectorAll('[class*="game-mode-brand_subTitle___"]')
    if (!alreadyFetchedList[currentPath[0]] && gameModeTextList[0]) {
      const isTeams = gameModeTextList[0] && gameModeTextList[0].textContent
        && gameModeTextList[0].textContent.startsWith('Team Duels')
      const gameType = (isTeams && strings.teamDuels) || strings.duels
      alreadyFetchedList[currentPath[0]] = true
      presenceData.details = gameType
      presenceData.largeImageKey = (isTeams && gameModeIcons.team_duels) || gameModeIcons.solo_duels
      presenceData.state = strings.inRanked
      delete presenceData.smallImageKey
      if (!isTeams) {
        setDivisionInfo(soloDivision, soloRatingString)
      }
    }
  }
  else if (currentPath[0] === 'halloween') {
    const spookyGuessrModeElement = document.querySelectorAll('[class*="difficulty-selector_isSelected__"]')
    if (spookyGuessrModeElement[0]) {
      spookyGuessrMode = spookyGuessrModeElement[0].textContent
    }
    presenceData.largeImageKey = gameModeIcons.halloween
    if (spookyGuessrMode && currentPath[1] === 'game') {
      presenceData.details = `${strings.spookyGuessr} (${spookyGuessrMode})`
    }
    else {
      presenceData.details = strings.spookyGuessr
    }

    if (currentPath[1] === 'game') {
      const isDay1 = document.querySelectorAll('[class^="halloween-game-starting_dayOne__"]')
      const healthElement = document.querySelectorAll('[id^="halloween-health-bar-label"]')
      const roundNumberElement = document.querySelectorAll('[class^="next-day-countdown_currentRoundNumber__"]')
      if (healthElement[0]) {
        health = healthElement[0].textContent
      }
      if (roundNumberElement[0]) {
        spookyGuessrDay = roundNumberElement[0].textContent
      }
      else if (isDay1) {
        spookyGuessrDay = '1'
      }

      if (!cooldowns[currentPath[0]]) {
        cooldowns[currentPath[0]] = true
        setTimeout(() => {
          cooldowns[currentPath[0] as string] = false
        }, 5000)
        if (health) {
          if (spookyGuessrDay) {
            presenceData.state = `${strings.spookyGuessrDay.replace('{0}', spookyGuessrDay)} | ${strings.health.replace('{0}', health)}`
          }
          else {
            presenceData.state = strings.health.replace('{0}', health)
          }
        }
        else {
          delete presenceData.state
        }

        const spookyGuessrMapId = spookyGuessrMaps[spookyGuessrMode ?? 'Custom']
        if (spookyGuessrMapId) {
          const mapIconInfo = await getMapIconFromId(spookyGuessrMapId)
          if (mapIconInfo && mapIconInfo.url) {
            presenceData.smallImageKey = mapIconInfo.url
            presenceData.smallImageText = `${mapIconInfo.name} (${spookyGuessrMode})`
          }
          else {
            delete presenceData.smallImageKey
          }
        }
        else {
          delete presenceData.smallImageKey
        }
      }
    }
    else {
      spookyGuessrDay = null
      health = null
      delete presenceData.state
      delete presenceData.smallImageKey
    }
  }
  else if (currentPath[0] === 'multiplayer') {
    if (!currentPath[1]) {
      // Duels (new HUD)
      setHealthUI(strings.duels, true)
      presenceData.largeImageKey = gameModeIcons.solo_duels
      const rankText = document.querySelectorAll('[class^="division-header_title__"]')
      const unrankedHeader = document.querySelectorAll('[class^="division-header_unrankedRoot__"]')
      if (unrankedHeader[0]) {
        const unrankedHeaderShowing = document.querySelectorAll('[class*="division-header_reveal__"]')
        isUnranked = (unrankedHeaderShowing[0] && true) || false
      }
      if (rankText[0]) {
        const divisionString = rankText[0].textContent
        const ratingText = document.querySelectorAll('[class^="division-header_rating__"]')
        let ratingString: any
        if (ratingText[0]) {
          ratingString = ratingText[0].textContent
        }
        setDivisionInfo(divisionString, ratingString)
      }
      else if (lastPath[0] !== 'multiplayer' || lastPath[1]) {
        delete presenceData.smallImageKey
        presenceData.state = strings.inRanked
        setDivisionInfo(soloDivision, soloRatingString)
      }
    }
    else if (currentPath[1] === 'teams') {
      // Duels (new HUD, teams)
      isUnranked = false
      setHealthUI(strings.teamDuels, true)
      presenceData.largeImageKey = gameModeIcons.team_duels
      if (isNewURL) {
        delete presenceData.smallImageKey
        presenceData.state = strings.inRanked
      }
      const rankText = document.querySelectorAll('[class^="division-header_title__"]')
      if (rankText[0]) {
        const divisionString = rankText[0].textContent
        const ratingText = document.querySelectorAll('[class^="division-header_rating__"]')
        let ratingString: any
        if (ratingText[0]) {
          ratingString = ratingText[0].textContent
        }
        setDivisionInfo(divisionString, ratingString)
      }
    }
    else if (currentPath[1] === 'battle-royale-countries') {
      presenceData.details = strings.brCountries
      presenceData.largeImageKey = gameModeIcons.br_countries
      delete presenceData.state
      delete presenceData.smallImageKey
    }
    else if (currentPath[1] === 'battle-royale-distance') {
      presenceData.details = strings.brDistance
      presenceData.largeImageKey = gameModeIcons.br_distance
      delete presenceData.state
      delete presenceData.smallImageKey
    }
    else if (currentPath[1] === 'unranked-teams') {
      // Duels (matchmaking)
      presenceData.details = strings.teamDuels
      presenceData.largeImageKey = gameModeIcons.team_duels
      presenceData.state = strings.inUnranked
      presenceData.smallImageKey = divisionIcons.Unranked
      presenceData.smallImageText = strings.unranked
    }
    else {
      presenceData.details = strings.multiplayer
      presenceData.largeImageKey = logo
      delete presenceData.state
      delete presenceData.smallImageKey
    }
  }
  else if (currentPath[0] === 'party') {
    if (!cooldowns[currentPath[0]]) {
      cooldowns[currentPath[0]] = true
      setTimeout(() => {
        cooldowns[currentPath[0] as string] = false
      }, 10000)
      const playerCount = document.querySelectorAll('[data-qa=\'party-member-card\']').length
      presenceData.details = strings.inParty
      presenceData.state = playerCount > 0 && strings.partyPlayerCount.replace('{0}', playerCount)
      delete presenceData.smallImageKey
      presenceData.largeImageKey = gameModeIcons.party

      const partyData = await fetchUrl('https://www.geoguessr.com/api/v4/parties/v2', true, 5)
      if (partyData && partyData.isCommunity) {
        // Public party; show join link
        presenceData.buttons = [
          {
            label: strings.partyJoin,
            url: `https://www.geoguessr.com/join/${partyData.joinCode.code}?s=Url`,
          },
        ]
      }
      else {
        delete presenceData.buttons
      }
    }
  }
  else if (currentPath[0] === 'live-challenge') {
    if (!alreadyFetchedList['live-challenge']) {
      presenceData.details = strings.liveChallenge
      presenceData.largeImageKey = gameModeIcons.live_challenge
      delete presenceData.smallImageKey
      alreadyFetchedList['live-challenge'] = true
      const gameId = currentPath[1]
      const gameInfo = await fetchUrl(`https://game-server.geoguessr.com/api/live-challenge/${gameId}`, true, 1)
      const mapId = gameInfo.options.mapSlug
      const mapIconInfo = await getMapIconFromId(mapId)
      if (!isConnected()) {
        return
      }
      if (mapIconInfo && mapIconInfo.url) {
        presenceData.smallImageText = mapIconInfo.name
        presenceData.state = mapIconInfo.name
        presenceData.smallImageKey = mapIconInfo.url
      }
      else {
        delete presenceData.state
        delete presenceData.smallImageKey
        delete presenceData.smallImageText
        delete presenceData.buttons
      }
    }
  }
  else if (currentPath[0] === 'bullseye') {
    if (!alreadyFetchedList.bullseye) {
      presenceData.details = strings.bullseye
      presenceData.largeImageKey = gameModeIcons.bullseye
      delete presenceData.smallImageKey
      alreadyFetchedList.bullseye = true
      const gameId = currentPath[1]
      const gameInfo = await fetchUrl(`https://game-server.geoguessr.com/api/bullseye/${gameId}`, true, 1)
      const mapId = gameInfo.options.mapSlug

      const mapIconInfo = await getMapIconFromId(mapId)
      if (!isConnected()) {
        return
      }
      if (mapIconInfo && mapIconInfo.url) {
        presenceData.smallImageText = mapIconInfo.name
        presenceData.state = mapIconInfo.name
        presenceData.smallImageKey = mapIconInfo.url
      }
      else {
        delete presenceData.state
        delete presenceData.smallImageKey
        delete presenceData.smallImageText
      }
    }
  }
  else if (currentPath[0] === 'battle-royale' && currentPath[1]) {
    delete presenceData.smallImageKey
    // update every 30s
    if (!cooldowns[currentPath[0]]) {
      cooldowns[currentPath[0]] = true
      setTimeout(() => {
        cooldowns[currentPath[0] as string] = false
      }, 30000)
      const gameId = currentPath[1]
      const gameInfo = await fetchUrl(`https://game-server.geoguessr.com/api/battle-royale/${gameId}`, true, 25)
      if (!isConnected()) {
        return
      }
      if (gameInfo.message) {
        presenceData.state = strings.matchmaking
      }
      else {
        let alivePlayers = 0
        const isDistanceGame = gameInfo.isDistanceGame
        for (const playerInfo of gameInfo.players) {
          if (playerInfo.playerState !== 'Playing') {
            continue
          }
          alivePlayers += 1
        }
        presenceData.largeImageKey = (isDistanceGame && gameModeIcons.br_distance) || gameModeIcons.br_countries
        presenceData.details = (isDistanceGame && strings.brDistance) || strings.brCountries
        presenceData.state = strings.brRemaining.replace('{0}', alivePlayers)
      }
    }
  }
  else {
    presenceData.largeImageKey = logo
    presenceData.details = strings.inMenu
    delete presenceData.smallImageKey
    delete presenceData.state
    delete presenceData.buttons
    // If there's info from the infoFromFirstPath table,
    // use that
    const info = infoFromFirstPath[currentPath[0] || '']
    if (info) {
      for (const key in info) {
        const value = info[key]
        presenceData[key as keyof NonMediaPresenceData] = value
      }
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else { presence.clearActivity() }
})
