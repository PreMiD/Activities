const presence = new Presence({
  clientId: '864631234339930132',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let username: HTMLElement | null

presence.on('UpdateData', async () => {
  const privacy: boolean = await presence.getSetting<boolean>('privacy')
  const showTimestamp: boolean = await presence.getSetting<boolean>('timestamp')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GeForce%20NOW/assets/logo.png',
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GeForce%20NOW/assets/0.png',
    startTimestamp: browsingTimestamp,
  }

  if (!showTimestamp)
    delete presenceData.startTimestamp

  if (document.location.pathname === '/mall/') {
    username = document.querySelector('.username')
    presenceData.details = 'Browsing GeForce NOW'
  }
  else if (
    document.location.pathname === '/games'
    && !document.querySelector('gfn-evidence-panel-tile')
  ) {
    presenceData.details = `Playing ${document.title.replace(
      ' on GeForce NOW',
      '',
    )}`
  }
  else if (document.location.pathname === '/games') {
    presenceData.details = `Viewing ${
      (
        document.querySelector(
          'gfn-evidence-panel-tile .evidence-panel-title span',
        ) as HTMLElement
      ).textContent
    }`
  }
  else {
    presenceData.details = 'Unknown Page'
  }

  if (username && !privacy) {
    presenceData.smallImageText = username.textContent
  }
  else {
    delete presenceData.smallImageText
    delete presenceData.smallImageKey
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
