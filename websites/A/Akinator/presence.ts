const presence = new Presence({
  clientId: '631543282601558046',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Akinator/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location

  switch (pathname) {
    case '/': {
      presenceData.details = 'Starting Akinator'
      break
    }
    case '/theme-selection': {
      presenceData.details = 'Selecting Theme'
      break
    }
    case '/game': {
      presenceData.details = `Q: ${
        document.querySelectorAll('.bubble-body')[0]?.textContent
      }`
      presenceData.state = `Selecting: ${
        document.querySelectorAll(':hover')?.[12]?.textContent
        ?? 'Still Thinking'
      }`
      presenceData.smallImageKey = document
        .querySelector('[class*="flag-icon"]')
        ?.className
        .split('-')?.[3]
        ? `https://raw.githubusercontent.com/hampusborgos/country-flags/main/png1000px/${document
          .querySelector('[class*="flag-icon"]')
          ?.className
          .split('-')[3]
          ?.toLowerCase()}.png`
        : ''
      presenceData.smallImageText = document.querySelector(
        '[class="lang-label"]',
      )?.textContent
      presenceData.buttons = [
        {
          label: 'Play The Game',
          url: href,
        },
      ]

      break
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
