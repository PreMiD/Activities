import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

// The site keeps the current screen in <div id="fhd-activity" hidden data-*>, a stable
// contract that does not depend on the layout (see public/assets/js/activity-state.js).
const presence = new Presence({
  clientId: '1568475798053064745',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://animesfhd.net/assets/img/pwa/icon-512.png',
}

interface Activity {
  page?: string
  title?: string
  season?: string
  episode?: string
  episodeTitle?: string
  audio?: string
  cover?: string
  seriesUrl?: string
  roomTitle?: string
  roomPeople?: string
  roomPublic?: string
}

function readActivity(): Activity {
  const el = document.querySelector<HTMLElement>('#fhd-activity')
  return el ? { ...el.dataset } : {}
}

function episodeLine(activity: Activity): string {
  const parts: string[] = []
  if (activity.season && activity.season !== '1')
    parts.push(`T${activity.season}`)
  if (activity.episode === 'Filme')
    parts.push('Filme')
  else if (activity.episode)
    parts.push(`Episódio ${activity.episode}`)
  if (activity.audio)
    parts.push(activity.audio)
  return parts.join(' • ')
}

function playerVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('#player-video:not([hidden])') || document.querySelector<HTMLVideoElement>('#wp-video')
}

presence.on('UpdateData', async () => {
  const [showCover, showButtons, showSearch, privacy] = await Promise.all([
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showSearch'),
    presence.getSetting<boolean>('privacy'),
  ])
  const { pathname, search, href } = document.location
  const activity = readActivity()
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'AnimesFHD',
    startTimestamp: browsingTimestamp,
    details: 'Na tela inicial',
    state: 'Escolhendo o que assistir',
    smallImageKey: Assets.Viewing,
    smallImageText: 'Navegando',
  }
  const cover = showCover && !privacy && activity.cover ? activity.cover : ActivityAssets.Logo

  if (/^\/(?:episod|episode)\//.test(pathname) && activity.page === 'episode' && activity.title) {
    presenceData.details = privacy ? 'Assistindo um anime' : activity.title
    presenceData.state = privacy ? 'No AnimesFHD' : (episodeLine(activity) || 'Assistindo')
    presenceData.largeImageKey = cover
    presenceData.largeImageText = !privacy && activity.episodeTitle ? activity.episodeTitle : 'AnimesFHD'
    const video = playerVideo()
    if (video && !Number.isNaN(video.duration) && video.duration > 0) {
      if (video.paused) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Pausado'
        delete presenceData.startTimestamp
      }
      else {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Assistindo'
        ;[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      }
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Assistindo'
    }
    if (showButtons && !privacy) {
      presenceData.buttons = [{ label: 'Assistir no AnimesFHD', url: href }]
      if (activity.seriesUrl)
        presenceData.buttons.push({ label: 'Ver o anime', url: activity.seriesUrl })
    }
  }
  else if (/^\/assistir-junto\/[a-f0-9]{32}$/.test(pathname) && activity.page === 'watch-room') {
    const people = Number(activity.roomPeople || 0)
    presenceData.details = privacy || !activity.title ? 'Assistindo junto' : `Assistindo junto: ${activity.title}`
    presenceData.state = [privacy ? '' : episodeLine(activity), people ? `${people} ${people === 1 ? 'pessoa' : 'pessoas'} na sala` : '']
      .filter(Boolean).join(' • ') || 'Sala do AnimesFHD'
    presenceData.largeImageKey = cover
    presenceData.smallImageKey = Assets.Live
    presenceData.smallImageText = 'Sala ao vivo'
    if (showButtons && !privacy && activity.roomPublic === '1')
      presenceData.buttons = [{ label: 'Entrar na sala', url: href }]
  }
  else if (pathname === '/assistir-junto') {
    presenceData.details = 'Assistir junto'
    presenceData.state = 'Procurando uma sala'
    presenceData.smallImageKey = Assets.Search
  }
  else if (/^\/(?:serie|series)\//.test(pathname) && activity.page === 'series' && activity.title) {
    presenceData.details = 'Vendo um anime'
    presenceData.state = privacy ? 'No AnimesFHD' : [activity.title, activity.season && activity.season !== '1' ? `T${activity.season}` : '', activity.audio || ''].filter(Boolean).join(' • ')
    presenceData.largeImageKey = cover
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Lendo os detalhes'
    if (showButtons && !privacy)
      presenceData.buttons = [{ label: 'Ver o anime', url: href }]
  }
  else if (pathname.startsWith('/animes/pesquisar') || (pathname === '/animes' && new URLSearchParams(search).get('q'))) {
    const query = new URLSearchParams(search).get('q')
    presenceData.details = 'Pesquisando animes'
    presenceData.state = showSearch && !privacy && query ? `"${query.slice(0, 100)}"` : 'No catálogo'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Pesquisando'
  }
  else if (pathname === '/animes/lancamentos/em-breve') {
    presenceData.details = 'Vendo as estreias'
    presenceData.state = 'Animes que chegam em breve'
  }
  else if (pathname.startsWith('/animes/lancamentos')) {
    presenceData.details = 'Vendo os lançamentos'
    presenceData.state = 'Episódios novos de hoje'
  }
  else if (pathname === '/animes/filmes') {
    presenceData.details = 'Navegando no catálogo'
    presenceData.state = 'Filmes de anime'
  }
  else if (pathname === '/animes') {
    presenceData.details = 'Navegando no catálogo'
    presenceData.state = 'Explorando animes'
  }
  else if (pathname.startsWith('/profile')) {
    presenceData.details = 'No perfil'
    presenceData.state = 'Vendo a biblioteca e as conquistas'
  }
  else if (pathname === '/comunidade') {
    presenceData.details = 'Na comunidade'
    presenceData.state = 'Conversando com outros fãs'
  }
  else if (pathname === '/shop') {
    presenceData.details = 'Na loja'
    presenceData.state = 'Escolhendo recompensas'
  }

  presence.setActivity(presenceData)
})
