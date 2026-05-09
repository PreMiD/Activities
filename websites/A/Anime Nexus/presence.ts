import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1500661007251673238',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/bSgz75K.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
let currentTime: number, duration: number, paused: boolean

const ANIME_NEXUS_URL = 'https://anime.nexus'
const ANIME_NEXUS = 'Anime Nexus'

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    watchEpisode: 'general.buttonViewEpisode',
    viewCollection: 'general.viewACategory',
    viewSeries: 'general.buttonViewSeries',
    watchingAnime: 'general.watchingAnime',
    viewProfile: 'general.viewProfile',
    viewPage: 'general.viewPage',
    browse: 'general.browsing',
    play: 'general.playing',
    pause: 'general.paused',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }

  const { href, pathname } = window.location
  const [showCover, privacy, showBrowsingActivity, showTitleAsPresence] = await Promise.all([
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('browsingActivity'),
    presence.getSetting<boolean>('titleAsPresence'),
  ])

  let video = false
  const player = document.querySelector<HTMLVideoElement>('div[data-media-provider] video')
  if (player !== null && !Number.isNaN(player.duration)) {
    video = true
    currentTime = player.currentTime
    duration = player.duration
    paused = player.paused
  }

  if (
    video !== false
    && !Number.isNaN(duration)
    && pathname.includes('/watch/')
  ) {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')

    presenceData.largeImageText = ANIME_NEXUS
    if (!privacy) {
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? strings.pause : strings.play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(Math.floor(currentTime), Math.floor(duration))
    }

    let seriesHref = ANIME_NEXUS_URL
    if (scripts) {
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.innerHTML) as InfoScript

          if (json['@type'] === 'TVEpisode') {
            const seriesTitle = json.partOfSeries?.name ?? 'Unknown Series'
            const episodeNum = json.episodeNumber ?? 'Unknown Episode'
            const coverImage = json.image ?? ActivityAssets.Logo
            seriesHref = json.partOfSeries?.url ?? seriesHref

            if (!privacy) {
              presenceData.details = seriesTitle
              presenceData.state = `Episode ${episodeNum}`
              if (showCover) {
                presenceData.largeImageKey = coverImage
              }
            }
            else {
              presenceData.details = strings.watchingAnime
            }

            if (showTitleAsPresence && !privacy) {
              presenceData.name = seriesTitle
            }
            else {
              presenceData.name = ANIME_NEXUS
            }
          }
        }
        catch {
          continue
        }
      }
    }

    if (paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (!privacy) {
      presenceData.buttons = [
        {
          label: strings.watchEpisode,
          url: href,
        },
        {
          label: strings.viewSeries,
          url: seriesHref,
        },
      ]
    }
  }
  else if (pathname.includes('/series') && showBrowsingActivity && !privacy) {
    const pageTitle = document.querySelector<HTMLHeadingElement>('h2[class^="text-3xl"]')?.textContent
    presenceData.details = strings.viewPage
    presenceData.state = pageTitle

    const cover = document.querySelector<HTMLImageElement>('div[class*="aspect-[640/960]"] img')
    if (cover && !pageTitle) {
      const seriesTitle = document.querySelector('h1.uppercase')?.textContent?.trim() ?? 'Unknown Series'
      const rating = document.querySelector('.text-2xl.font-bold.tracking-tight')?.textContent?.trim() ?? 'N/A'
      presenceData.state = seriesTitle
      presenceData.largeImageKey = cover.src
      presenceData.largeImageText = `★ ${rating}`
      presenceData.buttons = [
        {
          label: strings.viewSeries,
          url: href,
        },
      ]
    }
  }
  else if ((
    pathname.includes('/discover')
    || pathname.includes('/latest')
    || pathname.includes('/user/updates')
    || pathname.includes('/user/history')
  ) && showBrowsingActivity && !privacy) {
    presenceData.details = strings.viewPage
    presenceData.state = document.querySelector<HTMLHeadingElement>('h1[class^="text-2xl"]')?.textContent
  }
  else if (pathname.includes('/user/profile') && showBrowsingActivity && !privacy) {
    presenceData.details = strings.viewProfile
    presenceData.state = document.querySelector<HTMLHeadingElement>('h1[class^="text-3xl"]')?.textContent
  }
  else if (pathname.includes('/schedule') && showBrowsingActivity && !privacy) {
    presenceData.details = strings.viewPage
    presenceData.state = document.querySelector<HTMLHeadingElement>('h2[class^="text-lg"]')?.textContent
  }
  else if (pathname.includes('/user/collection') && showBrowsingActivity && !privacy) {
    presenceData.details = strings.viewPage
    presenceData.state = document.querySelector<HTMLHeadingElement>('h2[class^="text-3xl"]')?.textContent
  }
  else if (pathname.includes('/user/lists') && showBrowsingActivity && !privacy) {
    presenceData.details = strings.viewPage
    presenceData.state = document.querySelector<HTMLHeadingElement>('h2[class^="text-2xl"]')?.textContent
  }
  else if (showBrowsingActivity && !privacy) {
    presenceData.details = strings.browse
    presenceData.startTimestamp = browsingTimestamp

    delete presenceData.state
    delete presenceData.smallImageKey
  }
  else {
    return presence.clearActivity()
  }

  if (!showCover)
    presenceData.largeImageKey = ActivityAssets.Logo

  presence.setActivity(presenceData)
})

interface InfoScript {
  '@type': 'TVEpisode'
  'name': string
  'episodeNumber': number
  'image': string
  'partOfSeries': {
    name: string
    url: string
  }
}
