// Application ID on Discord developer page
const presence = new Presence({
  clientId: '719373053028728894',
})
// time spent on current URL
const timeElapsed = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  // default settings
  const presenceData: PresenceData = {
    details: document.title,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LeetCode/assets/logo.png',
    startTimestamp: timeElapsed,
  }

  // edit attributes based on path
  if (document.location.pathname === '/') {
    presenceData.details = 'Homepage'
  }
  else if (document.location.pathname.startsWith('/problemset')) {
    presenceData.details = 'Viewing Problems'
  }
  else if (document.location.pathname.startsWith('/problems')) {
    // Read problem name based on title, HTML is too messy to parse
    presenceData.details = document.title.slice(0, -10)
  }
  else if (document.location.pathname.startsWith('/explore')) {
    presenceData.details = 'Explore'

    if (document.querySelectorAll('.question-title')) {
      presenceData.state = document.querySelectorAll('.question-title')[0]?.textContent
    }
  }
  else if (document.location.pathname.startsWith('/contest')) {
    presenceData.details = 'In a Contest'
  }
  else if (document.location.pathname.startsWith('/articles')) {
    presenceData.details = 'Reading Solutions'
  }
  else if (document.location.pathname.startsWith('/discuss')) {
    presenceData.details = 'Browsing Forums'
  }
  else if (document.location.pathname.startsWith('/interview')) {
    presenceData.details = 'Mock Interviewing'
  }

  presence.setActivity(presenceData)
})
