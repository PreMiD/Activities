import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1212664221788274698',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/Nebula/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const showButtons = await presence.getSetting<boolean>('buttons')
  const path = pathname.split('/')

  path.shift()
  if (pathname.endsWith('/'))
    path.pop()

  getDetails(presenceData, path, showButtons, href)
  presence.setActivity(presenceData)
})

function getDetails(
  presenceData: PresenceData,
  path: string[],
  showButtons: boolean,
  href: string,
): void {
  if (path.length === 0) {
    presenceData.details = 'Viewing home page'
    return
  }

  switch (path[0]?.toLowerCase()) {
    case 'featured':
      presenceData.details = 'Viewing featured page'
      break
    case 'classes':
      presenceData.details = 'Viewing classes'
      break
    case 'settings':
      presenceData.details = 'Viewing account settings'
      break
    case 'faq':
      presenceData.details = 'Viewing Frequently Asked Questions'
      break
    case 'terms':
      presenceData.details = 'Viewing Terms of Service'
      break
    case 'privacy':
      presenceData.details = 'Viewing Privacy Policy'
      break
    case 'beta':
      presenceData.details = 'Viewing beta apps page'
      break
    case 'library':
      if (path.length === 1)
        presenceData.details = 'Viewing library page'
      else presenceData.details = `Viewing ${path[1]!.toLowerCase().replaceAll('-', ' ')}`
      break
    case 'explore':
      if (path.length === 1)
        presenceData.details = 'Viewing explore page'
      else presenceData.details = `Exploring ${path[1]!.toLowerCase()}`
      break
    case 'videos':
      getVideoDetails(presenceData, showButtons, href)
      break
    case 'search':
      getSearchDetails(presenceData)
      break
    default:
      getOtherDetails(presenceData, showButtons, href)
      break
  }
}

function getVideoDetails(
  presenceData: PresenceData,
  showButtons: boolean,
  href: string,
): void {
  const videoElement = document.querySelector('video')

  presenceData.details = document.querySelector('main h1')?.textContent
  presenceData.state = document.querySelector('main h2')?.textContent

  if (showButtons) {
    const channelLink = document.querySelector('main h2')?.closest('a')?.getAttribute('href')
      ?? document.querySelector('main h2')?.parentElement?.querySelector('a')?.getAttribute('href')

    presenceData.buttons = [
      {
        label: 'Watch Video',
        url: href,
      },
      {
        label: 'View Channel',
        url: getRootUrl() + channelLink,
      },
    ]
  }

  if (videoElement === null)
    return
  setTimestamps(videoElement, presenceData, true)
}

function getSearchDetails(presenceData: PresenceData): void {
  presenceData.details = 'Searching for:'
  presenceData.state = parseQueryParams().q || '...'
  presenceData.smallImageKey = Assets.Search
}

function getOtherDetails(
  presenceData: PresenceData,
  showButtons: boolean,
  href: string,
): void {
  const videoElement = document.querySelector('video')
  const audioElement = document.querySelector('audio')

  if (videoElement === null && audioElement === null) {
    // Viewing a channel or podcast page
    let channelName: string | null = null

    // Try getting channel name from the page
    const channelHeading = document.querySelector('main > div > h1')
    if (channelHeading instanceof HTMLElement) {
      channelName = channelHeading.textContent?.trim() || null
    }

    const podcastElement = document.querySelector('main > div > div > div > div > h1') as HTMLElement | null
    const podcastName = podcastElement?.textContent?.trim() || null

    // Fallback to RSS link + title if no channel heading
    // I know this solution is very... "what" but all headings are images and this is the only way to tell for sure that a page is a channel
    if (!channelName && !podcastName) {
      const rssLink = document.querySelector('link[rel="alternate"][type="application/rss+xml"]') as HTMLLinkElement | null
      const title = document.querySelector('title')?.textContent?.trim()
      if (channelName || !(rssLink?.href && title))
        return

      channelName = title.includes(' | ') ? title.split(' | ')[0] || null : null
    }

    const isPodcast = !channelName
    presenceData.details = isPodcast ? 'Viewing a podcast' : 'Viewing a channel'
    presenceData.state = isPodcast ? podcastName : channelName

    if (showButtons) {
      presenceData.buttons = [
        {
          label: isPodcast ? 'View Podcast' : 'View Channel',
          url: href,
        },
      ]
    }
  }

  else if (videoElement === null) {
    // listening to a podcast
    const channelElement = document.querySelector('main > div:nth-of-type(2) > div:nth-of-type(1) > div > div:nth-of-type(1) > a')

    presenceData.details = document.querySelector(
      'main > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1)',
    )?.textContent
    presenceData.state = channelElement?.textContent
    audioElement && setTimestamps(audioElement, presenceData, false)

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Listen to Podcast',
          url: href,
        },
        {
          label: 'View Channel',
          url: getRootUrl() + channelElement?.getAttribute('href'),
        },
      ]
    }
  }
  else {
    // watching a class episode
    const classInfoElementSelector = 'main > div:nth-of-type(2) > div > div > div'

    if (
      document.querySelector(classInfoElementSelector)?.childNodes.length === 2
    ) {
      // there is no episode name
      presenceData.details = document.querySelector(
        `${classInfoElementSelector} > div:nth-of-type(1)`,
      )?.textContent
      presenceData.state = document.querySelector(
        `${classInfoElementSelector} > div:nth-of-type(2)`,
      )?.textContent
    }
    else {
      presenceData.details = `${document.querySelector(
        `${classInfoElementSelector} > div:nth-of-type(1)`,
      )?.textContent
      } | ${document.querySelector(
        `${classInfoElementSelector} > div:nth-of-type(2)`,
      )?.textContent
      }`
      presenceData.state = document.querySelector(
        `${classInfoElementSelector} > div:nth-of-type(3)`,
      )?.textContent
    }

    setTimestamps(videoElement, presenceData, true)

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Episode',
          url: href,
        },
      ]
    }
  }
}

function setTimestamps(
  element: HTMLAudioElement | HTMLVideoElement,
  presenceData: PresenceData,
  isVideo: boolean,
): void {
  delete presenceData.startTimestamp;
  [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(element)
  if (element.paused) {
    delete presenceData.endTimestamp
    presenceData.smallImageKey = Assets.Pause
  }
  else {
    presenceData.type = isVideo ? ActivityType.Watching : ActivityType.Listening
    presenceData.smallImageKey = Assets.Play
  }
}

interface QueryParams {
  [key: string]: string
}

function parseQueryParams(): QueryParams {
  const queryParams: QueryParams = {}
  const queryString = document.location.search.split('?')[1]

  if (queryString) {
    const pairs = queryString.split('&')

    for (const pair of pairs) {
      const keyValue = pair.split('=')
      queryParams[decodeURIComponent(keyValue[0]!)] = decodeURIComponent(
        keyValue[1] || '',
      )
    }
  }

  return queryParams
}

function getRootUrl(): string {
  return `${document.location.protocol}//${document.location.hostname}${document.location.port ? `:${document.location.port}` : ''
  }`
}
