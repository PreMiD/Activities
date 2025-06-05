import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1334576902081351761',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/NovaStream/assets/logo.png',
    smallImageKey: Assets.Play,
    smallImageText: 'Watching free content',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (document.location.pathname === '/' || document.location.pathname === '/index.html') {
    const searchInput = document.querySelector<HTMLInputElement>('.search-input')?.value
    if (searchInput && searchInput.length > 0)
      presenceData.state = `Searching for: "${searchInput}"`
    else presenceData.state = 'Browsing content to watch'
  }
  else if (document.location.pathname.includes('/settings')) {
    const activeSections = Array.from(document.querySelectorAll<HTMLElement>('[x-show^="activeSection"]'))
      .filter(el => window.getComputedStyle(el).display !== 'none')
    const firstActiveSection = activeSections[0]
    const sectionTitle = firstActiveSection?.querySelector('h2')?.textContent?.trim()
    if (sectionTitle) {
      presenceData.state = `In settings: ${sectionTitle}`
    }
    else {
      presenceData.state = 'In settings'
    }
  }
  else if (document.location.pathname.includes('/watch')) {
    let title = document.querySelector('h1.text-2xl')?.textContent
    let releaseDate
    let rating
    let season
    let episode
    let runtime
    let seasonEpisode

    if (document.location.search.includes('type=movie')) {
      releaseDate = document.querySelector(
        '[x-text*="content?.release_date"], [x-text*="content?.first_air_date"]',
      )?.textContent
      rating = document.querySelector(
        '[x-text*="content?.vote_average?"]',
      )?.textContent
      runtime = document.querySelector(
        '[x-text*="Math.floor(content.runtime / 60) + \'h \' + (content.runtime % 60) + \'m\'"]',
      )?.textContent
    }
    else {
      releaseDate = document.querySelector(
        '[x-text*="content?.release_date"], [x-text*="content?.first_air_date"]',
      )?.textContent
      rating = document.querySelector<HTMLSelectElement>(
        '[x-text*="content?.vote_average?"]',
      )?.textContent
      const selectedSeason = document.querySelector<HTMLSelectElement>('[x-model*="selectedSeason"]')
      if (selectedSeason && selectedSeason.selectedOptions[0]) {
        season = selectedSeason.selectedOptions[0].textContent?.replace('Season ', '') ?? ''
      }

      const selectedEpisode = document.querySelector<HTMLSelectElement>('[x-model*="selectedEpisode"]')
      if (selectedEpisode && selectedEpisode.selectedOptions[0]) {
        episode = selectedEpisode.selectedOptions[0].textContent?.replace('Episode ', '') ?? ''
      }
      if (season && episode)
        seasonEpisode = `S${season}E${episode}  •  `
    }
    const releaseYear = releaseDate?.substring(0, 4)
    if (releaseYear)
      title += ` (${releaseYear})`

    presenceData.buttons = [
      { label: 'Watch now', url: document.location.href },
    ]
    if (title)
      presenceData.details = `Watching ${title}`
    presenceData.state = [
      runtime ? `${runtime}  •  ` : '',
      seasonEpisode ?? '',
      rating ? `⭐${rating}` : '',
    ].join('')
  }

  // Watchlist modal
  const watchListElement = document.querySelector<HTMLInputElement>(
    '[x-for*="item in watchLaterItems"]',
  )
  const watchListElements = watchListElement?.parentElement
  if (
    watchListElements
    && watchListElements.parentElement?.parentElement?.parentElement
    && window.getComputedStyle(
      watchListElements.parentElement.parentElement.parentElement,
      null,
    ).display === 'flex'
  ) {
    presenceData.state = `Browsing Watchlist: ${
      watchListElements.children.length - 1
    } items`
    presenceData.details = ''
  }

  if (presenceData.state)
    presence.setActivity(presenceData)
})
