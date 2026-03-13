const presence = new Presence({
  clientId: '1480614323230478509',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.ibb.co/TMtyJHgR/gfg-clean-512.png',
}

presence.on('UpdateData', async () => {
  const [showTimestamp, privacyMode] = await Promise.all([
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('privacy'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location
  const path = pathname.split('/').filter(Boolean)

  // Extract clean page title by stripping the site suffix
  const pageTitle = document.title
    .replace(/\s*[|-]\s*GeeksforGeeks.*/i, '')
    .replace(/\s*\|\s*Practice.*/i, '')
    .trim()

  if (!path.length || pathname === '/') {
    presenceData.details = 'Browsing Homepage'
  }
  else if (path[0] === 'problems') {
    if (path.length <= 1 || path[1] === 'difficulty-level') {
      presenceData.details = 'Browsing Problems'
    }
    else {
      presenceData.details = 'Solving a Problem'
      if (!privacyMode && pageTitle)
        presenceData.state = pageTitle
    }
  }
  else if (path[0] === 'problem-of-the-day') {
    presenceData.details = 'Solving Problem of the Day'
    if (!privacyMode && pageTitle)
      presenceData.state = pageTitle
  }
  else if (path[0] === 'courses' || path[0] === 'batch') {
    if (path.length <= 1) {
      presenceData.details = 'Browsing Courses'
    }
    else {
      presenceData.details = 'Taking a Course'
      if (!privacyMode && pageTitle)
        presenceData.state = pageTitle
    }
  }
  else if (
    path[0] === 'interview-prep'
    || path[0] === 'interview-questions'
    || path[0] === 'placement-training'
    || path[0] === 'company-wise-interview-preparations'
  ) {
    presenceData.details = 'Preparing for Interviews'
    if (!privacyMode && pageTitle)
      presenceData.state = pageTitle
  }
  else if (path[0] === 'jobs') {
    presenceData.details = 'Browsing Job Listings'
  }
  else if (path[0] === 'quiz') {
    presenceData.details = 'Taking a Quiz'
    if (!privacyMode && pageTitle)
      presenceData.state = pageTitle
  }
  else if (path[0] === 'events' || path[0] === 'geeks-for-geeks-coding-contests') {
    presenceData.details = 'Browsing Coding Events'
  }
  else if (path[0] === 'explore') {
    presenceData.details = 'Exploring Topics'
  }
  else if (path[0] === 'news') {
    presenceData.details = 'Reading Tech News'
    if (!privacyMode && pageTitle)
      presenceData.state = pageTitle
  }
  else if (pageTitle) {
    presenceData.details = 'Reading an Article'
    if (!privacyMode)
      presenceData.state = pageTitle
  }
  else {
    presenceData.details = 'Browsing GeeksforGeeks'
  }

  if (!showTimestamp)
    delete presenceData.startTimestamp

  presence.setActivity(presenceData)
})
