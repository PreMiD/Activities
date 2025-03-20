import { Assets } from 'premid'

const presence: Presence = new Presence({
  clientId: '614220272790274199',
})
const startTimestamp: number = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    browsing: 'general.browsing',
    reading: 'general.reading',
  })
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AniList/assets/logo.png',
}

let strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp,
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
      if (showCover) {
        presenceData.largeImageKey = document
          .querySelectorAll('.avatar')[1]
          ?.getAttribute('src')
        presenceData.smallImageKey = ActivityAssets.Logo
      }
      switch (pathnameArray[3]) {
        case 'mangalist':
          presenceData.details = 'Viewing manga list'
          break
        case 'animelist':
          presenceData.details = 'Viewing anime list'
          break
        case 'favorites':
          presenceData.details = 'Viewing favorites'
          break
        case 'stats':
          presenceData.details = 'Viewing stats'
          break
        case 'social':
          presenceData.details = 'Viewing social page'
          break
        case 'reviews':
          presenceData.details = 'Viewing reviews'
          break
        default:
          presenceData.details = 'Viewing profile'
      }
      presenceData.state = `from ${pathnameArray[2]}`
      presenceData.buttons = [
        {
          label: 'View user\'s page',
          url: document.location.href.replace(pathnameArray[3] ?? '', ''),
        },
      ]
      break
    }
    case 'search':
      presenceData.details = 'Searching'
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
      break
    case 'anime':
    case 'manga':
      presenceData.details = `Viewing ${page === 'anime' ? 'an' : 'a'} ${page}`
      presenceData.state = document
        .querySelector('div.content > h1')
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
    case 'character':
    case 'staff':
      presenceData.details = `Viewing a ${page}`
      presenceData.state = document.querySelector('.name')?.textContent?.trim()
      if (showCover) {
        presenceData.largeImageKey = document
          .querySelector('.image')
          ?.getAttribute('src')
      }
      presenceData.buttons = [
        {
          label: page === 'character' ? 'View character' : 'View staff',
          url: document.location.href,
        },
      ]
      break
    case 'forum':
      if (pathnameArray.length > 3) {
        presenceData.details = 'Reading a forum post'
        presenceData.state = `'${document
          .querySelector('h1.title')
          ?.textContent
          ?.trim()}'`
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.reading
      }
      else {
        presenceData.details = 'Browsing the forum'
      }
      break
    case 'studio':
      presenceData.details = 'Viewing a studio'
      presenceData.state = document.querySelector('div.container > h1')?.textContent
      break
    case 'reviews':
      presenceData.details = 'Browsing reviews'
      break
    case 'review':
      presenceData.details = `Reading a '${document
        .querySelector('a.title')
        ?.textContent
        ?.trim()}' review`
      presenceData.state = `${document
        .querySelector('a.author')
        ?.textContent
        ?.trim()
        .replace('a review ', '')}`
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.reading
      break
    case 'recommendations':
      presenceData.details = 'Browsing recommendations'
      presenceData.state = document
        .querySelector('.option.active')
        ?.textContent
        ?.trim()
      break
    case 'notifications':
      presenceData.details = 'Viewing notifications'
      break
    case 'settings':
      presenceData.details = 'Changing settings'
      break
    default:
      presenceData.details = strings.browsing
      presenceData.state = 'Home'
      break
  }

  if (!showButton)
    delete presenceData.buttons

  presence.setActivity(presenceData, true)
})
