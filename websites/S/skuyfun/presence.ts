import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1369034572859445399'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'favicon'
}

presence.on('UpdateData', async () => {
  const title = document.querySelector('title')?.textContent?.trim()
  const episode = document.querySelector('h4 span:nth-child(2)')?.textContent
  const imgElement = document.querySelector('img.rounded-md') as HTMLImageElement

  let presenceData

  if (title && episode && imgElement) {
    presenceData = {
      type: ActivityType.Watching,
      details: `Watching: ${title}`,
      state: `Episode: ${episode}`,
      largeImageKey: imgElement.src, // harus pakai src, bukan elemen DOM langsung
      smallImageKey: Assets.Play,
      smallImageText: 'You hovered me, and what now?',
      startTimestamp: browsingTimestamp,
      endTimestamp: browsingTimestamp + 1800
    }
  } else {
    presenceData = {
      type: ActivityType.Watching,
      details: 'Browsing skuy.fun',
      state: "Chillin' on the web",
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: Assets.Play,
      smallImageText: 'Browse with me!',
      startTimestamp: browsingTimestamp,
      endTimestamp: browsingTimestamp + 1800
    }
  }

  console.warn(presenceData)

  presence.setActivity(presenceData)
})
