import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '640914619082211338',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: (document.getElementById('song-art') as HTMLImageElement)?.src || 'https://i.imgur.com/R5xHjtR.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }

  const artistElement = document.getElementById('song-artist')
  const titleElement = document.getElementById('song-title')
  const presenterElement = document.getElementById('show-name')

  const artist = artistElement?.textContent?.trim() || 'TruckersFM'
  const title = titleElement?.textContent?.trim() || 'Loading...'
  const presenter = presenterElement?.textContent?.trim() || 'TruckersFM'

  presenceData.details = `${artist} - ${title}`
  presenceData.state = presenter
  presenceData.smallImageKey = 'https://i.imgur.com/R5xHjtR.png'
  presenceData.smallImageText = 'TruckersFM'

  presence.setActivity(presenceData)
})
