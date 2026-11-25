import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1568873691998195762',
})

enum ActivityAssets {
  Logo = 'https://phasmaanime.com/icon-512.png',
}

/** What the site writes into <meta name="phasma-presence"> while an episode is open (client/src/lib/desktopPresence.ts). */
interface Watching {
  id: number
  title: string
  episode: number
  /** Episodes in the show, when known. */
  total: number | null
  /** Season number from season 2 on (null for the first season). */
  season: number | null
  poster: string | null
  dub: boolean
  playing: boolean
  /** Seconds into the episode. */
  position: number
  duration: number | null
  /** Clock times in ms, only while playing. */
  start: number | null
  end: number | null
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browsing: 'general.browsing',
    episode: 'general.episode',
    season: 'general.season',
    viewAnime: 'general.buttonViewAnime',
    viewAnAnime: 'general.viewAnAnime',
    watchingAnime: 'general.watchingAnime',
    home: 'general.viewHome',
    searchFor: 'general.searchFor',
    searchSomething: 'general.searchSomething',
    profile: 'general.viewAProfile',
    thread: 'general.readingAThread',
    list: 'general.viewAList',
    genre: 'general.viewAGenre',
  })
}

function readWatching(): Watching | null {
  const raw = document.querySelector<HTMLMetaElement>('meta[name="phasma-presence"]')?.content
  if (!raw)
    return null
  try {
    return JSON.parse(raw) as Watching
  }
  catch {
    return null
  }
}

/** 130 -> "2:10", 3725 -> "1:02:05" */
function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

/** The page's own name from the tab title ("Frieren - Episodes, Info | Phasma Anime" -> "Frieren"). */
function pageName(): string {
  const t = document.title.replace(/\s*[|-]\s*Phasma Anime$/, '').replace(/\s*-\s*Episodes, Info$/, '').trim()
  return t === 'Phasma Anime' ? '' : t
}

presence.on('UpdateData', async () => {
  const [showCover, showButtons, showTime, showBrowsing, privacy] = await Promise.all([
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('browsing'),
    presence.getSetting<boolean>('privacy'),
  ])
  const strings = await getStrings()
  const { pathname, search, href } = document.location
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
  }

  if (pathname.startsWith('/watch/')) {
    const w = readWatching()
    if (privacy) {
      presenceData.details = strings.watchingAnime
    }
    else if (!w) {
      // the episode page is open but the video has not started yet: the tab title reads "ONE PIECE Ep 1"
      presenceData.details = pageName() || strings.watchingAnime
    }
    else {
      const episode = `${strings.episode} ${w.episode}${w.total ? ` / ${w.total}` : ''}${w.dub ? ' · Dub' : ''}`
      presenceData.details = w.season ? `${w.title} · ${strings.season} ${w.season}` : w.title
      presenceData.state = w.playing
        ? episode
        : `${episode} · ${strings.pause} ${clock(w.position)}${w.duration ? ` / ${clock(w.duration)}` : ''}`
      if (showCover && w.poster) {
        presenceData.largeImageKey = w.poster
        presenceData.largeImageText = `${w.title}${w.dub ? ' (Dub)' : ''}`
      }
      presenceData.smallImageKey = w.playing ? Assets.Play : Assets.Pause
      presenceData.smallImageText = w.playing ? strings.play : strings.pause
      if (showTime && w.playing && w.start) {
        presenceData.startTimestamp = w.start
        if (w.end)
          presenceData.endTimestamp = w.end
      }
      if (showButtons)
        presenceData.buttons = [{ label: strings.viewAnime, url: `https://phasmaanime.com/anime/${w.id}` }]
    }
    presence.setActivity(presenceData)
    return
  }

  if (!showBrowsing) {
    presence.clearActivity()
    return
  }

  presenceData.smallImageKey = Assets.Search
  presenceData.smallImageText = strings.browsing
  const name = pageName()
  if (privacy) {
    presenceData.details = strings.browsing
  }
  else if (/^\/anime\/\d+/.test(pathname)) {
    presenceData.details = strings.viewAnAnime
    if (name)
      presenceData.state = name
    if (showButtons)
      presenceData.buttons = [{ label: strings.viewAnime, url: href }]
  }
  else if (pathname.startsWith('/search')) {
    const q = new URLSearchParams(search).get('q')
    presenceData.details = q ? strings.searchFor : strings.searchSomething
    if (q)
      presenceData.state = q
    presenceData.smallImageKey = Assets.Search
  }
  else if (/^\/u\/[^/]+/.test(pathname)) {
    presenceData.details = strings.profile
    presenceData.state = decodeURIComponent(pathname.split('/')[2] ?? '')
  }
  else if (pathname.startsWith('/community/t/')) {
    presenceData.details = strings.thread
    if (name)
      presenceData.state = name
  }
  else if (/^\/(?:l\/|lists|my-list)/.test(pathname)) {
    presenceData.details = strings.list
  }
  else if (pathname.startsWith('/genres')) {
    presenceData.details = strings.genre
  }
  else {
    const pages: [RegExp, string][] = [
      [/^\/$/, strings.home],
      [/^\/browse/, 'Browsing anime'],
      [/^\/latest/, 'Latest episodes'],
      [/^\/movies/, 'Anime movies'],
      [/^\/seasonal/, 'Seasonal anime'],
      [/^\/schedule/, 'Airing schedule'],
      [/^\/community/, 'Community'],
      [/^\/together/, 'Watch together'],
      [/^\/profile/, strings.profile],
    ]
    presenceData.details = pages.find(([re]) => re.test(pathname))?.[1] ?? strings.browsing
  }
  presence.setActivity(presenceData)
})
