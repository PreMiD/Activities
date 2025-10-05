import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1400527594537095179',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/T/ToonStream/assets/logo.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { href, pathname } = document.location

  const [privacy, showBrowsingActivity, showCover] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('browsingActivity'),
    presence.getSetting<boolean>('cover'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
  }

  if (privacy) {
    presenceData.details = 'Watching anime'
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/episode/') && pathname.split('/').length >= 3) {
    const pathParts = pathname.split('/')
    const episodePath = pathParts[2] || ''

    if (episodePath) {
      const lastDashIndex = episodePath.lastIndexOf('-')
      if (lastDashIndex > 0) {
        const animeNameWithDashes = episodePath.substring(0, lastDashIndex)
        const seasonEpisode = episodePath.substring(lastDashIndex + 1)

        const animeName = animeNameWithDashes
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        const seasonEpisodeParts = seasonEpisode.split('x')
        if (seasonEpisodeParts.length === 2) {
          const seasonStr = seasonEpisodeParts[0]
          const episodeStr = seasonEpisodeParts[1]

          if (seasonStr && episodeStr) {
            const season = Number.parseInt(seasonStr, 10)
            const episode = Number.parseInt(episodeStr, 10)

            presenceData.details = animeName
            presenceData.state = `Season ${season}, Episode ${episode}`

            if (showCover) {
              const tmdbImages = Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src && src.includes('image.tmdb.org/t/p/'))

              if (tmdbImages.length > 0) {
                presenceData.largeImageKey = tmdbImages[0]
              }
              else {
                const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
                if (ogImage)
                  presenceData.largeImageKey = ogImage
              }
            }

            presenceData.buttons = [
              {
                label: 'Watch Episode',
                url: href,
              },
              {
                label: 'View Anime',
                url: `https://toonstream.love/anime/${animeNameWithDashes}`,
              },
            ]
          }
        }
      }
    }
  }
  else if (pathname.startsWith('/anime/') && pathname.split('/').length >= 3 && showBrowsingActivity) {
    const pathParts = pathname.split('/')
    const animeNameWithDashes = pathParts[2] || ''

    if (animeNameWithDashes) {
      const animeName = animeNameWithDashes
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      presenceData.details = 'Viewing Anime'
      presenceData.state = animeName

      if (showCover) {
        const tmdbImages = Array.from(document.querySelectorAll('img'))
          .map(img => img.src)
          .filter(src => src && src.includes('image.tmdb.org/t/p/'))

        if (tmdbImages.length > 0) {
          presenceData.largeImageKey = tmdbImages[0]
        }
        else {
          const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
          if (ogImage)
            presenceData.largeImageKey = ogImage
        }
      }

      presenceData.buttons = [
        {
          label: 'View Anime',
          url: href,
        },
      ]
    }
  }
  else if (pathname === '/' && showBrowsingActivity) {
    presenceData.details = 'Browsing ToonStream'
    presenceData.state = 'Homepage'
  }
  else if (showBrowsingActivity) {
    presenceData.details = 'Browsing ToonStream'
    presenceData.state = 'Exploring content'
  }

  if (!showCover)
    presenceData.largeImageKey = ActivityAssets.Logo

  presence.setActivity(presenceData)
})
