import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1365187193462849576',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Medal/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Play,
  }
  const path = document.location.pathname.split('/').slice(1)
  switch (true) {
    case path[0] === 'u': {
      // class names in this site are too random, possibly might break in a future site update
      const username = document.querySelector('.diFwgX')?.textContent || 'a user'
      presenceData.details = `Viewing ${username}'s profile`
      break
    }
    case !path[0]: {
      presenceData.state = 'Browsing Home'
      break
    }
    case path[0] === 'games' && path[2] === 'clips': {
      (presenceData as PresenceData).type = ActivityType.Watching
      const video = document.querySelector<HTMLVideoElement>('[id^=\'mvp-video\'] video')
      if (!video)
        return presence.setActivity(presenceData)
      if (!video.paused) {
        const [startTimestamp, endTimestamp] = getTimestamps(video.currentTime, video.duration)
        presenceData.startTimestamp = startTimestamp
        presenceData.endTimestamp = endTimestamp
      }
      const username = document.querySelector('.cLcgHG')?.textContent || 'a clip'
      presenceData.details = `Watching ${username}`
      const game = document.querySelector('.cueMjT')?.textContent?.trim() || 'Unknown Game'
      const videoName = document.querySelector('.bTwQIe')?.textContent?.trim() || null
      presenceData.state = `${game}${videoName ? `: ${videoName}` : ''}`
      break
    }
  }
  presence.setActivity(presenceData)
})
