import { Assets } from 'premid'

const presence = new Presence({
  clientId: '393887855274885121',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LeXx/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  switch (document.location.hostname) {
    case 'lexx.app': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Viewing the homepage'
      }
      else if (document.location.pathname.includes('/legal')) {
        presenceData.details = 'Viewing the legal notice'
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/privacy')) {
        presenceData.details = 'Viewing the privacy policy'
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/premium')) {
        presenceData.details = 'Reading about premium'
        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/login')) {
        presenceData.details = 'Logging in'
        presenceData.smallImageKey = Assets.Writing
      }
      else if (document.location.pathname.endsWith('/events')) {
        presenceData.details = 'Editing some events'
        presenceData.smallImageKey = Assets.Writing
      }
      else if (
        !document.location.pathname.endsWith('/events')
        && document.location.pathname.includes('/')
      ) {
        presenceData.details = 'Viewing the dashboard'
        presenceData.smallImageKey = Assets.Writing
      }
      else if (document.location.pathname !== '/') {
        presenceData.details = 'Viewing the homepage'
      }

      break
    }
    case 'beta.lexx.app': {
      presenceData.details = 'Viewing the beta page'
      break
    }
    case 'alpha.lexx.app': {
      presenceData.details = 'Viewing the alpha page'
      break
    }
    case 'dev.lexx.app': {
      presenceData.details = 'Viewing the development page'
      break
    }
    case 'status.lexx.app': {
      presenceData.details = 'Viewing the status page'
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
