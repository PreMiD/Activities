import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1369034572859445399',
})

const LOGO_IMAGE_URL = 'https://cdn.rcd.gg/PreMiD/websites/S/skuyfun/assets/logo.png' // largeImage Logo if title not detected

presence.on('UpdateData', async () => {
  const title = document.querySelector('title')?.textContent?.trim()
  const episode = document.querySelector('h4 span:nth-child(2)')?.textContent
  const imgElement = document.querySelector<HTMLImageElement>('img.rounded-md')

  let presenceData

  if (title && episode && imgElement) {
    presenceData = {
      type: ActivityType.Watching,
      details: `Watching: ${title}`,
      state: `Episode: ${episode}`,
      largeImageKey: imgElement.src,
    }
  }
  else {
    presenceData = {
      type: ActivityType.Watching,
      details: 'Browsing...',
      largeImageKey: LOGO_IMAGE_URL,
    }
  }

  presence.setActivity(presenceData)
})
