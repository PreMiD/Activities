const presence = new Presence({
  clientId: '1341778656762134538',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Raycast/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const args = document.location.pathname.split('/')
  const href = document.location.href
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  presenceData.details = 'Exploring Raycast'

  if (document.location.hostname === 'www.raycast.com') {
    if (document.location.pathname === '/') {
      presenceData.details = 'Viewing Home Page'
    }
    else if (args[1] === 'store') {
      presenceData.details = 'Exploring Raycast Store'
    }
    else if (args[1] === 'pro') {
      presenceData.details = 'Learning about Raycast Pro'
    }
    else if (args[1] === 'teams') {
      presenceData.details = 'Learning about Raycast Teams'
    }
    else if (args[1] === 'developers') {
      presenceData.details = 'Learning about Raycast Developers'
    }
    else if (args[1] === 'changlog') {
      presenceData.details = 'Viewing Raycast Changelog'
      presenceData.buttons = [{ label: 'View Raycast Changlog', url: href }]
    }
    else if (args[1] === 'blog') {
      presenceData.details = 'Exploring Raycast Blog'
      if (args[2]) {
        presenceData.details = 'Reading Blog Post'
        presenceData.state = document.title
        presenceData.buttons = [{ label: 'View Blog Post', url: href }]
      }
    }
    else if (args[1] === 'pricing') {
      presenceData.details = 'Checking Raycast Pricing'
    }
    else if (args[1] === 'extension-issues') {
      presenceData.details = 'Checking Extension Issues'
    }
    else if (args[1] && args[2] && document.querySelector('[class^="ExtensionPage_extensionInstallButton__"]')) {
      presenceData.details = 'Viewing Extension'
      presenceData.state = document.querySelector('[class^="ExtensionPage_title__"]')?.textContent ?? 'Unknown Extension'
      presenceData.buttons = [{ label: 'View Extension', url: href }]
    }
    else if (args[1] && document.querySelector('[class^="UserProfile_mainInfo__"]')) {
      presenceData.details = 'Viewing User Profile'
      const username = document.querySelector('[class^="OwnerDetails_nameAndHandle__"] h1')?.textContent ?? ''
      const handle = document.querySelector('[class^="OwnerDetails_nameAndHandle__"] h2')?.textContent ?? ''
      presenceData.state = [
        username,
        handle ? `(${handle})` : '',
      ].filter(Boolean).join(' ')
      presenceData.buttons = [{ label: 'View Profile', url: href }]
    }
  }
  else if (document.location.hostname === 'developers.raycast.com') {
    presenceData.details = 'Reading Raycast Developer Docs'
    presenceData.state = document.title
    presenceData.buttons = [{ label: 'View Documentation', url: href }]
  }
  presence.setActivity(presenceData)
})
