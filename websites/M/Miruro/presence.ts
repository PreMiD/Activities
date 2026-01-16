import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1461595509251903662',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/dmLFCtb.png',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatchingVideo = false

const strings = {
  browsing: 'Browsing',
  searching: 'Searching',
  checking: 'Checking',
  episode: 'Episode',
  playing: 'Playing',
  paused: 'Paused',
}

function toTitleCase(input: string): string {
  return input
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function getInfoSlug(pathname: string): string {
  const infoAnchor = document.querySelector<HTMLAnchorElement>('a[href^="/info/"]')
  const infoHref = infoAnchor?.getAttribute('href') ?? ''
  return infoHref.match(/\/info\/\d+\/([^/]+)/)?.[1] ?? pathname.split('/')[3] ?? ''
}

function getCoverFromInfoAnchor(): string | undefined {
  const infoAnchor = document.querySelector<HTMLAnchorElement>('a[href^="/info/"]')
  return infoAnchor?.querySelector<HTMLImageElement>('img')?.src
}

presence.on('UpdateData', async () => {
  const [multiLanguage, usePresenceName] = await Promise.all([
    presence.getSetting<boolean>('multiLanguage'),
    presence.getSetting<boolean>('usePresenceName'),
  ])

  void multiLanguage

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const { pathname, search } = document.location

  switch (true) {
    case pathname === '/': {
      presenceData.details = strings.browsing
      break
    }

    case pathname === '/search': {
      const params = new URLSearchParams(search)
      const genres = params.get('genres') ?? 'Anime'
      presenceData.details = `${strings.searching}: ${genres}`
      presenceData.smallImageKey = Assets.Search
      break
    }

    case pathname.includes('/watch/'): {
      const slug = getInfoSlug(pathname)
      const title = toTitleCase(slug)

      if (usePresenceName) presenceData.name = title
      else presenceData.details = title

      const episode = pathname.match(/episode-(\d+)/i)?.[1]
      if (episode) presenceData.state = `${strings.episode} ${episode}`

      const video = document.querySelector<HTMLVideoElement>('video')
      if (video) {
        const { paused, currentTime, duration } = video

        // Only show video indicators if user has started watching or is currently playing
        if (currentTime > 0 || !paused) {
          if (paused) {
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = strings.paused

            // Clear timestamps while paused so it doesn't look like it's still progressing
            delete presenceData.endTimestamp
            presenceData.startTimestamp = browsingTimestamp

            // Reset browsing timestamp when returning from video
            if (wasWatchingVideo) browsingTimestamp = Math.floor(Date.now() / 1000)
          } else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = strings.playing

            if (duration) {
              ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
                currentTime,
                duration,
              )
            }
          }

          wasWatchingVideo = true
        } else {
          wasWatchingVideo = false
        }
      } else {
        wasWatchingVideo = false
      }

      presenceData.largeImageKey =
        getCoverFromInfoAnchor() ??
        document.querySelector<HTMLImageElement>('img[src*="anilist"]')?.src ??
        ActivityAssets.Logo

      break
    }

    case pathname.includes('/info'): {
      const slug = pathname.split('/')[3] ?? ''
      presenceData.details = `${strings.checking} ${toTitleCase(slug)}`
      presenceData.smallImageKey = Assets.Search

      presenceData.largeImageKey =
        document.querySelector<HTMLImageElement>('img[alt="Cover"]')?.src ??
        document.querySelector<HTMLImageElement>('img[src*="anilist"]')?.src ??
        document.querySelector<HTMLImageElement>('img.vds-poster')?.src ??
        ActivityAssets.Logo

      break
    }

    default: {
      presenceData.details = strings.browsing
      break
    }
  }

  presence.setActivity(presenceData)
})
