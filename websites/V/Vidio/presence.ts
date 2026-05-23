import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '795564487910227968',
})

const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Vidio/assets/logo.png',
  startTimestamp: Math.floor(Date.now() / 1000),
  type: ActivityType.Watching,
}

// Helper functions
async function cropImageToSquare(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const { width, height } = img

      if (width <= height) {
        resolve(imageUrl)
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(imageUrl)
        return
      }

      canvas.width = height
      canvas.height = height

      // Always crop from left side when image is wider than tall
      ctx.drawImage(img, 0, 0, height, height, 0, 0, height, height)

      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }

    img.onerror = () => {
      resolve(imageUrl)
    }

    img.src = imageUrl
  })
}

async function setOgImageIfExists(): Promise<void> {
  const ogImage = document.querySelector('meta[property="og:image"]')
  const ogImageContent = ogImage?.getAttribute('content')

  if (ogImageContent && ogImageContent.trim() !== '') {
    try {
      const croppedImage = await cropImageToSquare(ogImageContent)
      presenceData.largeImageKey = croppedImage
    }
    catch {
      presenceData.largeImageKey = ogImageContent
    }
  }
  else {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/V/Vidio/assets/logo.png'
  }
}

function toTitleCase(string: string) {
  return string
    .split(' ')
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ')
}

function handleVideoPlayerState(video: HTMLVideoElement, isLive: boolean = false): void {
  if (video.paused) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = isLive ? 'Live Paused' : 'Video Paused'
  }
  else {
    presenceData.smallImageKey = isLive ? Assets.Live : Assets.Play
    presenceData.smallImageText = 'Playing'
  }
}

function parseSeasonAndEpisode(subtitleText: string): { success: boolean, details?: string, largeImageText?: string } {
  const episodeMatch = subtitleText.match(/(?:Season\s+(\d+)\s*)?:\s*Ep\s+(\d+)\s*-\s*(.+)/)

  if (episodeMatch && episodeMatch[2]) {
    const season = episodeMatch[1] || '1' // Default to season 1 if not specified
    const episode = episodeMatch[2]
    const episodeTitle = episodeMatch[3] || subtitleText // Fallback to full subtitle if title not found

    return {
      success: true,
      details: episodeTitle,
      largeImageText: `Season ${season}, Episode ${Number.parseInt(episode, 10)}`,
    }
  }

  return { success: false }
}

function handleTitleAndSubtitle(titleElement: Element | null, subtitleElement: Element | null): void {
  if (titleElement && subtitleElement) {
    const titleText = titleElement.textContent || ''
    const subtitleText = subtitleElement.textContent || ''

    // Handle "|" separator in title
    if (titleText.includes('|')) {
      const [beforePipe, afterPipe] = titleText.split('|').map(part => part.trim())
      presenceData.name = beforePipe

      // Use subtitle if available, otherwise use the part after "|"
      if (subtitleText && !subtitleText.includes('comments')) {
        // Parse season and episode from subtitle if possible
        const episodeInfo = parseSeasonAndEpisode(subtitleText)

        if (episodeInfo.success) {
          presenceData.details = episodeInfo.details!
          presenceData.largeImageText = episodeInfo.largeImageText!
        }
        else {
          presenceData.details = subtitleText
        }
      }
      else if (subtitleText.includes('comments')) {
        const articleContent = document.querySelector('article[class*="information-content_content"] p')
        presenceData.details = afterPipe
        presenceData.state = articleContent?.textContent || subtitleText
      }

      else {
        presenceData.details = afterPipe
      }
    }
    else {
      presenceData.name = titleText

      // Check if subtitle contains comments, if so get description from article content
      if (subtitleText.includes('comments')) {
        const articleContent = document.querySelector('article[class*="information-content_content"] p')
        presenceData.details = titleText
        presenceData.state = articleContent?.textContent || subtitleText
      }
      else {
        // Parse season and episode from subtitle
        const episodeInfo = parseSeasonAndEpisode(subtitleText)

        if (episodeInfo.success) {
          presenceData.details = episodeInfo.details!
          presenceData.largeImageText = episodeInfo.largeImageText!
        }
        else {
          presenceData.details = subtitleText
        }
      }
    }
  }
  else if (titleElement) {
    const titleText = titleElement.textContent || ''

    // Handle "|" separator in title
    if (titleText.includes('|')) {
      const [beforePipe, afterPipe] = titleText.split('|').map(part => part.trim())
      presenceData.name = beforePipe
      presenceData.details = afterPipe
    }
    else {
      presenceData.name = titleText
    }
  }
}

