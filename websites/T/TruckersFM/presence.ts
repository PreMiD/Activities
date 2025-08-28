import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '640914619082211338',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: document.querySelector<HTMLImageElement>('#song-art')?.src || 'https://cdn.rcd.gg/PreMiD/websites/T/TruckersFM/assets/logo.png',
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
  presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/T/TruckersFM/assets/logo.png'
  presenceData.smallImageText = 'TruckersFM'

  presence.setActivity(presenceData)
})
