import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MoviesJoy/assets/logo.png',
}

let video = { exists: false, duration: 0, currentTime: 0, paused: true }

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

function setCommonData(
  presenceData: PresenceData,
  video: {
    exists: boolean
    duration: number
    currentTime: number
    paused: boolean
  },
) {
  presenceData.largeImageKey = document.querySelector('img.film-poster-img')?.getAttribute('src')
    ?? ActivityAssets.Logo
  if (video?.exists) {
    if (!video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
    }
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Paused' : 'Playing back'
  }
  return presenceData
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'MoviesJoy',
  }
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const { href, pathname } = document.location
  const search = document.querySelector<HTMLInputElement>(
    '[class="search-form"] > [type="text"]',
  )
  const firstPage = document.querySelector(
    '[class="page-item active"]',
  )?.textContent
  const lastPage = document
    .querySelector('[title="Last"]')
    ?.getAttribute('href')
    ?.split('=')[1]

  if (search?.value) {
    presenceData.details = privacy ? 'Searching' : 'Searching for'
    presenceData.state = search.value
    presenceData.smallImageKey = Assets.Search
    presence.setActivity(presenceData)
    return
  }
  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Viewing the homepage'
      break
    }
    case pathname.includes('/search/'): {
      presenceData.details = privacy
        ? 'Viewing search results'
        : 'Viewing search results for'
      presenceData.state = document
        .querySelector('h2.cat-heading')
        ?.textContent
        ?.split('"')?.[1]
      presenceData.smallImageKey = Assets.Search
      break
    }
    case pathname.includes('/genre/'): {
      presenceData.details = privacy
        ? 'Browsing genres'
        : `Browsing ${pathname.split('/')?.[2]} content`
      presenceData.buttons = [
        {
          label: 'View Content',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('country'): {
      presenceData.details = privacy
        ? 'Viewing country specific content'
        : `Viewing content made for ${
          document.querySelector('h2.cat-heading')?.textContent
          ?? document.querySelector('[for="country-11"]')?.textContent
        }`
      presenceData.buttons = [
        {
          label: 'View Content',
          url: href,
        },
      ]

      break
    }
    case pathname === '/movie': {
      presenceData.details = privacy ? 'Viewing content' : 'Viewing movies'
      presenceData.buttons = [
        {
          label: 'View Movies',
          url: href,
        },
      ]
      break
    }
    case pathname === '/tv-show': {
      presenceData.details = privacy ? 'Viewing content' : 'Viewing tv shows'
      presenceData.buttons = [
        {
          label: 'View TV Shows',
          url: href,
        },
      ]
      break
    }
    case pathname === '/top-imdb': {
      presenceData.details = privacy
        ? 'Viewing content'
        : 'Viewing top IMDb content'
      presenceData.buttons = [
        {
          label: 'View Content',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('/movie/'): {
      presenceData.details = privacy
        ? 'Viewing a movie'
        : document.querySelector('h2.heading-name')?.textContent
      presenceData.largeImageKey = document
        .querySelector('img.film-poster-img')
        ?.getAttribute('src')
      presenceData.buttons = [
        {
          label: 'View Movie',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('/tv/'): {
      presenceData.details = privacy
        ? 'Viewing a TV series'
        : document.querySelector('h2.heading-name')?.textContent
      presenceData.buttons = [
        {
          label: 'View TV Series',
          url: href,
        },
      ]
      break
    }
    case pathname.includes('/watch-tv/'): {
      delete presenceData.startTimestamp
      const tvSplit = document
        .querySelector('img.film-poster-img')
        ?.getAttribute('title')
        ?.split('-')
      const episodeNumberTitle = document.querySelector(
        '[class*="eps-item active"]',
      )?.textContent
      presenceData.details = privacy ? 'Watching a TV series' : tvSplit?.[0]
      presenceData.state = episodeNumberTitle?.includes('Eps') && tvSplit?.[1]?.includes('Season')
        ? `${tvSplit?.[1].replace('Season ', 'S')}:${episodeNumberTitle
          ?.replace('Eps ', 'E')
          ?.replace(':', ' -')}`
        : episodeNumberTitle
      presenceData.buttons = [
        {
          label: 'Watch TV Series',
          url: href,
        },
      ]
      setCommonData(presenceData, video)
      break
    }
    case pathname.includes('/watch-movie/'): {
      delete presenceData.startTimestamp
      presenceData.details = privacy
        ? 'Watching a movie'
        : document.querySelector('img.film-poster-img')?.getAttribute('title')
      presenceData.buttons = [
        {
          label: 'Watch Movie',
          url: href,
        },
      ]
      setCommonData(presenceData, video)
      break
    }
  }

  if (!privacy && firstPage && lastPage) {
    presenceData.state = `Page ${firstPage}/${
      lastPage !== 'all&page'
        ? lastPage
        : document.querySelector('[class*="pagination"]')?.querySelectorAll('li').length === 5
          ? '3'
          : '4'
    }`
  }
  if ((!covers || privacy) && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (privacy && presenceData.state)
    delete presenceData.state
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
