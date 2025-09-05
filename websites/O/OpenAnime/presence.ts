import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1364261478470782996',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  logo = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenAnime/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const currentPage = document.location.href
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.logo,
    smallImageKey: Assets.Play,
    state: null,
    details: 'Göz atıyor',
  }

  let jsonData: any = null
  try {
    const announcer = document.querySelector('premid-announcer')
    const announcerText = announcer?.textContent

    if (announcerText) {
      jsonData = JSON.parse(announcerText)

      if (jsonData.details)
        presenceData.details = jsonData.details
      if (jsonData.state)
        presenceData.state = jsonData.state

      if (jsonData.video) {
        if (jsonData.video.paused === false && jsonData.startTimestamp) {
          presenceData.startTimestamp = Math.floor(jsonData.startTimestamp / 1000)
        }
        else {
          delete presenceData.startTimestamp
        }
      }
      else {
        presenceData.startTimestamp = browsingTimestamp
      }

      if (jsonData.largeImageKey) {
        if (jsonData.largeImageKey === 'logo') {
          presenceData.largeImageKey = ActivityAssets.logo
        }
        else {
          presenceData.largeImageKey = jsonData.largeImageKey
        }
      }

      if (jsonData.smallImageKey && typeof jsonData.smallImageKey === 'string') {
        const formattedKey = jsonData.smallImageKey.charAt(0).toUpperCase() + jsonData.smallImageKey.slice(1)
        if (formattedKey in Assets) {
          presenceData.smallImageKey = Assets[formattedKey as keyof typeof Assets]
        }
        else {
          presenceData.smallImageKey = jsonData.smallImageKey
        }
      }

      if (jsonData.smallImageText)
        presenceData.smallImageText = jsonData.smallImageText

      if (jsonData.buttons && currentPage !== 'https://openani.me/') {
        presenceData.buttons = jsonData.buttons
      }
    }
  }
  catch (error) {
    console.error('Error:', error)
  }

  presence.setActivity(presenceData)
})
