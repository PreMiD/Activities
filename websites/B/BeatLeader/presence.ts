import { ActivityType, Assets } from 'premid'
import { contexts, leaderboardImages, logoArr, replayIcon } from './assets.js'

const presence = new Presence({
  clientId: '939893188448104468',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const date = new Date()
const random = Math.floor(Math.random() * 100)

function simplifyKey(key: string): string {
  let result = key.replaceAll(' ', '')
  if (
    (result.includes('-PinkPlay_Controllable')
      && !result.match(/(?:Standard|OneSaber|Lawless)-PinkPlay_Controllable/))
    || result.match(/(Horizontal|Vertical|Inverted|Inverse)/)
  ) {
    result = result.replace('-PinkPlay_Controllable', '')
  }
  if (result.match(/(Horizontal|Vertical|Inverted|Inverse)/)) {
    let previous
    do {
      previous = result
      result = result.replace(/Lawless|OneSaber|NoArrows|Standard|Legacy/, '')
    } while (result !== previous)
  }
  return result
}

let replay = {
  name: '',
  subName: '',
  currentTime: '',
  playing: false,
  duration: '',
  playerName: '',
  cover: '',
}
let dynamicLogo = ''

function doDefaultDynamic() {
  if (random < 98) {
    dynamicLogo = logoArr[1]
  }
  else if (random >= 98) {
    if (random <= 98)
      dynamicLogo = logoArr[4]
    else dynamicLogo = logoArr[5]
  }
}

switch (date.getMonth()) {
  case 3: {
    if (date.getDate() === 22)
      dynamicLogo = logoArr[6]
    else doDefaultDynamic()
    break
  }
  case 9: {
    switch (random % 2) {
      case 0: {
        dynamicLogo = logoArr[2]
        break
      }
      case 1: {
        dynamicLogo = logoArr[3]
        break
      }
    }
    break
  }
  case 11: {
    switch (random % 2) {
      case 0: {
        dynamicLogo = logoArr[7]
        break
      }
      case 1: {
        dynamicLogo = logoArr[8]
        break
      }
    }
    break
  }
  default: {
    doDefaultDynamic()
    break
  }
}

presence.on(
  'iFrameData',
  (data: {
    name: string
    subName: string
    currentTime: string
    playing: boolean
    duration: string
    playerName: string
    cover: string
  }) => {
    replay = data
  },
)

presence.on('UpdateData', async () => {
  const [time, buttons, cover, context, logo, mapSmallImages] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('context'),
    presence.getSetting<number>('logo'),
    presence.getSetting<number>('mapSmallImages'),
  ])
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
  } as PresenceData
  const { pathname, href, hostname } = document.location
  const button = {
    label: 'View Page',
    url: href,
  }

  if (hostname.split('.')[0] === 'replay') {
    presenceData.type = ActivityType.Watching
    presenceData.name = 'BL Replay'
    presenceData.largeImageKey = cover
      ? document.querySelector<HTMLImageElement>('#songImage')
      : replayIcon
    presenceData.details = document.querySelector('#songName')?.textContent
    presenceData.state = document.querySelector('#playerName')?.textContent
    presenceData.smallImageKey = document.querySelector('div.btn.play')
      ? Assets.Pause
      : Assets.Play
    presenceData.smallImageText = document.querySelector('div.btn.play')
      ? 'Paused'
      : 'Playing'
    if (document.querySelector('div.btn.pause')) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        presence.timestampFromFormat(
          document.querySelector('#songProgress')?.textContent ?? '',
        ),
        presence.timestampFromFormat(
          document.querySelector('#songDuration')?.textContent ?? '',
        ),
      )
    }
    presenceData.buttons = [
      {
        label: 'View Replay',
        url: href,
      },
    ]
  }
  else if (hostname.split('.')[0] === 'royale') {
    presenceData.type = ActivityType.Watching
    presenceData.name = 'BL Royale'
    presenceData.largeImageKey = cover
      ? document.querySelector<HTMLImageElement>('#songImage')
      : replayIcon
    presenceData.details = document.querySelector('#songName')?.textContent
    presenceData.state = `${
      document.querySelectorAll('.playerTableRow')?.length
    } player royale`
    presenceData.smallImageKey = document.querySelector('div.btn.play')
      ? Assets.Pause
      : Assets.Play
    presenceData.smallImageText = document.querySelector('div.btn.play')
      ? 'Paused'
      : 'Playing'
    if (document.querySelector('div.btn.pause')) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        presence.timestampFromFormat(
          document.querySelector('#songProgress')?.textContent ?? '',
        ),
        presence.timestampFromFormat(
          document.querySelector('#songDuration')?.textContent ?? '',
        ),
      )
    }
    presenceData.buttons = [
      {
        label: 'View Royale',
        url: href,
      },
    ]
  }
  else {
    presenceData.largeImageKey = logo === 0 ? dynamicLogo : logoArr[logo]
    switch (pathname.split('/')[1]) {
      case 'u': {
        presenceData.details = 'Viewing profile'
        presenceData.state = document.querySelector(
          '.player-nickname .nickname',
        )?.textContent
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.countryIcon')
        if (cover) {
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.avatar')
        }
        presenceData.buttons = [button]
        break
      }
      case 'leaderboard': {
        const previewURL = new URL(
          document.querySelector<HTMLAnchorElement>(
            'a[href^="https://allpoland.github.io"]',
          )?.href ?? 'https://allpoland.github.io',
        )
        const difficulty = previewURL.searchParams.get('difficulty')
          ?? document
            .querySelector('.diff-tab-button.primary > span')
            ?.textContent
            ?.split(' ')[0]
        const mode = previewURL.searchParams.get('mode')
          ?? document.querySelector<HTMLDivElement>(
            '.primary.mode-tab-button > span > div',
          )?.title

        let mappers = ''

        for (const mapper of document.querySelectorAll('.mappers-list span'))
          mappers += `${mapper.textContent}, `
        mappers = mappers.slice(0, -2)

        presenceData.details = document.querySelector('.title .name')?.textContent
        presenceData.state = mappers
        if (presenceData.smallImageText === '')
          delete presenceData.smallImageText
        if (mapSmallImages !== 3) {
          presenceData.smallImageText = `${
            mapSmallImages === 0 || mapSmallImages === 1
              ? mode?.replaceAll('_', ' ')
              : ''
          } ${
            mapSmallImages === 0 || mapSmallImages === 2
              ? difficulty?.replace('Plus', '+')
              : ''
          }`
          presenceData.smallImageKey = leaderboardImages[
            simplifyKey(
              `${mapSmallImages === 0 || mapSmallImages === 1 ? mode : ''}${
                mapSmallImages === 0 || mapSmallImages === 2
                  ? difficulty?.replace('+', 'Plus')
                  : ''
              }`,
            )
          ]
          ?? leaderboardImages[
            `Unknown${
              mapSmallImages === 0 || mapSmallImages === 2
                ? difficulty?.replace('+', 'Plus')
                : ''
            }`
          ]
        }
        if (cover) {
          presenceData.largeImageKey = document
            .querySelector<HTMLDivElement>('.map-cover')
            ?.style
            .backgroundImage
            .match(
              /(https:\/\/.+\.((png)|(jpg)|(jpeg)|(webp)))/g,
            )
            ?.toString()
        }
        presenceData.buttons = [button]
        break
      }
      case 'event': {
        presenceData.details = 'Viewing event'
        presenceData.state = document.querySelector('h2')?.textContent
        presenceData.buttons = [button]
        if (cover) {
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.event > img')
        }
        break
      }
      case 'clan': {
        presenceData.details = 'Viewing clan'
        presenceData.state = document.querySelector('.title')?.textContent
        presenceData.buttons = [button]
        if (cover) {
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.clanImage')
        }
        break
      }
      case 'playlist': {
        presenceData.details = 'Viewing playlist'
        presenceData.state = document.querySelector(
          '.content-box .playlistTitle',
        )?.textContent
        if (cover) {
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
            '.content-box .playlistImage',
          )
        }
        presenceData.buttons = [button]
        break
      }
      case 'settings': {
        presenceData.details = 'Viewing settings'
        presenceData.state = document.querySelector(
          '.navigation-item.selected',
        )?.textContent
        break
      }
      case 'dashboard': {
        presenceData.details = 'Viewing dashboard'
        break
      }
      case '': {
        presenceData.details = 'Viewing dashboard'
        break
      }
      case 'ranking': {
        presenceData.details = 'Viewing ranking'
        break
      }
      case 'clans': {
        presenceData.details = 'Browsing clans'
        break
      }
      case 'leaderboards': {
        presenceData.details = 'Browsing leaderboards'
        break
      }
      case 'events': {
        presenceData.details = 'Browsing events'
        break
      }
      case 'playlists': {
        presenceData.details = 'Viewing playlists'
        break
      }
      case 'search': {
        presenceData.details = 'Searching users'
        break
      }
      case 'followed': {
        presenceData.details = 'Viewing their follows'
        break
      }
      case 'clansmap': {
        presenceData.details = 'Viewing clans map'
        break
      }
      case 'maps': {
        presenceData.details = 'Browsing maps'
        break
      }
    }
    if (
      document
        .querySelector<HTMLIFrameElement>('iframe')
        ?.src
        .includes('replay.beatleader.')
        && replay.name
    ) {
      presenceData.type = ActivityType.Watching
      presenceData.name = 'BL Replay'
      presenceData.largeImageKey = cover ? replay.cover : replayIcon
      presenceData.details = replay.name
      presenceData.state = replay.playerName
      presenceData.smallImageKey = replay.playing ? Assets.Play : Assets.Pause
      presenceData.smallImageText = replay.playing ? 'Playing' : 'Paused'
      if (replay.playing) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          presence.timestampFromFormat(replay.currentTime),
          presence.timestampFromFormat(replay.duration),
        )
      }
      presenceData.buttons = [
        {
          label: 'View Replay',
          url: document.querySelector<HTMLIFrameElement>('iframe')?.src ?? '',
        },
      ]
    }
  }

  if (context && presenceData.largeImageKey && !presenceData.smallImageKey) {
    presenceData.smallImageKey = contexts[hostname.split('.')[0]!]
    presenceData.smallImageText = document.querySelector('.leaderboard-type')?.textContent
  }

  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details && presenceData.largeImageKey)
    presence.setActivity(presenceData)
})