presence.on('UpdateData', async () => {
  // Clear all presence data properties
  delete presenceData.name
  delete presenceData.details
  delete presenceData.state
  delete presenceData.smallImageKey
  delete presenceData.smallImageText
  delete presenceData.largeImageText
  delete presenceData.startTimestamp
  delete presenceData.endTimestamp

  await setOgImageIfExists()

  switch (
    document.location.pathname.endsWith('/')
    && document.location.pathname.length > 1
      ? document.location.pathname.slice(
          0,
          document.location.pathname.length - 1,
        )
      : document.location.pathname
  ) {
    case '/':
      presenceData.details = 'Viewing Homepage'
      break
    case '/live':
      presenceData.details = 'Viewing Live Streaming Video'
      break
    case '/kids':
      presenceData.details = 'Viewing Kids Section'
      break
    case '/search':
      presenceData.smallImageKey = Assets.Search
      presenceData.details = 'Searching for'
      presenceData.state = new URLSearchParams(document.location.search).get('q') || 'Unknown'
      break
    case '/schedule/tv':
      presenceData.details = 'Viewing TV Schedule'
      break
    case '/schedule/sports': {
      const sportParam = new URLSearchParams(document.location.search).get('sport')
      presenceData.details = sportParam
        ? `Viewing ${sportParam} Schedule`
        : 'Viewing Sports Schedule'
      break
    }
    case '/plans':
      presenceData.details = 'Viewing Packages Pricing'
      break
    case '/promo':
      presenceData.details = 'Viewing Packages Promo'
      break
    default: {
      if (document.location.pathname.startsWith('/tags/')) {
        const tag = document.querySelector('div[data-testid="advanced-tag"] h2')
        const tagText = document.querySelector('div[data-testid="advanced-tag"] p')
        const ogImage = document.querySelector('div[data-testid="advanced-tag"] img')

        // Get tag name from element or fallback to pathname
        const tagName = tag?.textContent || document.location.pathname
          .substring('/tags/'.length)
          .split('-')
          .join(' ')

        presenceData.details = `Viewing ${toTitleCase(tagName)} Videos`
        presenceData.state = tagText?.textContent || undefined
        presenceData.largeImageKey = ogImage?.getAttribute('src') || presenceData.largeImageKey
      }

      if (document.location.pathname.startsWith('/dashboard'))
        presenceData.details = 'Viewing Account Dashboard'

      if (document.location.pathname.startsWith('/categories')) {
        const category = document.location.pathname
          .substring('/categories/'.length)
          .split('-')
          .join(' ')
        presenceData.details = `Viewing ${toTitleCase(category)} Category`
        await setOgImageIfExists()
      }
      if (document.location.pathname.startsWith('/premier')) {
        const title = document.title
        const cleanTitle = title.startsWith('Nonton ')
          ? title.substring(7)
          : title
        presenceData.name = `Previews`
        presenceData.details = `${cleanTitle}`
        await setOgImageIfExists()
      }
      if (document.location.pathname.startsWith('/watch') || document.location.pathname.startsWith('/live/')) {
        const video = document.querySelector<HTMLVideoElement>(
          '[data-testid="video-player"]',
        ) || document.querySelector<HTMLVideoElement>(
          '#livestreaming-player__player_html5_api',
        )

        const titleElement = document.querySelector('div[data-testid="information-title"] h1')
        const subtitleElement = document.querySelector('p[data-testid="information-subtitle"]')
        const isLive = document.location.pathname.startsWith('/live/')

        // Handle title and subtitle using the new function
        handleTitleAndSubtitle(titleElement, subtitleElement)

        // Fallback for live streams with different selectors if no title was found
        if (!titleElement) {
          const liveTitle = document.querySelectorAll(
            '.b-livestreaming-detail__title.section__title',
          )[1]?.textContent
          const liveUser = document.querySelector(
            '.b-livestreaming-user__name',
          )?.textContent

          if (liveTitle) {
            presenceData.name = liveTitle
            presenceData.state = liveUser
          }
          else {
            presenceData.details = document.title
          }
        }

        await setOgImageIfExists()

        if (video) {
          if (!isLive) {
            ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
          }

          handleVideoPlayerState(video, isLive)
        }
      }
      break
    }
  }
  presence.setActivity(presenceData)
})
