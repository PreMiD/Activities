import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1266069361928704072',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/AnimeSaturn/assets/logo.png',
}

let iFrameData: {
  video?: {
    paused?: boolean
    currentTime?: number
    duration?: number
    title?: string
  }
} = {}

presence.on('iFrameData', (data) => {
  iFrameData = data
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
  }
  const cover = await presence.getSetting<boolean>('cover')
  const { pathname, href, search } = document.location

  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    paused: 'general.paused',
    play: 'general.playing',
    search: 'general.search',
    searchFor: 'general.searchFor',
    viewHome: 'general.viewHome',
    viewAnAnime: 'general.viewAnAnime',
    viewEpisode: 'general.viewEpisode',
    buttonViewEpisode: 'general.buttonViewEpisode',
    buttonViewAnime: 'general.buttonViewAnime',
  })

  const searchBox = document.querySelector<HTMLInputElement>('input[type="search"]')
  const searchParams = new URLSearchParams(search)

  if (searchBox?.value || (pathname.startsWith('/filter') && searchParams.get('key'))) {
    presenceData.details = `${strings.searchFor} ${searchBox?.value || searchParams.get('key')}`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/filter')) {
    presenceData.details = strings.search
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/') {
    presenceData.details = strings.viewHome
  }
  else if (pathname.startsWith('/az-list')) {
    presenceData.details = 'Viewing Archive'
    presenceData.state = `Filter by: ${document
      .querySelector('.letter-strip .letter-tab.active')
      ?.textContent
      ?.trim()}`
  }
  else if (pathname.startsWith('/ongoing')) {
    presenceData.details = 'Viewing seasonal anime'
    presenceData.state = `Page ${
      document.querySelector('span.page-num--active')?.textContent
    }`
  }
  else if (pathname.startsWith('/anime') && !iFrameData.video) {
    // view anime
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.viewAnAnime
    presenceData.details = document.querySelector(
      '.anime-grid .ag-head h1',
    )?.textContent
    presenceData.state = `Episodes: ${
      document.querySelector('.anime-grid .ag-episodes h2 span')?.textContent?.match(/\((\d+)\)/)?.[1]
      || document.querySelectorAll(
        '.anime-grid .ag-episodes .ep-tile',
      )?.length || 0
    } | ${Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes('Studio'))?.parentElement?.textContent?.replace('Studio', 'Studio:')?.trim()}`
    presenceData.largeImageKey = cover
      ? document.querySelector<HTMLImageElement>('.anime-grid .ag-poster img')?.src
      ?? ActivityAssets.Logo
      : ActivityAssets.Logo
    presenceData.buttons = [
      {
        label: strings.buttonViewAnime,
        url: href,
      },
    ]
  }
  else if (pathname.startsWith('/episode')) {
    // view episode
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.viewEpisode
    presenceData.details = strings.viewEpisode
    presenceData.state = `${document.querySelector('.ept-title')?.textContent} ${document.querySelector('.ept-sub')?.textContent}`
    presenceData.largeImageKey = cover
      ? document.querySelector<HTMLImageElement>('.ept-cover img')?.src
      ?? ActivityAssets.Logo
      : ActivityAssets.Logo
  }
  else if (pathname.startsWith('/anime') && iFrameData.video) {
    // watch anime
    presenceData.smallImageKey = iFrameData.video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = iFrameData.video.paused ? strings.paused : strings.play
    presenceData.details = document.querySelector('.player-card a[x-text="animeName"]')?.textContent
    presenceData.state = document.querySelector('.player-card span[x-text="displayNumber"]')?.textContent
    if (iFrameData.video && iFrameData.video.currentTime && iFrameData.video.duration && !iFrameData.video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(iFrameData.video.currentTime, iFrameData.video.duration)
    }
    presenceData.largeImageKey = cover
      ? document.querySelector<HTMLMetaElement>('[property="og:image"]')?.content
      ?? ActivityAssets.Logo
      : ActivityAssets.Logo
    presenceData.buttons = [
      {
        label: strings.buttonViewEpisode,
        url: href,
      },
    ]
  }
  else if (pathname.startsWith('/newest')) {
    presenceData.details = 'Viewing new anime'
  }
  else if (pathname.startsWith('/upcoming')) {
    presenceData.details = 'Viewing upcoming anime'
  }
  else if (pathname.startsWith('/calendar')) {
    presenceData.details = 'Viewing Schedule'
  }
  else if (pathname.startsWith('/toplist')) {
    let top3 = ''
    for (let i = 0; i < 3; i++) {
      top3 += `${i + 1}° ${
        document.querySelectorAll<HTMLImageElement>('.tl-podium img')[i]?.alt
      }\n`
    }
    presenceData.details = `Viewing top-anime: ${
      document.querySelector('.tab.active')?.textContent
    }`
    presenceData.state = top3
  }
  else if (pathname.startsWith('/info')) {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Viewing contact info'
  }
  else if (pathname.startsWith('/news')) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Reading news'
  }
  else if (pathname.startsWith('/genres')) {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Viewing genres'
  }
  else {
    presenceData.details = strings.browsing
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
