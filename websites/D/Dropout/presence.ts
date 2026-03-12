import type { IFrameData, QueryParams } from './interfaces.js'
import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1240164154682249227',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum PresenceAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Dropout/assets/logo.png',
}

let duration: number, currentTime: number, paused: boolean, playback: boolean

presence.on('iFrameData', (data: IFrameData) => {
  playback = !!data.duration
  if (playback)
    ({ duration, currentTime, paused } = data)
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: PresenceAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const showButtons = await presence.getSetting<boolean>('buttons')

  getDetails(
    presenceData,
    pathname.split('/').filter(Boolean),
    showButtons,
    href,
  )
  presence.setActivity(presenceData)
})

function getDetails(
  presenceData: PresenceData,
  path: string[],
  showButtons: boolean,
  href: string,
): void {
  switch (path[0]?.toLowerCase()) {
    case 'browse':
      presenceData.details = 'Browsing home page'
      break
    case 'continue-watching':
      presenceData.details = 'Browsing Continue Watching playlist'
      break
    case 'my-list':
      presenceData.details = 'Browisng my list'
      break
    case 'new-releases':
      presenceData.details = 'Browsing new releases'
      break
    case 'recommended-new-shelf':
      presenceData.details = 'Browsing trending page'
      break
    case 'series':
      presenceData.details = 'Browsing series'
      break
    case 'search':
      getSearchDetails(presenceData)
      break
    default:
      getVideoDetails(presenceData, showButtons, href)
  }
}

function getSearchDetails(presenceData: PresenceData): void {
  presenceData.details = 'Searching for:'
  presenceData.state = parseQueryParams().q || '...'
  presenceData.smallImageKey = Assets.Search
}

function getVideoDetails(
  presenceData: PresenceData,
  showButtons: boolean,
  href: string,
): void {
  const mainSelector = 'main > section > section > div > div > div'
  const seriesNameElement = document.querySelector(`${mainSelector} > h1`)

  if (seriesNameElement !== null) {
    // Viewing a series
    const selectElement = document.querySelector<HTMLSelectElement>(
      `${mainSelector} > form:nth-child(1) > select`,
    )
    presenceData.details = 'Viewing a series'

    if (selectElement === null) {
      presenceData.state = seriesNameElement.textContent?.trim()
    }
    else {
      presenceData.state = `${seriesNameElement.textContent?.trim()}: ${selectElement.options[
        selectElement.selectedIndex
      ]?.textContent?.trim()}`
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'View Series',
          url: href,
        },
      ]
    }
  }
  else {
    const videoNameElement = document.querySelector('.video-title')
    const seriesLinkElement = document.querySelector<HTMLAnchorElement>('.context-link')
    const episodeElement = document.querySelector(
      '#watch-info > div > div > div > div > div > h5 > a',
    )

    if (!videoNameElement)
      return
    presenceData.details = videoNameElement.textContent?.trim()

    if (!seriesLinkElement && !episodeElement) {
      // no series name or episode indicator
      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Watch Video',
            url: href,
          },
        ]
      }
    }
    else if (!seriesLinkElement && episodeElement) {
      // no series, has episode indicator
      presenceData.state = episodeElement.textContent?.trim()

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Watch Video',
            url: href,
          },
          {
            label: 'View Series',
            url: episodeElement.getAttribute('href'),
          },
        ]
      }
    }
    else if (seriesLinkElement && episodeElement) {
      // has series and episode indicator
      const match = episodeElement.textContent?.trim().match(/(\d+)\D+(\d+)/)

      presenceData.state = seriesLinkElement.textContent?.trim()

      if (match) {
        presenceData.details = `S${match[1]}E${
          match[2]
        }: ${videoNameElement.textContent?.trim()}`
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Watch Episode',
            url: href,
          },
          {
            label: 'View Series',
            url: seriesLinkElement.href,
          },
        ]
      }
    }

    setTimestamps(presenceData)
  }
}

function setTimestamps(presenceData: PresenceData): void {
  delete presenceData.startTimestamp
  if (!paused) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime, duration)
  }
  presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
}

function parseQueryParams(): QueryParams {
  const queryParams: QueryParams = {}
  const queryString = document.location.search.split('?')[1]

  if (queryString) {
    const pairs = queryString.split('&')

    for (const pair of pairs) {
      const keyValue = pair.split('=')
      queryParams[decodeURIComponent(keyValue[0] ?? '')] = decodeURIComponent(
        keyValue[1] || '',
      )
    }
  }

  return queryParams
}
