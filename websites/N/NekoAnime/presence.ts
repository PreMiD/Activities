import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1379070900653260840',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/NekoAnime/assets/0.png',
}

async function videoActive() {
  return !!document.querySelector('#MediaPage > div > div.head_player > div.vid-player')
}

const animePageCache = new Map<string, string>()

async function getAnimeInformation() {
  const animeTitle = document.querySelector('#MediaPage > div > div.head_player > div.player_content > div.episode_info > h2')?.textContent
  const episodeNumber = document.querySelector('#number')?.textContent

  const currentTime = document.querySelector('.vjs-current-time-display')?.textContent
  const totalTime = document.querySelector('.vjs-duration-display')?.textContent

  const playButton = document.querySelector('.vjs-play-control')

  let videoStatus = ''
  if (playButton?.classList.contains('vjs-playing')) {
    videoStatus = 'Reproduciendo'
  }
  else if (playButton?.classList.contains('vjs-paused')) {
    videoStatus = 'Pausado'
  }
  else {
    videoStatus = 'Desconocido'
  }

  const urlTitulo = document.querySelector('#MediaPage > div > div.head_player > div.player_content > div.anime_navigation > nav > a:nth-child(3)')?.getAttribute('href')
  if (!urlTitulo) {
    return {
      animeTitle,
      episodeNumber,
      currentTime,
      totalTime,
      videoStatus,
    }
  }

  let html: string
  if (animePageCache.has(urlTitulo)) {
    html = animePageCache.get(urlTitulo)!
  }
  else {
    try {
      const res = await fetch(`https://nekoanime.mx${urlTitulo}`)
      html = await res.text()
      animePageCache.set(urlTitulo, html)
    }
    catch (e) {
      console.error('Error fetching anime page:', e)
      html = ''
    }
  }

  let bannerAnime: string | undefined
  if (html) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const img = doc.querySelector('#InfoApp > div.anime_cont > div > div.left_cont > div.anim-cover > div > figure > img')?.getAttribute('src')
    bannerAnime = img || undefined
  }
  return {
    animeTitle,
    episodeNumber,
    currentTime,
    totalTime,
    videoStatus,
    bannerAnime,
  }
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  if (pathname === '/') {
    const presenceData: PresenceData = {
      details: 'Navegando en NekoAnime',
      state: 'Explorando Anime Miau!',
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'NekoAnime',
      smallImageKey: Assets.Search,
      smallImageText: 'Página principal',
      type: ActivityType.Watching,
      startTimestamp: browsingTimestamp,
    }
    presence.setActivity(presenceData)
    return
  }

  if (pathname.startsWith('/search')) {
    const presenceData: PresenceData = {
      details: 'Buscando en NekoAnime',
      state: 'Explorando Anime Miau!',
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'NekoAnime',
      smallImageKey: Assets.Search,
      smallImageText: 'Buscando…',
      type: ActivityType.Watching,
      startTimestamp: Math.floor(Date.now() / 1000),
    }
    presence.setActivity(presenceData)
    return
  }

  const fichaAnimeRegex = /^\/[^/]+\/$/
  if (fichaAnimeRegex.test(pathname)) {
    const animeTitle = document.querySelector('#InfoApp > div.first_cont > div.img-cover > div.img-desc > h1')?.textContent?.trim()

    const presenceData: PresenceData = {
      details: `Revisando ${animeTitle || 'Un Anime'}`,
      state: 'Explorando la descripción',
      largeImageKey: ActivityAssets.Logo,
      largeImageText: 'NekoAnime',
      smallImageKey: Assets.Search,
      smallImageText: 'Leyendo descripción',
      type: ActivityType.Watching,
      startTimestamp: browsingTimestamp,
    }
    presence.setActivity(presenceData)
    return
  }

  const isVideoPage = await videoActive()
  const presenceData: PresenceData = {
    details: 'Navegando en NekoAnime',
    state: 'Explorando anime miau!',
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'NekoAnime',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (isVideoPage) {
    const animeData = await getAnimeInformation()
    if (animeData.animeTitle) {
      presenceData.name = animeData.animeTitle
      presenceData.details = animeData.episodeNumber || 'Miau!'
      delete presenceData.state
      presenceData.type = ActivityType.Watching
      if (animeData.videoStatus === 'Reproduciendo') {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Reproduciendo'
        const videoElement = document.querySelector<HTMLVideoElement>('video.vjs-tech')
        if (videoElement && !Number.isNaN(videoElement.duration)) {
          const [startTs, endTs] = getTimestampsFromMedia(videoElement)
          presenceData.startTimestamp = startTs
          presenceData.endTimestamp = endTs
        }
      }
      else {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Pausado'
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
      if (animeData.bannerAnime) {
        presenceData.largeImageKey = animeData.bannerAnime
        presenceData.largeImageText = animeData.animeTitle
      }
    }
  }
  presence.setActivity(presenceData)
})
