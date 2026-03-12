import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1178463662382518272',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Tetris/assets/logo.png',
}

interface TetrisFrameData {
  lines: string
  score: string
  level: string
}
let iframeData: TetrisFrameData = {
  lines: '0',
  score: '0',
  level: '1',
}

presence.on('iFrameData', (data: unknown) => {
  iframeData = data as TetrisFrameData
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  switch (pathname.split('/').find(Boolean) ?? '') {
    case '': {
      presenceData.details = 'Browsing home page'
      break
    }
    case 'topic': {
      presenceData.details = 'Browsing a topic'
      presenceData.state = document
        .querySelector<HTMLDivElement>('#topic-heading')
        ?.textContent
        ?.trim()
      break
    }
    case 'article': {
      presenceData.details = 'Reading an article'
      presenceData.state = document.querySelector<HTMLHeadingElement>(
        '[itemprop=headline]',
      )
      presenceData.buttons = [
        {
          label: 'Read Article',
          url: href,
        },
      ]
      break
    }
    case 'play-tetris': {
      presenceData.details = 'Playing Tetris'
      presenceData.state = `Level ${iframeData.level}`
      presenceData.smallImageKey = Assets.Question
      presenceData.smallImageText = `Lines: ${iframeData.lines} | Score: ${iframeData.score}`
      break
    }
    case 'product-list':
    case 'product-list-videogames':
    case 'product-list-merchandise': {
      presenceData.details = 'Browsing products'
      break
    }
    case 'product': {
      presenceData.details = 'Viewing a product'
      presenceData.state = document.querySelector<HTMLHeadingElement>('.product-lead h1')
      presenceData.buttons = [
        {
          label: 'View Product',
          url: href,
        },
      ]
      break
    }
    default: {
      presenceData.details = 'Browsing'
      presenceData.state = document.title
      break
    }
  }

  presence.setActivity(presenceData)
})
