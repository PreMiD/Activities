const presence = new Presence({
  clientId: '749977202275123362',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Radiot%20Suomi/assets/logo.png',
  }
  if (document.location.hostname === 'www.radio-suomi.com') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = '🌐 Etusivulla'
    }
    else if (document.querySelector('.song-name')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = `📻 ${
        document.querySelector('.mdc-typography--display1')?.textContent
      }`
      presenceData.state = `🎵 ${
        document.querySelector('.song-name')?.textContent
      }`
    }
    else {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = `📻 ${
        document.querySelector('.mdc-typography--display1')?.textContent
      }`
      presenceData.state = '🎵 Ei saatavilla'
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
