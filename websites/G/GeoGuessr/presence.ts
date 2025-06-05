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

async function updateStrings() {
  strings = await presence.getStrings({
    brCountries: 'geoguessr.brCountries',
    brDistance: 'geoguessr.brDistance',
    brRemaining: 'geoguessr.brRemaining',
    bullseye: 'geoguessr.bullseye',
    classicScore: 'geoguessr.classicScore',
    classicStreakCount: 'geoguessr.classicStreakCount',
    division: 'geoguessr.division',
    duels: 'geoguessr.duels',
    inMenu: 'geoguessr.inMenu',
    inParty: 'geoguessr.inParty',
    inRanked: 'geoguessr.inRanked',
    inUnranked: 'geoguessr.inUnranked',
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
    viewMap: 'geoguessr.viewMap',
    viewAProfile: 'general.viewAProfile',
    viewActivities: 'geoguessr.viewActivities',
    viewCommunity: 'geoguessr.viewCommunity',
    viewHelppage: 'general.viewHelppage',
    cityStreaks: 'geoguessr.cityStreaks',
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
    'competitive-streaks': {
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

  async function setHealthUI(prefix: string) {
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
    if (!isConnected()) {
      return
    }
    presenceData.details = `${prefix}${scoreText || ''}`
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
    if (!isConnected() || !mapInfo) {
      return
    }
    if (mapInfo.images.backgroundLarge && mapAvatarOfficial[mapId]) {
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

  async function setDivisionInfo(divisionName: any = null) {
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
    }
    if (!isConnected()) {
      return
    }
    presenceData.state = strings.division.replace('{0}', divisionName)
    const divisionIcon = divisionIcons[divisionName]
    if (divisionIcon) {
      presenceData.smallImageKey = divisionIcon
      presenceData.smallImageText = divisionName
    }
  }

  if (currentPath[0] === 'game') {
    // Handle classic games
    const resultElements = document.querySelectorAll('[class^="result-layout_root__"]')
    const resultsExist = resultElements.length > 0
    if (isNewURL || (resultsExist && !alreadyFetchedList.game)) {
      alreadyFetchedList.game = true
      const gameId = currentPath[1]
      const gameInfo = await fetchUrl(`https://www.geoguessr.com/api/v3/games/${gameId}`, true, 1)
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
        presenceData.smallImageKey = gameModeIcons.streaks
        presenceData.smallImageText = strings.streaks
        presenceData.details = `${gameMode} | ${
          strings.classicStreakCount
            .replace('{0}', gameInfo.player.totalStreak || 0)
        }`
        presenceData.state = mapName
      }
      else {
        presenceData.details = `${gameMode} | ${
          strings.classicScore
            .replace('{0}', gameInfo.player.totalScore.amount)
            .replace('{1}', gameInfo.round)
            .replace('{2}', gameInfo.roundCount)
        }`
        presenceData.state = mapName
      }
    }
    else if (alreadyFetchedList.game && !resultsExist) {
      alreadyFetchedList.game = false
    }
  }
  else if (currentPath[0] === 'duels' || currentPath[0] === 'team-duels') {
    // duels (Legacy UI support)
    if (!currentPath[0] && !cooldowns[currentPath[0]]) {
      cooldowns[currentPath[0]] = true
      setTimeout(() => {
        cooldowns[currentPath[0] as string] = false
      }, 5000)
      const gameId = currentPath[1]
      const gameInfo = await fetchUrl(`https://game-server.geoguessr.com/api/duels/${gameId}`, true)
      if (!isConnected()) {
        return
      }
      let gameMode = strings.movementMoving
      const isRanked = gameInfo.options.competitiveGameMode !== 'None'
      const isTeams = gameInfo.teams[0].players.length > 1 || gameInfo.teams[1].players.length > 1
      const gameType = (isTeams && strings.teamDuels) || strings.duels
      if (gameInfo.movementOptions.forbidMoving) {
        gameMode = strings.movementNoMove
        if (gameInfo.movementOptions.forbidRotating && gameInfo.movementOptions.forbidZooming) {
          gameMode = strings.movementNmpz
        }
      }
      const healthOldUI = document.querySelectorAll('[class^="health-bar_livesLabel__"]')
      let scoreText: any
      if (healthOldUI.length >= 2) {
        const firstLabel = healthOldUI[0] as HTMLElement
        const secondLabel = healthOldUI[1] as HTMLElement
        if (firstLabel && secondLabel && firstLabel.textContent && secondLabel.textContent) {
          scoreText = ` | ${firstLabel.textContent} - ${secondLabel.textContent}`
        }
      }
      presenceData.details = `${gameMode} ${gameType}${(scoreText && scoreText) || ''}`
      delete presenceData.buttons
      if (isRanked) {
        presenceData.largeImageKey = (isTeams && gameModeIcons.team_duels) || gameModeIcons.solo_duels
        presenceData.state = strings.inRanked
        delete presenceData.smallImageKey
        if (!isTeams) {
          setDivisionInfo(soloDivision)
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
        delete presenceData.smallImageKey
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
        setDivisionInfo(soloDivision)
      }
    }
  }
  else if (currentPath[0] === 'multiplayer') {
    if (!currentPath[1]) {
      // Duels (new HUD)
      setHealthUI(strings.duels)
      presenceData.largeImageKey = gameModeIcons.solo_duels
      const rankText = document.querySelectorAll('[class^="division-header_title__"]')
      if (rankText[0]) {
        const divisionString = rankText[0].textContent
        setDivisionInfo(divisionString)
      }
      else if (lastPath[0] !== 'multiplayer' || lastPath[1]) {
        delete presenceData.smallImageKey
        presenceData.state = strings.inRanked
        setDivisionInfo(soloDivision)
      }
    }
    else if (currentPath[1] === 'teams') {
      // Duels (new HUD, teams)
      setHealthUI(strings.teamDuels)
      presenceData.largeImageKey = gameModeIcons.team_duels
      if (isNewURL) {
        delete presenceData.smallImageKey
        presenceData.state = strings.inRanked
      }
      const rankText = document.querySelectorAll('[class^="division-header_title__"]')
      if (rankText[0]) {
        const divisionString = rankText[0].textContent
        setDivisionInfo(divisionString)
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
      delete presenceData.smallImageKey
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
