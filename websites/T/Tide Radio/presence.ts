import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1373642276890218517',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: document.querySelector<HTMLImageElement>('.avatar')?.src || 'https://i.imgur.com/kWk2OCi.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }

  presenceData.details = `${
    document.querySelector('.song-artist')?.textContent
  } - ${document.querySelector('.song-title')?.textContent}`
  presenceData.state = document.querySelector('#upcomingContainer > div:first-child > a > div:nth-child(2) > div:first-child')?.textContent ?? 'Non-stop Hits'
  presenceData.smallImageKey = 'https://i.imgur.com/tBNdLJP.png'
  presenceData.smallImageText = 'Tide Radio'

  presence.setActivity(presenceData)
})
