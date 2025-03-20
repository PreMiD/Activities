import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '936985014560755753',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let video = {
  paused: true,
  timeLeft: '',
}
let title = ''

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Wcostream/assets/logo.png',
}
presence.on(
  'iFrameData',
  (inc: unknown) => {
    const data = inc as { paused: boolean, timeLeft: string, titleV: string }
    if (data.paused || data.timeLeft)
      video = data
    else title = data.titleV
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Browsing...',
    startTimestamp: browsingTimestamp,
  } as PresenceData
  const { pathname } = document.location
  const [timestamps, cover, buttons] = await Promise.all([
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])
  const directVideo = document.querySelector<HTMLVideoElement>('video')

  if (video.timeLeft !== '') {
    if (!title) {
      title = document.querySelector('[itemprop="partOfSeries"]')?.textContent
        ?? document.querySelector('.video-title')?.textContent
        ?? document.querySelector('.entry-title')?.textContent
        ?? document.title.split('|')[0]!
    }
    presenceData.details = 'Watching:'
    presenceData.state = title?.split('Episode')?.[0]

    if (document.querySelector<HTMLImageElement>('[class*="s-post-image"]')) {
      // This is where they store their thumbnails/posters
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('[class*="s-post-image"]')
        ?.src ?? ActivityAssets.Logo
    }
    delete presenceData.startTimestamp
    const timeLeft = presence.timestampFromFormat(video.timeLeft)
    // This is necessary to only use endTimestamp when video has finished loading
    if (Date.now() / 1000 >= Date.now() / 1000 + timeLeft)
      video.paused = true

    if (!video.paused)
      presenceData.endTimestamp = Date.now() / 1000 + timeLeft

    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'
    presenceData.buttons = [{ label: 'Watch Episode', url: document.URL }]
  }
  else if (directVideo) {
    presenceData.smallImageKey = directVideo.paused
      ? Assets.Pause
      : Assets.Play
    presenceData.smallImageText = directVideo.paused
      ? 'Paused'
      : 'Playing back'

    presenceData.details = 'Watching:'
    presenceData.state = document.querySelector('.jw-title-primary.jw-reset')?.textContent
      ?? document.querySelector('[itemprop="partOfSeries"]')?.textContent
      ?? document.querySelector('.video-title')?.textContent
      ?? document.querySelector('.entry-title')?.textContent

    presenceData.buttons = [{ label: 'Watch Episode', url: document.URL }]

    if (!directVideo.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(directVideo)
    }
  }
  else if (pathname === '/') {
    presenceData.details = 'Home page'
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = 'Searching...'
    presenceData.smallImageKey = Assets.Search
  }

  if (!cover && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (
    !timestamps
    && (presenceData.endTimestamp || presenceData.startTimestamp)
  ) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (presenceData.endTimestamp)
    presenceData.type = ActivityType.Watching
  presence.setActivity(presenceData)
})
