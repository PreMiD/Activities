const presence = new Presence({
  clientId: '858886158045806602',
})

let prevURL = ''
let timestamp = Date.now()
let details = ''
let state: string | undefined | null = null
presence.on('UpdateData', async () => {
  if (prevURL !== window.location.pathname) {
    prevURL = window.location.pathname
    timestamp = Date.now()
  }
  if (window.location.pathname === '/') {
    details = 'Browsing Home Page'
  }
  else if (window.location.pathname === '/portal/learning') {
    details = 'Netacad Portal'
  }
  else if (window.location.pathname.startsWith('/course/')) {
    details = 'Viewing course'
    state = document.querySelectorAll('h3')[0]?.textContent
  }
  else if (window.location.pathname.startsWith('/grade/report/')) {
    details = 'Viewing grades'
    state = document.querySelectorAll('h3')[0]?.textContent
  }
  else if (window.location.pathname.startsWith('/local/mail/')) {
    details = 'Viewing messages'
  }
  else if (window.location.pathname.startsWith('/calendar/')) {
    details = 'Viewing calendar'
    state = document.querySelectorAll('h3')[0]?.textContent
  }
  else if (window.location.pathname.startsWith('/mod/')) {
    if (
      document
        .querySelectorAll('h2')[0]
        ?.textContent
        ?.toUpperCase()
        .includes('EXAM')
    ) {
      details = 'Viewing exam'
    }
    else {
      details = 'Viewing course content'
    }

    state = document.querySelectorAll('h3')[0]?.textContent
  }
  else if (window.location.pathname.startsWith('/srwe-dl/')) {
    details = 'Viewing course content'
    state = document.querySelectorAll('h1')[0]?.textContent
  }
  else if (window.location.pathname.includes('assessment_history')) {
    details = 'Viewing Assesment History'
  }
  else {
    details = 'Browsing'
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Cisco%20Networking%20Academy/assets/logo.png',
    details,
    state,
    startTimestamp: timestamp,
  }
  if (!state)
    delete presenceData.state

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
