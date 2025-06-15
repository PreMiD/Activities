import { ActivityType, Assets, getTimestamps } from '../../../premid/src/index.js'

const presence = new Presence({
  clientId: '1383644853589643385',
})
const titleInfo: any = { }
presence.on('UpdateData', async () => {
  const data: PresenceData = {
    type: ActivityType.Watching,
    name: 'DarkWave - Looking..',
    buttons: [
      {
        label: 'Open DarkWave',
        url: `https://dark-wave.fr`,
      },
    ],
    largeImageKey: 'https://i.ibb.co/xtSHCx1F/logo.png',
  }

  const video = document.querySelector('video') as HTMLVideoElement
  if (video) {
    if (!video.paused) {
      const timestamps = getTimestamps(video.currentTime, video.duration)
      data.startTimestamp = timestamps[0]
      data.endTimestamp = timestamps[1]
    }
    else {
      data.smallImageKey = Assets.Pause
      data.smallImageText = 'Paused'
    }

    const videoName = document.querySelector('#app > div > div > div > div > div.w-full.absolute.bottom-0.right-0.left-0 > div.relative.z-20.p-grid-xs.pt-0 > div > div:nth-child(1) > div > div > small')?.innerHTML
    const videoTitle = document.querySelector('#app > div > div > div > div > div.w-full.absolute.bottom-0.right-0.left-0 > div.relative.z-20.p-grid-xs.pt-0 > div > div:nth-child(1) > div > div > h1')?.innerHTML

    if (videoTitle && titleInfo.title !== videoTitle) {
      titleInfo.title = videoTitle
      titleInfo.name = videoName
    }
    if (titleInfo?.title) {
      data.name = titleInfo.name ?? titleInfo.title
      data.details = titleInfo.title

      if (titleInfo.name) {
        data.state = titleInfo.name
      }
    }
  }
  data.buttons?.push({
    label: `Watch ${titleInfo.name ?? titleInfo.title}`,
    url: document.location.href,
  })
  presence.setActivity(data)
})
