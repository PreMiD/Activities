import { ActivityType } from 'premid'

const presence = new Presence({ clientId: '1555385797333749850' })
const logo = 'https://i.imgur.com/WEFa57f.png'

// Unix seconds. Reset whenever the user starts a new title/episode, so Discord
// shows "00:12 elapsed" for the current session instead of a stale value.
const now = () => Math.floor(Date.now() / 1000)
let lastKey = ''
let watchStart = now()
let browseStart = now()

presence.on('UpdateData', async () => {
  let showButtons = true
  try {
    showButtons = (await presence.getSetting<boolean>('buttons')) !== false
  }
  catch {
    // Ignore setting fetch failure
  }

  const player = document.querySelector<HTMLElement>('[data-framex-presence="watching"]')
  const d = player?.dataset

  if (d?.framexTitle) {
    const key = `${d.framexTitle}|${d.framexSeason}|${d.framexEpisode}`
    if (key !== lastKey) {
      lastKey = key
      watchStart = now()
    }

    let label = 'TV show'
    if (d.framexType === 'movie') {
      label = 'Movie'
    }
    else if (d.framexType === 'anime') {
      label = 'Anime'
    }

    const ep = d.framexType === 'movie' ? '' : ` · S${d.framexSeason || '1'} E${d.framexEpisode || '1'}`
    const audio = d.framexType === 'anime' && d.framexLanguage ? ` · ${d.framexLanguage.toUpperCase()}` : ''

    const poster = (d.framexPoster && d.framexPoster.startsWith('https://')) ? d.framexPoster : logo

    const data: PresenceData = {
      type: ActivityType.Watching,
      details: d.framexTitle.slice(0, 128),
      state: `${label}${ep}${audio}`.slice(0, 128),
      largeImageKey: poster,
      largeImageText: d.framexTitle.slice(0, 128),
      smallImageKey: logo,
      smallImageText: 'Watching via Framex',
      startTimestamp: watchStart,
    }

    if (showButtons) {
      data.buttons = [
        { label: 'Watch on Framex', url: document.location.href },
      ]
    }

    presence.setActivity(data)
    return
  }

  if (lastKey) {
    lastKey = ''
    browseStart = now()
  }

  let info: { page?: string, title?: string, poster?: string } = {}
  try {
    const metaTag = document.querySelector<HTMLMetaElement>('meta[name="framex-presence"]')
    info = JSON.parse(metaTag?.content || '{}')
  }
  catch {
    // Ignore metadata parse failure
  }

  const page = info.page || 'Browsing'
  let details = page
  let state = 'Framex — free streaming'

  const pagePoster = document.querySelector<HTMLImageElement>(
    'main img[src*="image.tmdb.org"], main img[src*="anilist.co"], img[src*="image.tmdb.org"]',
  )?.src

  let largeImageKey = logo
  let largeImageText = 'Framex'
  let smallImageKey: string | null = null
  let smallImageText: string | null = null
  let buttonUrl: string | null = null

  if (info.title) {
    details = info.title.slice(0, 128)
    state = 'Viewing details'
    buttonUrl = document.location.href

    let poster: string | null = null
    if (info.poster && info.poster.startsWith('https://')) {
      poster = info.poster
    }
    else if (pagePoster && pagePoster.startsWith('https://')) {
      poster = pagePoster
    }

    if (poster) {
      largeImageKey = poster
      largeImageText = info.title.slice(0, 128)
      smallImageKey = logo
      smallImageText = 'Watching via Framex'
    }
  }
  else if (page.startsWith('Searching')) {
    details = page
    state = 'Searching Framex'
  }
  else if (page.includes('home')) {
    details = 'Browsing the home page'
    state = 'Framex — free streaming'
  }
  else if (page.includes('movies')) {
    details = 'Browsing movies'
    state = 'Framex — free streaming'
  }
  else if (page.includes('TV shows')) {
    details = 'Browsing TV shows'
    state = 'Framex — free streaming'
  }

  const browseData: PresenceData = {
    type: ActivityType.Watching,
    details: details.slice(0, 128),
    state: state.slice(0, 128),
    largeImageKey,
    largeImageText: largeImageText.slice(0, 128),
    startTimestamp: browseStart,
  }

  if (smallImageKey && smallImageText) {
    browseData.smallImageKey = smallImageKey
    browseData.smallImageText = smallImageText.slice(0, 128)
  }

  if (showButtons && buttonUrl) {
    browseData.buttons = [
      { label: 'Watch on Framex', url: buttonUrl },
    ]
  }

  presence.setActivity(browseData)
})
