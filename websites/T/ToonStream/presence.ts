import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1400527594537095179'
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/llW08V7.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { href, pathname } = document.location

  // Get settings
  const [privacy, showBrowsingActivity, showCover] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('browsingActivity'),
    presence.getSetting<boolean>('cover')
  ])

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp
  }

  // Privacy mode check
  if (privacy) {
    presenceData.details = 'Watching anime'
    presence.setActivity(presenceData)
    return
  }

  // Check if we're on an episode page
  if (pathname.startsWith('/episode/') && pathname.split('/').length >= 3) {
    // Extract anime name, season, and episode from URL
    // URL format: https://toonstream.love/episode/masamune-kuns-revenge-1x3/
    const pathParts = pathname.split('/')
    const episodePath = pathParts[2] || '' // Get "masamune-kuns-revenge-1x3"

    if (episodePath) {
      // Split by last occurrence of "-" to separate anime name from season/episode
      const lastDashIndex = episodePath.lastIndexOf('-')
      if (lastDashIndex > 0) {
        const animeNameWithDashes = episodePath.substring(0, lastDashIndex) // "masamune-kuns-revenge"
        const seasonEpisode = episodePath.substring(lastDashIndex + 1) // "1x3"

        // Convert anime name to proper format (replace dashes with spaces and capitalize)
        const animeName = animeNameWithDashes
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        // Extract season and episode
        const seasonEpisodeParts = seasonEpisode.split('x')
        if (seasonEpisodeParts.length === 2) {
          const seasonStr = seasonEpisodeParts[0]
          const episodeStr = seasonEpisodeParts[1]

          if (seasonStr && episodeStr) {
            const season = Number.parseInt(seasonStr, 10)
            const episode = Number.parseInt(episodeStr, 10)

            presenceData.details = animeName
            presenceData.state = `Season ${season}, Episode ${episode}`

            // Try to get cover art dynamically from TMDB images
            if (showCover) {
              // Look for TMDB images in the document
              const tmdbImages = Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src && src.includes('image.tmdb.org/t/p/'))

              if (tmdbImages.length > 0) {
                // Use the first TMDB image found
                presenceData.largeImageKey = tmdbImages[0]
              } else {
                // Fallback to Open Graph image if no TMDB image found
                const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
                if (ogImage) {
                  presenceData.largeImageKey = ogImage
                }
              }
            }

            // Add buttons
            presenceData.buttons = [
              {
                label: 'Watch Episode',
                url: href
              },
              {
                label: 'View Anime',
                url: `https://toonstream.love/anime/${animeNameWithDashes}`
              }
            ]
          }
        }
      }
    }
  } else if (pathname.startsWith('/anime/') && pathname.split('/').length >= 3 && showBrowsingActivity) {
    // On anime page
    const pathParts = pathname.split('/')
    const animeNameWithDashes = pathParts[2] || ''

    if (animeNameWithDashes) {
      const animeName = animeNameWithDashes
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      presenceData.details = 'Viewing Anime'
      presenceData.state = animeName

      // Try to get cover art dynamically from TMDB images
      if (showCover) {
        // Look for TMDB images in the document
        const tmdbImages = Array.from(document.querySelectorAll('img'))
          .map(img => img.src)
          .filter(src => src && src.includes('image.tmdb.org/t/p/'))

        if (tmdbImages.length > 0) {
          // Use the first TMDB image found
          presenceData.largeImageKey = tmdbImages[0]
        } else {
          // Fallback to Open Graph image if no TMDB image found
          const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content
          if (ogImage) {
            presenceData.largeImageKey = ogImage
          }
        }
      }

      // Add button
      presenceData.buttons = [
        {
          label: 'View Anime',
          url: href
        }
      ]
    }
  } else if (pathname === '/' && showBrowsingActivity) {
    // Homepage
    presenceData.details = 'Browsing ToonStream'
    presenceData.state = 'Homepage'
  } else if (showBrowsingActivity) {
    // Other pages
    presenceData.details = 'Browsing ToonStream'
    presenceData.state = 'Exploring content'
  }

  // Reset to default logo if cover is disabled
  if (!showCover) {
    presenceData.largeImageKey = ActivityAssets.Logo
  }

  presence.setActivity(presenceData)
})