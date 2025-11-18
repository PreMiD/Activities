import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1341778656762134538',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://litomore.me/images/listenhub-favicon.png',
}

const playingButtonQuery = '[d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2M8.75 8.5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1zm5.5 0a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z"]'

presence.on('UpdateData', async () => {
  const documentTitle = document.title
  const playingTitle = document.querySelector('.glass .truncate')?.textContent
  const isPlaying = document.querySelector(playingButtonQuery) !== null

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (isPlaying && playingTitle) {
    presenceData.details = 'Listening'
    presenceData.state = playingTitle
    presenceData.smallImageKey = Assets.Play
  }
  else if (documentTitle) {
    presenceData.details = 'Browsing'
    presenceData.state = documentTitle
  }

  presence.setActivity(presenceData)
})
