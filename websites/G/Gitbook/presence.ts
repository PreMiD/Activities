import { Assets } from 'premid'

const presence = new Presence({
  clientId: '719757905888542730',
})

let actionTimestamp: number | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gitbook/assets/logo.png',
  }

  if (location.hostname === 'app.gitbook.com') {
    // In dashboard?
    if (document.querySelector('[class*=--dashboardBody-')) {
      const dashName = document.querySelector(
        '[class*=--dashboardMenu-] [class*=--headerText-]',
      )
      presenceData.details = dashName
        ? `In ${dashName.textContent}'s Dashboard`
        : 'In a Dashboard'
      actionTimestamp = null
    }
    else {
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Editing'

      const docName = document.querySelector('[class*=\'logoText-\'] span')
      const pageName = document.querySelector('[class*=--navButtonOpened-] span')

      actionTimestamp ??= Date.now()
      if (docName)
        presenceData.details = `Editing ${docName.textContent}`
      if (pageName)
        presenceData.state = `on ${pageName.textContent}`
      presenceData.startTimestamp = actionTimestamp
    }
  }
  else {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Viewing'

    const docName = document.querySelector('[class*=\'logoText-\'] span')
    const pageName = document.querySelector('[class*=--navButtonOpened-] span')

    actionTimestamp ??= Date.now()
    if (docName)
      presenceData.details = `Viewing ${docName.textContent}`
    if (pageName)
      presenceData.state = `on ${pageName.textContent}`
    presenceData.startTimestamp = actionTimestamp
  }

  // If data doesn't exist clear else set activity to the presence data
  if (!presenceData.details) {
    // Clear tray
    presence.setActivity() // Clear activity
  }
  else {
    presence.setActivity(presenceData)
  }
})
