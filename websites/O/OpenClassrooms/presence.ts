const presence = new Presence({
  clientId: '796446671617130567',
})
const timeS = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/0.png',
    smallImageText: 'OpenClassrooms',
  }
  const webpath = window.location.pathname.toLowerCase()

  // Home page
  if (webpath === '/fr/' || webpath === '/en/') {
    presenceData.details = 'Home page'
  }
  // Dashboard
  else if (
    webpath.includes('/fr/dashboard')
    || webpath.includes('/en/dashboard')
  ) {
    // Courses or paths
    if (
      webpath.includes('/fr/dashboard/courses')
      || webpath.includes('/en/dashboard/courses')
    ) {
      presenceData.details = 'Dashboard'
      presenceData.state = `Browsing: ${
        document
          .querySelectorAll('.Mui-selected')[0]
          ?.querySelectorAll('span')[0]
          ?.textContent
      }`
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
    }
    else if (
      webpath === '/fr/dashboard/paths'
      || webpath === '/en/dashboard/paths'
    ) {
      presenceData.details = 'Dashboard'
      presenceData.state = `Browsing: ${
        document.querySelectorAll('.jss326')[1]?.textContent
      }`
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
    }
    // Courses page
  }
  else if (
    webpath === '/fr/courses'
    || webpath === 'fr/courses/'
    || webpath.includes('/fr/search')
    || webpath.includes('/en/search')
  ) {
    presenceData.details = 'Courses main page'
    presenceData.state = 'Looking for a course'
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
    // Paths page
  }
  else if (webpath === '/en/paths' || webpath === '/fr/paths') {
    presenceData.details = 'Paths main page'
    presenceData.state = 'Looking for a path'
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
    // Main page of a selected path
  }
  else if (webpath.includes('/fr/paths') || webpath.includes('/en/paths')) {
    presenceData.details = 'Looking for a path'
    presenceData.state = `Looking at ${document.title.replace(
      ' - OpenClassrooms',
      '',
    )}`
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
    // Reading a course
  }
  else if (
    webpath.includes('/fr/courses')
    || webpath.includes('/en/courses')
  ) {
    // Check if the user is reading the first chapter or not
    if (
      document.body.contains(document.querySelectorAll('.breadcrumb__item')[3]!)
    ) {
      // If the user is reading the second chapter or more, there is a chapter name
      const courseClass = document.querySelectorAll('.breadcrumb__item')
      presenceData.details = `Reading: ${
        courseClass[2]?.querySelectorAll('span')[0]?.textContent
      }`
      presenceData.state = `Chapter: ${courseClass[3]?.textContent}`
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
    }
    else if (
      !document.body.contains(document.querySelectorAll('.breadcrumb__item')[3]!)
    ) {
      // If the user is reading the first chapter, there is no default "chapter name" so we set it manually
      presenceData.details = `Reading: ${
        document.querySelectorAll('.breadcrumb__item')[2]?.textContent
      }`
      presenceData.state = 'Chapter: First chapter'
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
    }
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
  }
  else {
    presenceData.details = 'Browsing:'
    presenceData.state = document.title.replace(' - OpenClassrooms', '')
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenClassrooms/assets/logo.png'
  }
  presenceData.startTimestamp = timeS

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
