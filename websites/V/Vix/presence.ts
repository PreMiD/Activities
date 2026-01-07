import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1449327500814712842',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/nrVsqoB.png',
}

let cache: {
  text: string
  nombreSerie: string
  episodioSerie: string
  bannerImg: string
  episodioNombre: string
} = {
  text: '',
  nombreSerie: '',
  episodioSerie: '',
  bannerImg: ActivityAssets.Logo,
  episodioNombre: '',
}

async function videoData(text: string) {
  if (text === cache.text && cache.nombreSerie !== '') {
    return {
      nombreSerie: cache.nombreSerie,
      episodioSerie: cache.episodioSerie,
      bannerImg: cache.bannerImg,
      episodioNombre: cache.episodioNombre,
    }
  }

  const nombreSerie = document.querySelector('[class*="GEPA0QG"] > div > *')?.textContent || ''

  const episodioSerie = document.querySelector('h2')?.parentElement?.querySelector('span:nth-child(1)')?.textContent || ''

  const episodioNombre = document.querySelector('span:nth-child(2)')?.textContent || ''

  const bannerElement = document.querySelector('meta[property="og:image"]')
  const bannerImg = bannerElement?.getAttribute('content') || ActivityAssets.Logo

  cache = {
    text,
    nombreSerie,
    episodioSerie,
    bannerImg,
    episodioNombre,
  }

  return {
    nombreSerie,
    episodioSerie,
    bannerImg,
    episodioNombre,
  }
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Search,
    type: ActivityType.Watching,
    state: 'Navegando en Vix',
  }

  if (pathname.includes('/video/')) {
    const elVideo = document.querySelector<HTMLVideoElement>('video')
    const infoSerie = await videoData(pathname)
    if (elVideo && infoSerie) {
      presenceData.name = infoSerie.nombreSerie || 'Vix'
      presenceData.details = `${infoSerie.episodioSerie} - ${infoSerie.episodioNombre}`
      presenceData.state = 'Viendo en Vix'
      presenceData.largeImageKey = infoSerie.bannerImg || ActivityAssets.Logo
      presenceData.largeImageText = `${infoSerie.nombreSerie} Viendo en Vix`

      if (!elVideo.paused) {
        presenceData.smallImageText = 'Reproduciendo'
        presenceData.smallImageKey = Assets.Play

        if (elVideo && !Number.isNaN(elVideo.duration)) {
          const [startTs, endTs] = getTimestampsFromMedia(elVideo)
          presenceData.startTimestamp = startTs
          presenceData.endTimestamp = endTs
        }
      }
      else {
        presenceData.smallImageText = 'Pausado'
        presenceData.smallImageKey = Assets.Pause
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
      }
    }
  }
  else if (pathname.includes('/detail/')) {
    const nameSerie = document.querySelector('main h1')?.textContent || 'Vix'
    const descSerie = document.querySelector('[class*="DetailBody_description"]')?.textContent || 'Sin descripción'

    presenceData.details = nameSerie || 'Navegando en Vix'
    presenceData.state = descSerie || 'Explorando en Vix'
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.largeImageText = 'Explorando en Vix'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/ondemandplus')) {
    const categoryMap = {
      series: 'Series',
      peliculas: 'Películas',
      novelas: 'Novelas',
      music: 'Musica',
      podcasts: 'Podcast',
    } as const
    const parts = pathname.split('/ondemandplus/')
    const slug = parts[1]?.split('/')[0]

    const categoryName = slug && slug in categoryMap ? categoryMap[slug as keyof typeof categoryMap] : 'Pagina Principal'

    presenceData.details = 'Navegando en Vix'
    presenceData.state = `Viendo: ${categoryName}`
    presenceData.largeImageText = 'Navegando en Vix'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/noticias')) {
    presenceData.details = 'Explorando en Vix'
    presenceData.state = 'Viendo Noticias'
    presenceData.largeImageText = 'Viendo Noticias'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/canales')) {
    const canalName = document.querySelector('header h2, section h2')?.textContent || 'Canales'

    presenceData.details = 'Explorando Canales'
    presenceData.state = `Viendo: ${canalName}`
    presenceData.largeImageText = `Viendo: ${canalName}`
  }
  presence.setActivity(presenceData)
})
