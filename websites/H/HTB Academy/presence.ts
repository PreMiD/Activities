const presence = new Presence({
  clientId: '1200517025383075840',
})

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/HTB%20Academy/assets/logo.jpg',
  }

  if (pathname === '/' || pathname === '/login') {
    presenceData.details = 'Breaching into the Academy'
  }

  else if (pathname.includes('/dashboard')) {
    presenceData.details = 'Browsing the dashboard'

    const off = document.querySelector('.redPercent')?.textContent || '0'
    const def = document.querySelector('.bluePercent')?.textContent || '0'
    const gen = document.querySelector('.greenPercent')?.textContent || '0'

    presenceData.state = `Off: ${off}% | Def: ${def}% | Gen: ${gen}%`
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
    const moduleName = document.querySelector('.page-title.mb-0.font-size-18.letter-spacing-1-2')?.textContent
    const sectionElement = document.querySelector('.training-module > h1')
    const sectionName = sectionElement?.textContent?.trim()

    presenceData.details = `Reading Module: ${moduleName}`
    presenceData.state = sectionName ? `Section: ${sectionName}` : ''
  }

  else if (pathname.includes('/details')) {
    const title = document.querySelector('.page-title-box .page-title')?.textContent?.trim()
    presenceData.details = 'Reading details about module:'
    presenceData.state = title ? `"${title}"` : 'Unknown Module'
  }

  else if (pathname.includes('/my-certificates')) {
    presenceData.details = 'Looking at certificates'
    presenceData.state = 'Admiration Mode'
  }

  else if (pathname.includes('/my-badges')) {
    presenceData.details = 'Looking at badges'
  }

  presence.setActivity(presenceData)
})
