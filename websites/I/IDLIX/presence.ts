import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      buttonWatchVideo: 'general.buttonWatchVideo',
      buttonViewPage: 'general.buttonViewPage',
      buttonWatchMovie: 'general.buttonWatchVideo',
      paused: 'general.paused',
      play: 'general.playing',
      search: 'general.searchFor',
      viewHome: 'general.viewHome',
      viewShow: 'general.viewShow',
    },
  )
}
enum ActivityAssets {
  Ad = 'https://cdn.rcd.gg/PreMiD/websites/I/IDLIX/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/IDLIX/assets/logo.png',
}
let current: number
let duration: number
let paused: boolean
let isVideo: boolean
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('iFrameData', (data: unknown) => {
  ({ current, duration, paused, isVideo } = data as {
    current: number
    duration: number
    paused: boolean
    isVideo: boolean
  })
})

function videoDetails(presenceData: PresenceData, href: string) {
  delete presenceData.startTimestamp
  const title = document.querySelector('[class="pag_episodes"]')?.querySelectorAll('a')?.[1]?.getAttribute('title') ?? document.querySelector('[class="epih1"]')?.textContent ?? document.querySelector('[class="data"]')?.firstElementChild?.textContent ?? document.querySelector('[property="og:title"]')?.getAttribute('content')?.replace(' - Subtitle Indonesia - IDLIX', '') ?? document.querySelector('title')?.textContent?.split('- Subtitle Indonesia - IDLIX')?.[0] ?? 'Unknown'

  presenceData.largeImageKey = document
    .querySelector('[class="poster"]')
    ?.querySelector('img')
    ?.getAttribute('src')
    ?? document
      .querySelector('[class="owl-wrapper"]')
      ?.querySelector('img')
      ?.getAttribute('src')
      ?? ActivityAssets.Logo
  if (!Number.isNaN(duration)) {
    presenceData.details = title
    presenceData.state = document.querySelector('[class="epih3"]')?.textContent ?? ''
    presenceData.buttons = [
      {
        label: strings.buttonWatchVideo,
        url: href,
      },
    ]
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? strings.paused : strings.play
    if (!paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(current, duration)
    }
  }
  else {
    presenceData.details = strings.viewShow
    presenceData.state = title
    presenceData.buttons = [
      {
        label: strings.buttonViewPage,
        url: href,
      },
    ]
  }
  return presenceData
}

presence.on('UpdateData', async () => {
  // Check to see if the site name includes idlix if not then return
  const { hostname } = document.location
  if (
    !document
      .querySelector('[property="og:site_name"]')
      ?.getAttribute('content')
      ?.toLowerCase()
      .includes('idflix')
      && !document
        .querySelector('title')
        ?.textContent
        ?.toLowerCase()
        .includes('idlix')
        && !hostname?.toLowerCase().includes('idlix')
        && !hostname?.toLowerCase().includes('idflix')
  ) {
    return
  }
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
    name: 'IDLIX',
  }
  const { pathname, href } = document.location
  const [newLang, privacy, buttons, covers] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const category = document.querySelector('[class="content right full"]')?.querySelector('h2')?.textContent?.toLowerCase() ?? document.querySelector('[class="content right full"]')?.querySelector('h1')?.textContent?.toLowerCase()
  const heading = document
    .querySelector('[class="heading-archive"]')
    ?.textContent
    ?.toLowerCase()
  const search = document.querySelector<HTMLInputElement>('input[type="text"]')
  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  if (privacy) {
    presenceData.details = strings.browse
    presence.setActivity(presenceData)
    return
  }
  if (search?.value || pathname.includes('search')) {
    presenceData.details = strings.search
    presenceData.state = search?.value || document.querySelector('body > div.container.main-container.min-vh-100.px-3 > h3')?.textContent?.split('"')[1] || 'Nothing'
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }

  switch (pathname.split('/')[1]) {
    case '': {
      presenceData.details = strings.viewHome
      break
    }

    case 'episodes':
    case 'episode':
    case 'tvseries':
    case 'movie': {
      videoDetails(presenceData, href)
      break
    }
    case 'trending':
    case 'genre': {
      presenceData.buttons = [
        {
          label: 'Browse',
          url: href,
        },
      ]
      if (pathname === 'genre') {
        presenceData.details = 'Browsing all genres'
      }
      else {
        presenceData.details = `Viewing shows in the ${
          heading ?? 'trending'
        } genre`
      }

      break
    }
    default: {
      if (isVideo) {
        videoDetails(presenceData, href)
      }
      else if (heading && category) {
        presenceData.details = `Viewing ${heading} ${category}`
        presenceData.state = `Viewing page ${
          document.querySelector('[class="current"]')?.textContent
        }`
        presenceData.buttons = [
          {
            label: strings.buttonViewPage,
            url: href,
          },
        ]
      }
      else {
        presenceData.details = strings.browse
      }
    }
  }
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (!covers && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
