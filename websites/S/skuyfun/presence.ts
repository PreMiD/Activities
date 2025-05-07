import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1369034572859445399',
})

enum ActivityAssets {
  Logo = 'favicon',
}

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
      details: 'Browsing skuy.fun',
      state: 'Chillin\' on the web',
      largeImageKey: ActivityAssets.Logo,
    }
  }

  console.warn(presenceData)

  presence.setActivity(presenceData)
})
