import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1379070900653260840',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/N/NekoAnime/assets/0.png',
}

let animePageCache: {
  text: string
  animeTitle: string
  episodeNumber: string
  bannerAnime: string
} = {
  text: '',
  animeTitle: '',
  episodeNumber: '',
  bannerAnime: ActivityAssets.Logo,
}

async function getBannerAnimer(urlTitulo: string) {
  const res = await fetch(`https://nekoanime.mx${urlTitulo}`)
  const html = await res.text()

  if (html) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const img = doc.querySelector('.anim-img')?.querySelector('img')?.getAttribute('src')
    const bannerAnime = img
    return bannerAnime || ActivityAssets.Logo
  }
}

async function getAnimeInformation(text: string) {
  if (text === animePageCache.text && animePageCache.animeTitle !== '' && animePageCache.episodeNumber !== '') {
    return {
      animeTitle: animePageCache.animeTitle,
      episodeNumber: animePageCache.episodeNumber,
      bannerAnime: animePageCache.bannerAnime,
    }
  }
  const animeTitle = document.querySelector('.episode_info > h2')?.textContent || ''
  const episodeNumber = document.querySelector('#number')?.textContent || ''

  const urlTitulo = document.querySelector('.anime_navigation')?.querySelector('nav')?.querySelector('a:nth-child(3)')?.getAttribute('href')
  const bannerAnime = (urlTitulo ? await getBannerAnimer(urlTitulo) : null) || ActivityAssets.Logo

  animePageCache = {
    text,
    animeTitle,
    episodeNumber,
    bannerAnime,
  }

  return {
    animeTitle,
    episodeNumber,
    bannerAnime,
  }
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    details: 'NekoAnime',
    state: 'Viendo Inicio!',
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'NekoAnime',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const videoElement = document.querySelector<HTMLVideoElement>('video.vjs-tech')
  if (videoElement) {
    const animeData = await getAnimeInformation(pathname)
    if (animeData) {
      presenceData.name = animeData.animeTitle
      presenceData.details = animeData.animeTitle
      presenceData.state = `${animeData.episodeNumber} [NekoAnime]`
      presenceData.type = ActivityType.Watching
      presenceData.largeImageKey = animeData.bannerAnime
      presenceData.largeImageText = animeData.animeTitle

      if (!videoElement.paused) {
        presenceData.smallImageKey = Assets.Play
        presenceData.smallImageText = 'Reproduciendo'

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
    }
  }
  else if (pathname.includes('/search')) {
    presenceData.details = 'Viendo NekoAnime'
    presenceData.state = 'Buscando Animes!'
    presenceData.largeImageText = 'NekoAnime'
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Buscando…'

    presence.setActivity(presenceData)
    return
  }

  const descPage = document.querySelector('.anime_module')
  if (descPage) {
    presenceData.details = document.querySelector('.anim-title')?.textContent?.trim() || 'Viendo NekoAnime'
    presenceData.state = document.querySelector('.synopsis')?.querySelector('p')?.textContent?.trim() || 'Revisando Descripcion'
    presenceData.largeImageKey = document.querySelector('.anim-img')?.querySelector('img')?.getAttribute('src') || ActivityAssets.Logo
    presenceData.largeImageText = document.querySelector('.anim-title')?.textContent?.trim() || 'NekoAnime'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Leyendo Descripción'

    presence.setActivity(presenceData)
    return
  }

  presence.setActivity(presenceData)
})
