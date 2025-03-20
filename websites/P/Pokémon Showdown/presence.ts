const presence = new Presence({
  clientId: '808762003476709406',
})

let elapsed: number | null = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Pok%C3%A9mon%20Showdown/assets/logo.png',
  }
  const path = document.location.pathname
  if (path === '/') {
    presenceData.details = 'Viewing Homepage'
    elapsed = null
  }
  else if (path.startsWith('/teambuilder')) {
    presenceData.details = 'Building a Team'
    elapsed = null
  }
  else if (path.startsWith('/ladder')) {
    presenceData.details = 'Viewing a Ladder'
    elapsed = null
  }
  else if (path.includes('battle')) {
    presenceData.details = document.querySelector('a.roomtab i.text')?.textContent
    presenceData.state = document.querySelector(
      'a.roomtab.button.cur span',
    )?.textContent
    presenceData.buttons = [
      {
        label: 'Spectate',
        url: document.baseURI,
      },
    ]
    if (elapsed === null)
      elapsed = Math.floor(Date.now() / 1000)

    presenceData.startTimestamp = elapsed
  }
  else {
    presenceData.details = 'Somewhere on-site'
    elapsed = null
  }
  presence.setActivity(presenceData)
})
