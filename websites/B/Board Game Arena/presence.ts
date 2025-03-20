import getGame from './games/index.js'
import { getGameTag } from './util.js'

const presence = new Presence({
  clientId: '1089962805270171689',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

interface ForumTopic {
  title: string
  url: string
}

let forumTopic: ForumTopic = {
  title: '',
  url: '',
}

presence.on('iFrameData', (data: unknown) => {
  forumTopic = data as ForumTopic
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Board%20Game%20Arena/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  switch (pathList[0] ?? 'welcome') {
    case 'welcome': {
      presenceData.details = 'Browsing homepage'
      break
    }
    case 'tutorial': {
      const game = getGame(await getGameTag(presence))
      presenceData.details = `Playing tutorial for ${document
        .querySelector('meta[property=\'og:title\']')
        ?.getAttribute('content')}`
      presenceData.largeImageKey = game.logo
      Object.assign(presenceData, await game.getData(presence))
      break
    }
    case 'gamepanel': {
      presenceData.details = 'Viewing game panel'
      presenceData.state = document.querySelector<HTMLSpanElement>(
        '.text-bga-gamename',
      )?.textContent
      presenceData.buttons = [
        {
          label: 'View Game',
          url: href,
        },
      ]
      break
    }
    case 'player': {
      presenceData.details = 'Viewing player profile'
      presenceData.state = document
        .querySelector<HTMLSpanElement>('#player_name')
        ?.textContent
        ?.trim()
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('#player_avatar img')?.src
      presenceData.buttons = [
        {
          label: 'View Profile',
          url: href,
        },
      ]
      break
    }
    case 'table': {
      presenceData.details = 'Viewing a table'
      presenceData.state = document.querySelector<HTMLHeadingElement>('#table_name')?.textContent
      presenceData.buttons = [
        {
          label: 'Join Table',
          url: href,
        },
      ]
      break
    }
    case 'gamelist': {
      presenceData.details = 'Viewing game list'
      break
    }
    case 'lobby': {
      presenceData.details = 'Viewing lobby'
      break
    }
    case 'headlines': {
      presenceData.details = 'Viewing news'
      break
    }
    case 'forum': {
      switch (pathList[1] ?? '') {
        case 'viewtopic.php': {
          presenceData.details = 'Viewing a forum topic'
          presenceData.state = forumTopic.title
          presenceData.buttons = [{ label: 'View Topic', url: forumTopic.url }]
          break
        }
        case 'viewforum.php': {
          presenceData.details = 'Viewing a forum category'
          presenceData.state = forumTopic.title
          break
        }
        default: {
          presenceData.details = 'Browsing the forum'
        }
      }
      break
    }
    default: {
      if (/^\d+$/.test(pathList[0]!)) {
        const game = getGame(await getGameTag(presence))
        presenceData.details = `Playing ${document
          .querySelector('meta[property=\'og:title\']')
          ?.getAttribute('content')}`
        presenceData.largeImageKey = game.logo
        Object.assign(presenceData, await game.getData(presence))
        break
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
