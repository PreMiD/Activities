import { Assets } from 'premid'

const presence = new Presence({
  clientId: '661198037175238665',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Nodejs.org/assets/logo.png',
    smallImageKey: Assets.Reading,
    smallImageText: 'Reading Node.js Doc\'s',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'nodejs.org') {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Viewing At Home Page'
    if (document.location.pathname.includes('/about')) {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'About Node.js'
    }
    else if (document.location.pathname.includes('/download')) {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Node.js Downloads'
    }
    else if (document.location.pathname.includes('/docs')) {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'About Docs'
    }
    else if (document.location.pathname.includes('/get-involved')) {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Get Involved'
    }
    else if (document.location.pathname.includes('/security')) {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Security'
    }
    else if (document.location.pathname.includes('/blog')) {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Node.js News'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
