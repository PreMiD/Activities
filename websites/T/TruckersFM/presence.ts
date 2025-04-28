import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '640914619082211338',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: document.querySelector<HTMLImageElement>('.album-art')?.src || 'https://i.imgur.com/ZqheZoX.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }

  presenceData.details = `${
    document.querySelector('.player-artist-text')?.textContent
  } - ${document.querySelector('.player-title-text')?.textContent}`
  presenceData.state = document.querySelector('.live-name')?.textContent ?? 'AutoDJ'
  presenceData.smallImageKey = 'https://i.imgur.com/ZqheZoX.png'
  presenceData.smallImageText = 'TruckersFM'

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
