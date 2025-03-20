const presence = new Presence({
  clientId: '973027832307535952',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Stats.fm/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = window.location
  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Browsing the main page'
      break
    }
    case pathname.includes('/album/'): {
      presenceData.details = 'Viewing an album'
      presenceData.state = document.querySelector('h1.text-center')?.textContent
      presenceData.buttons = [
        {
          label: 'View Album',
          url: location.href,
        },
      ]
      break
    }
    case pathname.includes('/artist/'): {
      presenceData.details = 'Viewing an artist'
      presenceData.state = document.querySelector('h1.text-center')?.textContent
      presenceData.buttons = [
        {
          label: 'View Artist',
          url: location.href,
        },
      ]
      break
    }
    case pathname.includes('/track/'): {
      presenceData.details = 'Viewing stats for a track'
      presenceData.state = document.querySelector('h1.text-center')?.textContent
      presenceData.buttons = [
        {
          label: 'View Track',
          url: location.href,
        },
      ]
      break
    }
    case pathname.includes('/beta'): {
      presenceData.details = 'Viewing information about the beta'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: location.href,
        },
      ]
      break
    }
    case pathname.includes('/privacy'): {
      presenceData.details = 'Reading the Privacy Policy'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: location.href,
        },
      ]
      break
    }
    case pathname.includes('/terms'): {
      presenceData.details = 'Reading the Terms & Conditions'
      presenceData.buttons = [
        {
          label: 'View Page',
          url: location.href,
        },
      ]
      break
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
