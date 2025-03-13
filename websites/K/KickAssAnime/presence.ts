import { Assets } from 'premid'

const presence = new Presence({
  clientId: '802964241179082822',
})
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/KickAssAnime/assets/logo.png',
}

async function getStrings() {
  return presence.getStrings(
    {
      play: 'general.playing',
      pause: 'general.paused',
      viewSeries: 'general.buttonViewSeries',
      viewMovie: 'general.buttonViewMovie',
      watchEpisode: 'general.buttonViewEpisode',
      view: 'general.view',
      searching: 'general.searchFor',
      episode: 'general.episode',
      browse: 'general.browsing',
    },

  )
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let video = {
  exists: false,
  duration: 0,
  currentTime: 0,
  paused: true,
}
let lastPlaybackState: boolean = false
let playback: boolean
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
    playback = video.duration !== null

    if (lastPlaybackState !== playback) {
      lastPlaybackState = playback
      browsingTimestamp = Math.floor(Date.now() / 1000)
    }
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [buttons, newLang, cover] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<string>('lang'),
    presence.getSetting<boolean>('episode-cover'),
  ])
  const { pathname, hostname, href } = document.location
  const fullUrl = (string: string) =>
    string ? `https://${hostname}${string}` : ActivityAssets.Logo

  if (oldLang !== newLang) {
    oldLang = newLang
    strings = await getStrings()
  }
  switch (true) {
    case video.exists: {
      if (playback && !Number.isNaN(video.duration)) {
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'
        if (!video.paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
        }
        presenceData.buttons = [
          {
            label: 'Watch Video',
            url: href,
          },
        ]
      }
      delete presenceData.startTimestamp
      presenceData.details = document
        .querySelector('[name="og:title"]')
        ?.getAttribute('content')
        ?.split('-')[1]
        ?? document
          .evaluate(
            '//script[contains(., \'layout:\')]',
            document,
            null,
            XPathResult.ANY_TYPE,
            null,
          )
          ?.iterateNext()
          ?.textContent
          ?.match(/title_en:".{1,256}",/g)?.[0]
          ?.replace(/(title_en:")|(",)/g, '')
      presenceData.state = document
        .querySelector('[name="og:title"]')
        ?.getAttribute('content')
        ?.split('-')[2]
      presenceData.largeImageKey = fullUrl(
        document.querySelector('[name="og:image"]')?.getAttribute('content') ?? '',
      )
      presenceData.buttons = [
        {
          label: strings.viewSeries,
          url: href,
        },
      ]
      break
    }
    case pathname.includes('schedule'): {
      presenceData.details = strings.view
      presenceData.state = 'The schedule'
      break
    }
    case pathname.includes('recent'): {
      presenceData.details = strings.view
      presenceData.state = 'Recently added anime'
      break
    }
    case pathname.includes('popular'): {
      presenceData.details = strings.view
      presenceData.state = 'Popular anime'
      break
    }
    case pathname.includes('anime'): {
      presenceData.details = strings.view
      presenceData.state = 'All anime'
      break
    }
    case pathname.includes('trending'): {
      presenceData.details = strings.view
      presenceData.state = 'Trending anime'
      break
    }
    default: {
      presenceData.details = strings.browse
      break
    }
  }

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (!cover && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo
  presence.setActivity(presenceData)
})
