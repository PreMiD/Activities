const presence = new Presence({
  clientId: '1200517025383075840',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const { pathname } = document.location

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HTB%20Academy/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }

  if (pathname === '/' || pathname === '/login') {
    presenceData.details = 'Breaching into the Academy'
  }
  else if (pathname.includes('/dashboard')) {
    presenceData.details = 'Browsing the dashboard'

    presenceData.state = `Off: ${document.querySelector('.redPercent')?.textContent}% | `
      + `Def: ${document.querySelector('.bluePercent')?.textContent}% | `
      + `Gen: ${document.querySelector('.greenPercent')?.textContent}%`
  }
  else if (pathname.includes('/exams')) {
    presenceData.details = 'Browsing the exams'
  }
  else if (pathname.includes('/paths')) {
    presenceData.details = 'Browsing paths'
  }
  else if (pathname.includes('/modules')) {
    presenceData.details = 'Browsing modules'
  }
  else if (pathname.includes('/section')) {
    let module: HTMLElement | null

    if (document.querySelector('.iterminal')) {
      module = document.querySelector(
        '#layout-wrapper > div.main-content > div > div:nth-child(2) > div > div > h4',
      )
    }
    else {
      module = document.querySelector(
        '#layout-wrapper > div.main-content > div > div:nth-child(1) > div > div > h4',
      )
    }

    presenceData.details = `Reading Module: ${module?.textContent}`
    presenceData.state = `Section: ${
      document.querySelector('.training-module h1')?.textContent
    }`
  }
  else if (pathname.includes('/details')) {
    presenceData.details = 'Reading details about module:'
    presenceData.state = `"${
      document.querySelector('.page-title-box .page-title')?.textContent
    }"`
  }
  else if (pathname.includes('/my-certificates')) {
    presenceData.details = 'Looking at their certificates'
  }
  else if (pathname.includes('/my-badges')) {
    presenceData.details = 'Looking at their badges'
  }

  presence.setActivity(presenceData)
})
