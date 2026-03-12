import { Assets } from 'premid'

const presence = new Presence({
  clientId: '719865208515854369',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
  browsing: 'general.browsing',
})

let video = {
  current: 0,
  duration: 0,
  paused: true,
  isLive: false,
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AIS%20Play/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  if (path === '/portal/search') {
    return presence.setActivity({
      details: 'Searching for :',
      state: document.location.search.replace('?q=', ''),
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: Assets.Search,
      smallImageText: 'Searching...',
    })
  }

  if (path.includes('/portal/get_section')) {
    return presence.setActivity({
      details: 'Browsing for :',
      state: document.querySelector('.default-title')?.textContent || '',
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AIS%20Play/assets/logo.png',
    })
  }

  const presenceData: PresenceData = { largeImageKey: ActivityAssets.Logo }
  if (Number.isNaN(video.duration) || video.duration <= 0) {
    presenceData.details = 'Browsing...'

    return presence.setActivity(presenceData)
  }

  const timestamps = presence.getTimestamps(
    Math.floor(video.current),
    Math.floor(video.duration),
  )
  const Info = document.querySelector('.default-title') || document.querySelector('.live-text-text')
  let episode

  if (Info?.textContent?.includes('ตอนที่')) {
    const info = Info.textContent.split('ตอนที่')
    episode = info.pop()

    episode = `ตอนที่ ${episode}`
    presenceData.state = episode;
    [presenceData.details] = info
  }
  else if (Info?.textContent) {
    presenceData.details = Info.textContent
  }

  presenceData.smallImageKey = video.paused
    ? Assets.Pause
    : video.isLive
      ? Assets.Live
      : Assets.Play
  presenceData.smallImageText = video.paused
    ? (await strings).pause
    : video.isLive
      ? (await strings).live
      : (await strings).play

  if (!video.paused && !video.isLive) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
  }
  else if (!video.paused && video.isLive) {
    [presenceData.startTimestamp] = timestamps
  }
  else {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
