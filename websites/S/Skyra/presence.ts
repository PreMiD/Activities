import { Assets } from 'premid'

const presence = new Presence({
  clientId: '266624760782258186',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Skyra/assets/logo.png',
  }

  if (document.location.hostname === 'skyra.pw') {
    presenceData.startTimestamp = browsingTimestamp

    if (document.location.pathname.includes('/guilds/')) {
      presenceData.details = 'Managing server settings'
      const title = document.querySelector('[data-premid=\'server-title\']')
      presenceData.state = `server: ${title?.textContent}`
      presenceData.smallImageKey = Assets.Writing
    }
    else if (document.location.pathname.includes('/music/')) {
      presenceData.details = 'Spinning the turntables'
      const title = document.querySelector('[data-premid=\'music-title\']')

      if (title)
        presenceData.state = `Currently Playing: ${title.textContent}`

      presenceData.smallImageKey = Assets.Play
    }
    else if (document.location.pathname === '/commands') {
      presenceData.details = 'Browsing Skyra\'s commands'
      presenceData.smallImageKey = Assets.Reading
    }
    else {
      presenceData.details = 'Checking out Skyra'
      presenceData.smallImageKey = Assets.Reading
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
