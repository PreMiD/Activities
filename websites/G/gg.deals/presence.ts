import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1496546727749226606',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/pXWjFbw.jpeg',
}

presence.on('UpdateData', async () => {
  const { pathname } = window.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (pathname.match(/\/game\/|\/gift-cards-group\/|\/gift-card\/|\/pack\/|\/dlc\//)) {
    const gameHeading = document.querySelector('.game-heading h1')
    if (gameHeading) {
      let title = gameHeading.textContent?.trim() || ''

      // Remove "Buy" from the beginning
      title = title.replace(/^Buy\s+/i, '')

      // Remove suffixes (longer ones first to avoid partial matches)
      const suffixes = [
        'Xbox Series & PC',
        'PC key',
        'Xbox Series',
        'Xbox One',
        'Nintendo Switch',
        'PS5',
        'PS4',
        'Xbox',
        'PC'
      ]
      
      // Create a regex to match any of the suffixes and anything that follows them
      const suffixRegex = new RegExp(`\\s+(${suffixes.join('|')}).*$`, 'i')
      title = title.replace(suffixRegex, '').trim()

      if (pathname.includes('/game/')) {
        presenceData.details = 'Viewing game:'
      } else if (pathname.includes('/pack/')) {
        presenceData.details = 'Viewing pack:'
      } else if (pathname.includes('/dlc/')) {
        presenceData.details = 'Viewing DLC:'
      } else if (pathname.includes('/gift-card/') || pathname.includes('/gift-cards-group/')) {
        presenceData.details = 'Viewing gift card:'
      } else {
        presenceData.details = 'Viewing:'
      }
      
      presenceData.state = title
      
      const imageElement = document.querySelector('.game-info-image img, .game-heading img') as HTMLImageElement
      if (imageElement) {
        const firstSrcset = imageElement.srcset?.split(',')[0]
        if (firstSrcset) {
          presenceData.smallImageKey = firstSrcset.trim().split(' ')[0]
        } else if (imageElement.src) {
          presenceData.smallImageKey = imageElement.src
        }
      } else {
        presenceData.smallImageKey = Assets.Play
      }
    } else {
      presenceData.details = 'Browsing deals'
      presenceData.smallImageKey = Assets.Search
    }
  } else if (pathname.includes('/games/pc/')) {
    presenceData.details = 'Browsing PC games'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/games/xbox/')) {
    presenceData.details = 'Browsing Xbox games'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/games/playstation/')) {
    presenceData.details = 'Browsing PSN games'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/games/nintendo/')) {
    presenceData.details = 'Browsing Nintendo games'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.match(/\/games\/?$/)) {
    presenceData.details = 'Browsing all platforms'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/news/pc/')) {
    presenceData.details = 'Browsing PC news'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/news/xbox/')) {
    presenceData.details = 'Browsing Xbox news'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/news/playstation/')) {
    presenceData.details = 'Browsing PSN news'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/news/nintendo/')) {
    presenceData.details = 'Browsing Nintendo news'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/news/')) {
    presenceData.details = 'Browsing all news'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/deals/pc/')) {
    presenceData.details = 'Browsing PC deals'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/deals/xbox/')) {
    presenceData.details = 'Browsing Xbox deals'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/deals/playstation/')) {
    presenceData.details = 'Browsing PSN deals'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/deals/nintendo/')) {
    presenceData.details = 'Browsing Nintendo deals'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/deals/')) {
    presenceData.details = 'Browsing all deals'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/prepaids/pc/')) {
    presenceData.details = 'Browsing PC prepaid cards'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/prepaids/xbox/')) {
    presenceData.details = 'Browsing Xbox prepaid cards'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/prepaids/playstation/')) {
    presenceData.details = 'Browsing PSN prepaid cards'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/prepaids/nintendo/')) {
    presenceData.details = 'Browsing Nintendo prepaid cards'
    presenceData.smallImageKey = Assets.Search
  } else if (pathname.includes('/prepaids/')) {
    presenceData.details = 'Browsing all prepaid cards'
    presenceData.smallImageKey = Assets.Search
  } else {
    presenceData.details = 'Browsing deals'
    presenceData.smallImageKey = Assets.Search
  }

  presence.setActivity(presenceData)
})
