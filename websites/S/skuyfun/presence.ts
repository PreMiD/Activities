import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1369034572859445399',
})

const LOGO_IMAGE_URL = 'https://i.ibb.co.com/cXMm9zNY/logo.png' // largeImage Logo if title not detected

presence.on('UpdateData', async () => {
  const title = document.querySelector('h1.text-base')?.textContent?.trim()
  const episode = document.querySelector('p.text-sm.font-semibold.text-white')?.textContent
  const imgElement = document.querySelector<HTMLImageElement>('img.object-cover')

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
