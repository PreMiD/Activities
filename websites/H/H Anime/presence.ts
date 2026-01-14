import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1460679179422138664',
})

enum ActivityAssets {
  Logo = 'logo',
  Small = 'small',
}

let cachedEpisode: string | null = null
let cachedSeason: string | null = null
let observersAttached = false

function readInitialEpisode() {
  const activeEp
    = document.querySelector('#episodes-content a[aria-current="true"]')
      ?? document.querySelector('#episodes-content .ep-item[aria-current="true"]')
      ?? document.querySelector('#episodes-content .ep-item.active')
      ?? document.querySelector('#episodes-content a.active')

  if (!activeEp) {
    return
  }

  const match = activeEp.textContent?.match(/\d+/)
  if (match) {
    cachedEpisode = `Episode ${match[0]}`
  }
}

function readInitialSeason() {
  const seasonEl = document.querySelector(
    '.other-season .os-item.active .title',
  )

  if (seasonEl) {
    cachedSeason = seasonEl.textContent?.trim() ?? null
  }
}

/* 🔹 OBSERVERS MUST COME BEFORE attachObservers */

const episodeObserver = new MutationObserver(() => {
  readInitialEpisode()
})

const seasonObserver = new MutationObserver(() => {
  readInitialSeason()
})

function extractAnimeTitle(title: string): string {
  return title
    .replace(/^watch\s+/i, 'Watching ')
    .replace(
      /\s+(?:english\s+(?:sub|dub)|subbed|dubbed).*$/i,
      '',
    )
    .replace(/\s+online\s+free.*$/i, '')
    .trim()
}

function getWatchState(): string {
  if (cachedSeason && cachedEpisode) {
    return `${cachedSeason} • ${cachedEpisode}`
  }

  if (cachedEpisode) {
    return cachedEpisode
  }

  if (cachedSeason) {
    return cachedSeason
  }

  return 'Watching'
}

function attachObservers() {
  if (observersAttached) {
    return
  }

  observersAttached = true

  readInitialEpisode()
  readInitialSeason()

  const epRoot = document.querySelector('#episodes-content')
  if (epRoot) {
    episodeObserver.observe(epRoot, {
      childList: true,
      subtree: true,
    })
  }

  const seasonRoot = document.querySelector('.other-season')
  if (seasonRoot) {
    seasonObserver.observe(seasonRoot, {
      childList: true,
      subtree: true,
    })
  }
}

presence.on('UpdateData', async () => {
  const isWatching
    = document.querySelector('[data-page="watch"]') !== null

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Small,
    smallImageText: isWatching ? 'Watching' : 'Browsing',
  }

  const rawTitle
    = document.querySelector('.anis-watch-detail h2')?.textContent
      ?? document.title

  presenceData.details = extractAnimeTitle(rawTitle)

  if (isWatching) {
    attachObservers()
    presenceData.state = getWatchState()
    presenceData.buttons = [
      {
        label: 'Watch Anime',
        url: location.href,
      },
    ]
  }
  else {
    presenceData.state = 'Browsing h!anime'
  }

  presence.setActivity(presenceData)
})
