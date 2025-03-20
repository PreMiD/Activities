import { Assets } from 'premid'

const presence = new Presence({
  clientId: '934826046824542279',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let video = {
  duration: '',
  currentTime: '',
  live: false,
  paused: true,
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/Behance/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Browsing',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const [image, buttons] = await Promise.all([
    presence.getSetting<boolean>('image'),
    presence.getSetting<boolean>('buttons'),
  ])
  if (pathname.startsWith('/gallery')) {
    presenceData.details = document.querySelector<HTMLSpanElement>('figcaption > span')?.textContent
    presenceData.smallImageKey = Assets.Reading
    if (
      document.querySelector<HTMLSpanElement>(
        'figcaption > div > a > div > div.Popover-activator-14J.Miniprofile-activator-1QJ > span',
      )
    ) {
      presenceData.state = document.querySelector<HTMLSpanElement>(
        'figcaption > div > a > div > div.Popover-activator-14J.Miniprofile-activator-1QJ > span',
      )?.textContent
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        'div.Popover-activator-14J.Miniprofile-activator-1QJ > span > a > div > img',
      )?.src ?? ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: 'View Work',
          url: document.URL,
        },
        {
          label: 'View Artist',
          url: document.querySelector<HTMLAnchorElement>('figcaption > div > a')!.href,
        },
      ]
    }
    else {
      presenceData.state = 'Multiple Owners'
      presenceData.buttons = [
        {
          label: 'View Work',
          url: document.URL,
        },
      ]
    }
  }
  else if (pathname.startsWith('/galleries')) {
    presenceData.details = 'Discovering Galleries'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      '#site-content div > div > h1',
    )?.textContent
    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.querySelector<HTMLHeadingElement>(
      '#site-content div.ProfileCard-header-2wU > h1',
    )
  ) {
    presenceData.details = 'Viewing Profile'
    presenceData.state = document.querySelector<HTMLHeadingElement>(
      '#site-content div.ProfileCard-header-2wU > h1',
    )?.textContent
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
      '#site-content div > div > div > img',
    )?.src ?? ActivityAssets.Logo
    presenceData.buttons = [{ label: 'View Profile', url: document.URL }]
  }
  else if (pathname.startsWith('/search')) {
    const searchContent = document.querySelector<HTMLSpanElement>(
      '#site-content ul > li:nth-child(1) > a > span',
    )
    if (!searchContent) {
      presenceData.details = 'Searching...'
    }
    else {
      presenceData.details = 'Searching for:'
      presenceData.state = searchContent.textContent
    }
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/videos')) {
    presenceData.details = document.querySelector<HTMLHeadingElement>(
      'div.Stream-titleContainer-1D_ > h1',
    )?.textContent
    presenceData.state = document.querySelector<HTMLAnchorElement>(
      'div.UserInfo-main-gTU > div:nth-child(2) > a',
    )?.textContent
    presenceData.largeImageKey = document
      .querySelector('meta[name="twitter:image"]')
      ?.getAttribute('content') ?? ActivityAssets.Logo
    if (video.live) {
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
      presenceData.buttons = [
        {
          label: 'Watch Stream',
          url: document.URL,
        },
        {
          label: 'View Profile',
          url: document.querySelector<HTMLAnchorElement>(
            'div.UserInfo-main-gTU > div:nth-child(2) > a',
          )!.href,
        },
      ]
    }
    else if (video.duration && video.currentTime) {
      // Intentional `delete` for pause boolean
      delete presenceData.startTimestamp
      if (!video.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          presence.timestampFromFormat(video.currentTime),
          presence.timestampFromFormat(video.duration),
        )
      }

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'
      presenceData.buttons = [
        {
          label: 'Watch Video',
          url: document.URL,
        },
        {
          label: 'View Profile',
          url: document.querySelector<HTMLAnchorElement>(
            'div.UserInfo-main-gTU > div:nth-child(2) > a',
          )!.href,
        },
      ]
    }
  }
  else if (pathname.startsWith('/live')) {
    presenceData.details = 'Browsing Videos'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/joblist')) {
    const jobLocation = document.querySelector<HTMLParagraphElement>(
      'div.JobDetailContent-jobHeader-2Pv > p',
    )
    if (!jobLocation) {
      presenceData.details = 'Searching for a Job'
      presenceData.smallImageKey = Assets.Search
    }
    else {
      presenceData.details = 'Viewing a Job:'
      presenceData.state = jobLocation.textContent
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        'div.JobDetailContent-teamAvatar-3qv > div > a > img',
      )?.src ?? ActivityAssets.Logo
      presenceData.smallImageKey = Assets.Reading
    }
  }
  if (!image) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/B/Behance/assets/logo.png'
  }
  if (!buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
