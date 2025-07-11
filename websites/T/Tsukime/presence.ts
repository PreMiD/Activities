import { Assets } from 'premid'

const presence = new Presence({
  clientId: '770407336497512478',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    reading: 'general.reading',
  })
}

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/Tsukime/assets/logo.png',
}

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Viewing,
  }

  const pathnameArray = document.location.pathname.split('/')
  const page = pathnameArray[1]
  const [showCover, showButton] = await Promise.all([
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])
  strings = await getStrings()

  switch (page) {
    case 'user': {
      presenceData.details = strings.browsing
      presenceData.largeImageKey = document.querySelector('.avatar')?.getAttribute('src') || ActivityAssets.Logo
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = strings.reading

      switch (pathnameArray[3]) {
        case 'anime':
          presenceData.details = 'Viewing anime list'
          break
        case 'manga':
          presenceData.details = 'Viewing manga list'
          break
        case 'activities':
          presenceData.details = 'Viewing social page'
          break
        default:
          presenceData.details = 'Viewing profile'
      }
      presenceData.state = `from ${document.querySelector('.username')?.textContent || 'Unknown User'}`

      presenceData.buttons = [
        {
          label: 'View user\'s page',
          url: document.location.href.replace(pathnameArray[3] ?? '', ''),
        },
      ]
      break
    }
    case 'discovery': {
      presenceData.details = 'Searching'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
      break
    }
    case 'anime':
    case 'manga': {
      presenceData.details = `Viewing ${page === 'anime' ? 'an' : 'a'} ${page}`
      presenceData.state = document
        .querySelector('h1')
        ?.textContent
        ?.trim()
      if (showCover) {
        presenceData.largeImageKey = document
          .querySelector('.cover')
          ?.getAttribute('src')
      }
      presenceData.buttons = [
        {
          label: page === 'anime' ? 'View anime' : 'View manga',
          url: document.location.href,
        },
      ]
      break
    }
    case 'episode': {
      const episodeNumber = document
        .querySelector('.episodeNumber')
        ?.textContent
        ?.trim()
      presenceData.details = `Viewing episode ${episodeNumber} of`
      presenceData.state = document
        .querySelector('.title')
        ?.textContent
        ?.trim()
      if (showCover) {
        presenceData.largeImageKey = document
          .querySelector('.cover')
          ?.getAttribute('src')
      }
      presenceData.buttons = [
        {
          label: 'View episode',
          url: document.location.href,
        },
      ]
      break
    }
    default: {
      presenceData.details = strings.browsing
      presenceData.state = 'Home'
      break
    }
  }

  if (!showButton)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
