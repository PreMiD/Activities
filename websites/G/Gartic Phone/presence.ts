const presence = new Presence({
  clientId: '803366782722244638',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Gartic%20Phone/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const privacyDraw = await presence.getSetting<boolean>('privacyDraw')
  const privacyAlbum = await presence.getSetting<boolean>('privacyAlbum')

  if (window.location.hostname.includes('garticphone')) {
    if (window.location.pathname.endsWith('lobby')) {
      presenceData.details = 'Awaiting the launch of the game...'
    }
    else if (window.location.pathname.endsWith('start')) {
      presenceData.details = 'Start a story'
    }
    else if (window.location.pathname.endsWith('draw')) {
      if (privacyDraw) {
        presenceData.details = 'Drawing...'
      }
      else {
        presenceData.details = 'Drawing:'
        presenceData.state = `${
          document.querySelector('.jsx-1934821697 h3')?.textContent
        }`
      }
    }
    else if (window.location.pathname.endsWith('write')) {
      presenceData.details = 'Writing...'
    }
    else if (window.location.pathname.endsWith('book')) {
      if (privacyAlbum) {
        presenceData.details = 'Look at the album'
      }
      else {
        presenceData.details = 'Look at the album of:'
        presenceData.state = `${
          document.querySelector('.jsx-1186471753 span')?.textContent
        }`
      }
    }
    else {
      presenceData.details = 'Browsing the home page'
      delete presenceData.endTimestamp
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
