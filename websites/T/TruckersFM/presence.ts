const presence = new Presence({
  clientId: '640914619082211338',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: (document.querySelector('.album-art') as HTMLImageElement)?.src || 'https://i.imgur.com/ZqheZoX.png',
    startTimestamp: browsingTimestamp,
    type: 2,
  }

  presenceData.details = `${
    document.querySelector('.player-artist-text')?.textContent
  } - ${document.querySelector('.player-title-text')?.textContent}`
  presenceData.state = document.querySelector('.live-name')?.textContent ?? 'AutoDJ'
  presenceData.smallImageKey = 'https://i.imgur.com/ZqheZoX.png'
  presenceData.smallImageText = 'TruckersFM'

  presenceData.buttons = [
    {
      label: 'Listen to TruckersFM',
      url: 'https://truckers.fm',
    },
  ]

  const spotifyUrl = document
    .querySelector('.player-artist-text a')
    ?.getAttribute('href')
  if (spotifyUrl) {
    presenceData.buttons.push({
      label: 'Listen on Spotify',
      url: spotifyUrl,
    })
  }

  presence.setActivity(presenceData)
})
