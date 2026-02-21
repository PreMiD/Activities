const presence = new Presence({
  clientId: '969064871310282813',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function getElementByXpath(path: string) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  ).singleNodeValue
}
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Q/Quran.com/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = window.location
  switch (pathname) {
    case '/': {
      presenceData.details = 'Browsing the homepage...'
      break
    }
    case '/radio': {
      presenceData.details = 'Looking through radio stations'
      break
    }
    case '/about-us': {
      presenceData.details = 'Viewing the about us page'
      break
    }
    case '/apps': {
      presenceData.details = 'Looking at Quran apps'
      break
    }
    case '/developers': {
      presenceData.details = 'Looking at the developers page'
      break
    }
    case '/privacy': {
      presenceData.details = 'Reading the privacy policy'
      break
    }
    case '/support': {
      presenceData.details = 'Looking at the support page'
      break
    }
    case '/search': {
      const searchQuery = document.querySelector<HTMLInputElement>('#searchQuery')?.value
      if (searchQuery)
        presenceData.details = `Searching for ${searchQuery}`
      else presenceData.details = 'Searching for something...'
      break
    }
    default: {
      if (pathname.includes('/reciters')) {
        if (pathname.includes('/reciters/')) {
          presenceData.details = 'Viewing a reciter:'
          presenceData.state = document.querySelector<HTMLDivElement>(
            '.ReciterInfo_reciterName__SiK59',
          )?.textContent
        }
        else {
          presenceData.details = 'Browsing through reciters'
        }
      }
      else {
        presenceData.details = 'Reading the Holy Quran'
        const surahName = getElementByXpath('/html/body/div[1]/div/div[2]/div/div[1]/div/p')?.textContent
        const surahNumber = getElementByXpath('/html/body/div[1]/div/div[2]/div/div[2]/div/p[2]/span[2]')?.textContent ?? getElementByXpath('/html/body/div[1]/div/div[2]/div/div[2]/div/p[2]/span')?.textContent
        
        if (surahName && surahNumber) {
          presenceData.state = `Surah: Surat ${surahName} (${surahNumber})`
        } else if (surahName) {
          presenceData.state = `Surah: Surat ${surahName}`
        }
      }
    }
  }
  presence.setActivity(presenceData)
})
