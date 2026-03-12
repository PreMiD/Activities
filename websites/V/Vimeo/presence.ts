import { Assets } from 'premid'

const presence = new Presence({
  clientId: '808762696023146578',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

presence.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>(
    '.vp-video-wrapper .vp-video video',
  )
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vimeo/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Browsing...'
  }
  else if (video && !Number.isNaN(video.duration)) {
    const title = document.querySelector('._1fHNK')?.textContent
    const uploader = document.querySelector('.js-user_link')?.textContent;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )
    presenceData.details = title
    presenceData.state = uploader
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/V/Vimeo/assets/logo.png'
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).pause
      : (await strings).play

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (title && uploader)
      presence.setActivity(presenceData, !video.paused)
  }
  else {
    presenceData.details = 'Browsing...'

    presence.setActivity(presenceData)
  }
})
