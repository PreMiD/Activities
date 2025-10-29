import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1432815872891683019',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const ActivityAssets = {
  Logo: '',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
  }

  const { pathname } = window.location

  if (pathname.startsWith('/series/')) {
    const mangaTitle 
      = document.querySelector('h1.text-2xl')?.textContent?.trim() 
      || document.querySelector('meta[property="og:title"]')?.getAttribute('content')

    const mangaCover 
      = document.querySelector('picture img')?.getAttribute('src') 
      || document.querySelector('meta[property="og:image"]')?.getAttribute('content')

    presenceData.details = `Ready to read: ${mangaTitle}`
    presenceData.state = 'Choosing chapter'

    if (mangaCover) {
      presenceData.largeImageKey = mangaCover
    }

    presenceData.buttons = [
      {
        label: 'View on WeebCentral',
        url: window.location.href,
      },
    ]
  } 
  else if (pathname.startsWith('/chapters/')) {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content')
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    const preloadImage = document
      .querySelector('link[rel="preload"][as="image"]')
      ?.getAttribute('href')

    let chapterTitle = 'Unknown chapter title'
    let mangaTitle = 'Unknown manga'

    if (ogTitle) {
      const parts = ogTitle.split('|').map(x => x.trim())
      chapterTitle = parts[0] || chapterTitle
      mangaTitle = parts[1] || mangaTitle
    }

    const chapterImage = ogImage || preloadImage || Assets.Reading

    presenceData.details = `Reading: ${mangaTitle}`
    presenceData.state = chapterTitle
    presenceData.largeImageKey = chapterImage
    presenceData.smallImageKey = Assets.Reading

    presenceData.buttons = [
      {
        label: 'View on WeebCentral',
        url: window.location.href,
      },
    ]
  } 
  else if (pathname === '/' || pathname.startsWith('/search')) {
    presenceData.details = 'Searching something to read...'
    presenceData.state = 'On WeebCentral'
  } 
  else {
    presenceData.details = 'Browsing WeebCentral'
    presenceData.state = 'Exploring new manga'
  }

  presence.setActivity(presenceData)
})
