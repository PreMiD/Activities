import { Assets } from 'premid'

const presence = new Presence({
  clientId: '877353878427959317',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
  search: 'general.searching',
})

let elapsed: number, oldUrl: string

presence.on('UpdateData', async () => {
  const video = document.querySelector<HTMLVideoElement>('video')
  const { href } = window.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AMC%2B/assets/logo.png',
  }

  if (href !== oldUrl) {
    oldUrl = href
    elapsed = Math.floor(Date.now() / 1000)
  }

  // Default details
  presenceData.details = 'Browsing catalogue...'

  presenceData.startTimestamp = elapsed

  if (video) {
    const slot2 = document.querySelector('.slot2')
    const slot3 = document.querySelector('.slot3')
    const isSeries = slot2 && slot3

    presenceData.details = document.querySelector('.slot1')?.textContent

    if (isSeries) {
      // A series has slot1 (the series name), slot2 (the episode)
      // and slot3 (the episode name)
      presenceData.details += `: ${slot2.textContent}`
      presenceData.state = slot3.textContent
    }
    else {
      // A movie only has slot1 (the title)
      presenceData.state = 'Watching movie'
    }

    const live = video.duration === Infinity

    presenceData.smallImageText = live
      ? (await strings).live
      : video.paused
        ? (await strings).pause
        : (await strings).play

    presenceData.smallImageKey = live
      ? Assets.Live
      : video.paused
        ? Assets.Pause
        : Assets.Play

    if (live) {
      presenceData.startTimestamp = elapsed
    }
    else if (!video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    }

    if (!isSeries && video.paused)
      presenceData.state = 'Paused'
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})
