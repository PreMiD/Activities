import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1341778656762134538',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/ListenHub/assets/logo.png',
}

const possibleLocales = ['zh']
const playingButtonQuery = '[d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2M8.75 8.5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1zm5.5 0a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z"]'

presence.on('UpdateData', async () => {
  const args = document.location.pathname.split('/')
  const arg1 = args[1]
  if (arg1 && possibleLocales.includes(arg1)) {
    args.splice(1, 1)
  }

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
  else if (args[1] === 'explore' || args[1] === 'library') {
    presenceData.details = 'Exploring'

    if (args[2]) {
      const category = decodeURIComponent(args[2])
      const titleCasedCategory = category.slice(0, 1).toUpperCase() + category.slice(1)
      presenceData.state = `Category: ${titleCasedCategory}`
    }
  }
  else if ((args[1] === 'episode' || args[1] === 'storybook') && args[2]) {
    const title = document.querySelector('h1')?.textContent
    presenceData.details = `Viewing ${args[1]}`
    if (title) {
      presenceData.state = title
    }
  }

  else if (args[1] === 'pricing') {
    presenceData.details = 'Viewing Pricing'
  }
  else if (args[1] === 'settings') {
    presenceData.details = 'Adjusting Settings'
  }
  else if (documentTitle) {
    presenceData.details = 'Browsing'
    presenceData.state = documentTitle
  }

  presence.setActivity(presenceData)
})
