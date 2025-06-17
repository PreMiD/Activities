import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1383644853589643385',
})
const titleInfo: any = { }
presence.on('UpdateData', async () => {
  const data: PresenceData = {
    type: ActivityType.Watching,
    name: 'DarkWave - Looking..',
    largeImageKey: 'https://i.ibb.co/Xrbhkrm9/image-1.png',
  }

  const video = document.querySelector<HTMLVideoElement>('video')
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

    const videoName = document.getElementById('videoTitle')?.textContent
    const videoTitle = document.getElementById('videoName')?.textContent

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
