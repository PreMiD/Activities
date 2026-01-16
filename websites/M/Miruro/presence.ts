import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1461595509251903662',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/dmLFCtb.png',
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatchingVideo = false

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
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const { pathname, search } = document.location

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Browsing'
      break
    }

    case pathname === '/search': {
      const params = new URLSearchParams(search)
      const genres = params.get('genres') ?? 'Anime'
      presenceData.details = `Searching: ${genres}`
      presenceData.smallImageKey = Assets.Search
      break
    }

    case pathname.includes('/watch/'): {
      presenceData.name = 'Miruro'

      const slug = getInfoSlug(pathname)
      presenceData.details = toTitleCase(slug)

      const episode = pathname.match(/episode-(\d+)/i)?.[1]
      if (episode) presenceData.state = `Episode ${episode}`

      const video = document.querySelector<HTMLVideoElement>('video')
      if (video) {
        const { paused, currentTime, duration } = video

        // Only show video indicators if user has started watching or is currently playing
        if (currentTime > 0 || !paused) {
          if (paused) {
            presenceData.smallImageKey = Assets.Play
            presenceData.smallImageText = 'Paused'

            // Reset browsing timestamp when returning from video
            if (wasWatchingVideo) browsingTimestamp = Math.floor(Date.now() / 1000)
          } else {
            presenceData.smallImageKey = Assets.Pause
            presenceData.smallImageText = 'Playing'

            // Add timestamps only when actively playing
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

      const cover =
        getCoverFromInfoAnchor() ??
        document.querySelector<HTMLImageElement>('img[src*="anilist"]')?.src ??
        ActivityAssets.Logo

      presenceData.largeImageKey = cover
      break
    }

    case pathname.includes('/info'): {
      const slug = pathname.split('/')[3] ?? ''
      presenceData.details = `Checking ${toTitleCase(slug)}`

      const cover =
        document.querySelector<HTMLImageElement>('img[alt="Cover"]')?.src ??
        document.querySelector<HTMLImageElement>('img[src*="anilist"]')?.src ??
        document.querySelector<HTMLImageElement>('img.vds-poster')?.src ??
        ActivityAssets.Logo

      presenceData.largeImageKey = cover
      presenceData.smallImageKey = Assets.Search
      break
    }

    default: {
      presenceData.details = 'Browsing'
      break
    }
  }

  presence.setActivity(presenceData)
})
