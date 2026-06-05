import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1510563692952158248',
})

presence.on('UpdateData', async () => {
  if (location.pathname === '/in/home') {
    presence.setActivity({
      type: ActivityType.Watching,
      details: 'Browsing',
      state: 'Home',
      largeImageKey: 'https://i.ibb.co/Gfs3F52W/unnamed-1.png',
      largeImageText: 'JioHotstar',
    })

    return
  }

  const video = document.querySelector<HTMLVideoElement>("video");
  if (!video) {
    presence.clearActivity()
    return
  }

  const title
    = document.querySelector('h1')?.textContent?.trim()
      ?? 'JioHotstar'

  const text = document.body.textContent ?? ''

  const episode
    = text.match(/S\d+\s*E\d+/i)?.[0]

  const poster
    = document.querySelector(
      'meta[property="twitter:image"]',
    )?.getAttribute('content')

  const activity: PresenceData = {
    type: ActivityType.Watching,
    details: title,
    state: episode ?? 'Watching',
    largeImageKey: poster || 'JioHotstar',
    largeImageText: title,
  }

  if (episode) {
    activity.state = episode
  }

  const startTimestamp
    = Math.floor(Date.now() / 1000) - Math.floor(video.currentTime)

  const endTimestamp
    = startTimestamp + Math.floor(video.duration)

  if (!video.paused) {
    activity.startTimestamp = startTimestamp
    activity.endTimestamp = endTimestamp

    activity.smallImageKey = Assets.Play
    activity.smallImageText = 'Playing'
  }
  else {
    activity.smallImageKey = Assets.Pause
    activity.smallImageText = 'Paused'
  }

  presence.setActivity(activity)
})
