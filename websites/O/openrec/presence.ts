import { Assets } from 'premid'

const presence = new Presence({
  clientId: '612652426180296849',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/openrec/assets/logo.jpg',
}

presence.on('UpdateData', async () => {
  const live = !!document.querySelector('.MovieTitle__Title-s181dg2v-4')
  const video = document.querySelector<HTMLVideoElement>(
    live ? '.openrec-video' : '#capture-play',
  )
  if (video && !Number.isNaN(video.duration)) {
    const title = document.querySelector<HTMLElement>(
      live
        ? '.MovieTitle__Title-s181dg2v-4'
        : '.Component__CaptureTitle-s1nip9ch-16',
    )
    const game = document.querySelector<HTMLElement>(
      live ? '.TagButton__Button-otjf40-0' : '.text-hover',
    )

    presenceData.details = title ? title.textContent : 'Title not found...'
    presenceData.state = game ? game.textContent : 'Game not found...'
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/openrec/assets/logo.jpg'
    presenceData.smallImageKey = live
      ? Assets.Live
      : video.paused
        ? Assets.Pause
        : Assets.Play
    presenceData.smallImageText = live
      ? (await strings).live
      : video.paused
        ? (await strings).pause
        : (await strings).play;
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )

    if (video.paused || live) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (title && game)
      presence.setActivity(presenceData, !video.paused)
  }
  else {
    presence.setActivity({
      details: 'Browsing..',
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/openrec/assets/logo.jpg',
    })
  }
})
