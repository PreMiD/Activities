import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1396506033890922496',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/rFXu6Em.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    // smallImageKey: Assets.Play,
    endTimestamp: undefined,
    details: 'Viewing hdfilmcehennemi.nl',
  }

  const curURL = document.location.href
  if(document.location.pathname === '/') {
    presenceData.details = 'Viewing home page'
  }
  else {
    let mainTitle: string | null = null
    let germanTitle: string | null = null
    let year: string | null = null

    const h1 = document.querySelector("h1.section-title");
    if (h1 instanceof HTMLElement) {
      const first = h1.firstChild;
      const small = h1.querySelector("small");

      mainTitle = first?.textContent?.trim().replace(/ izle$/, "") ?? null

      const smallText = small?.textContent?.trim() ?? null
      if (smallText) {
        const match = smallText.match(/^(.*)\s\((\d{4})\)$/)
        if (match) {
          germanTitle = match[1] ?? null
          year = match[2] ?? null
        }
      }
    }

    // I tried many method but still cannot get the video element 
    
    // const el = document.querySelector('video')
    // if (el instanceof HTMLVideoElement) {
    //   const timestamps = getTimestamps(el.currentTime, el.duration)
    //   const isPlaying = !el.paused && !el.ended && el.readyState > 2
    //   if (isPlaying) {
    //     presenceData.smallImageKey = Assets.Play
    //   }
    //   else {
    //     presenceData.smallImageKey = Assets.Pause
    //   }
    //   presenceData.startTimestamp = timestamps[0]
    //   presenceData.endTimestamp = timestamps[1]
    // }

    const detailsText = `${mainTitle} · ${germanTitle} · ${year}`
    presenceData.details = detailsText
    presenceData.buttons = [
      {
        label: 'Watch Together',
        url: curURL,
      },
    ]
  }
  presence.setActivity(presenceData)
})
