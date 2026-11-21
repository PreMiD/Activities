import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1495498276705665075',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Animim/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const currentPage = document.location.href
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.logo,
    smallImageKey: Assets.Viewing,
    smallImageText: 'Göz Atıyor',
    details: 'Animim',
    state: 'Göz Atıyor',
    startTimestamp: browsingTimestamp,
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

      if (jsonData.video?.available) {
        if (jsonData.video.paused === false && jsonData.startTimestamp) {
          presenceData.startTimestamp = Math.floor(jsonData.startTimestamp / 1000)
          if (jsonData.endTimestamp) {
            presenceData.endTimestamp = Math.floor(jsonData.endTimestamp / 1000)
          }
        }
        else {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }
      else {
        presenceData.startTimestamp = browsingTimestamp
        delete presenceData.endTimestamp
      }

      // Prioritize series anime cover, fallback to logo
      if (jsonData.anime?.cover) {
        presenceData.largeImageKey = jsonData.anime.cover
      }
      else if (jsonData.largeImageKey && jsonData.largeImageKey !== 'logo') {
        presenceData.largeImageKey = jsonData.largeImageKey
      }
      else {
        presenceData.largeImageKey = ActivityAssets.logo
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

      // Suppress buttons on the main homepage
      if (jsonData.buttons && new URL(currentPage).pathname !== '/') {
        presenceData.buttons = jsonData.buttons
      }
    }
  }
  catch (error) {
    console.error('Error:', error)
  }

  presence.setActivity(presenceData)
})
