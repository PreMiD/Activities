import type { dataObject, PageVars } from './types.js'
import { ActivityAssets, rankedImages, unrankedImages } from './assets.js'

const presence = new Presence({
  clientId: '770491262997889055',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let data: PageVars, gameData: dataObject

async function getData() {
  const pageVariables: PageVars = await presence.getPageVariable(
    'Tt.time',
    'Tt.timeEnd',
    'Tt.paused',
    'Tt.failed',
    'Bt.screen',
    'Bt.online.mode',
    'Bt.song.mode',
    'Tt.bpm',
  )
  return pageVariables
}

function getLevelPresence(presenceData: PresenceData) {
  presenceData.details = 'Playing a level'
  presenceData.state = `${gameData.title} by ${gameData.author}`
  if (
    data['Tt.time'] < data['Tt.timeEnd']
    && !data['Tt.paused']
    && !data['Tt.failed']
  ) {
    presenceData.endTimestamp = presence.getTimestamps(
      (data['Tt.time'] / data['Tt.bpm']) * 60,
      (data['Tt.timeEnd'] / data['Tt.bpm']) * 60,
    )[1]
  }
  if (gameData.special) {
    presenceData.smallImageKey = gameData.ranked
      ? ActivityAssets.RankedSpecial
      : ActivityAssets.UnrankedSpecial
  }
  else if (gameData.ranked) {
    presenceData.smallImageKey = rankedImages[Math.floor(gameData.stars)] || rankedImages.at(-1)
  }
  else {
    presenceData.smallImageKey = unrankedImages[Math.floor(gameData.stars)] || unrankedImages.at(-1)
  }
  presenceData.smallImageText = `${gameData.stars
    .toPrecision(2)
    .toString()} stars`

  return presenceData
}

window.addEventListener(
  'message',
  (event) => {
    gameData = event.data
  },
  false,
)

setInterval(async () => {
  data = await getData()
}, 1000)

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  switch (data['Bt.screen']) {
    case 'settings': {
      presenceData.details = 'Viewing settings'
      break
    }
    case 'logo': {
      presenceData.details = 'Viewing homescreen'
      break
    }
    case 'online': {
      switch (data['Bt.online.mode']) {
        case 'main': {
          presenceData.details = 'Browsing leaderboard'
          break
        }
        case 'viewUser': {
          presenceData.details = 'Viewing user'
          break
        }
      }

      break
    }
    case 'account': {
      presenceData.details = 'Viewing account settings'
      break
    }
    case 'song': {
      switch (data['Bt.song.mode']) {
        case 'song': {
          presenceData.details = 'Browsing songs'
          break
        }
        case 'newSong': {
          presenceData.details = 'Uploading song'
          break
        }
      }
      break
    }
    case 'lvl': {
      if (gameData.screen[0] === 'game' && data['Tt.time'])
        presenceData = getLevelPresence(presenceData)
      else presenceData.details = 'Browsing levels'
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
})
