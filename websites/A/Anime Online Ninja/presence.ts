import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1404246681536434266',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Online%20Ninja/assets/logo.png',
  Gif = 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Online%20Ninja/assets/0.gif',
}

let cacheEpisode: {
  text: string
  numberEpisode: string
  seasonAnime: string
  nameAnime: string
  bannerImg: string
  nameAnimeUrl: string | null | undefined
  epDesc: string | undefined | null
} = {
  text: '',
  numberEpisode: '1',
  seasonAnime: '',
  nameAnime: '',
  bannerImg: ActivityAssets.Logo,
  nameAnimeUrl: '',
  epDesc: '',
}

async function getEpisode(text: string) {
  if (text === cacheEpisode.text) {
    return {
      nameAnime: cacheEpisode.nameAnime,
      numberEpisode: cacheEpisode.numberEpisode,
      seasonAnime: cacheEpisode.seasonAnime,
      bannerImg: cacheEpisode.bannerImg,
      nameAnimeUrl: cacheEpisode.nameAnimeUrl,
      epDesc: cacheEpisode.epDesc,
    }
  }

  const normalize = (s: string) =>
    s
      .replace(/[\u00A0\u202F\u205F\u3000]|\u2000-\u200B/g, ' ')
      .replace(/：/g, ':')
      .replace(/[–—]/g, '-')
      .replace(/[×✕✖]/g, 'x')
      .replace(/\s+/g, ' ')
      .trim()

  const rawTitle = document.querySelector('#info > h1')?.textContent || document.querySelector('#single h1')?.textContent || 'Undefined'
  const title = normalize(rawTitle)
  const nameAnime
    = title.split(/[:\-](?=\s*\d+\s*x\s*\d)/i)[0]?.trim() || ''

  const sm = title.match(/[:\-]?\s*(\d+)\s*x\s*(\d+)/iu)
  const seasonNumber = sm?.[1] ?? '1'
  const episodeNumber = sm?.[2] ?? '1'
  const seasonAnime = `Season ${seasonNumber}`
  const numberEpisode = `Episode ${episodeNumber}`
  const epDesc = ((p3 => (p3 && /temporada/i.test(p3.textContent || '')) ? p3.nextElementSibling?.textContent : p3?.textContent)(document.querySelector('#info > div > p:nth-child(3)')) || 'Viendo en Anime Online Ninja').trim().slice(0, 123)
  const nameAnimeUrl = document
    .querySelector('#single > div.content.right > div.pag_episodes > div:nth-child(2) > a')
    ?.getAttribute('href') ?? undefined

  const img = document.querySelector<HTMLImageElement>('#dt_galery img.lazy')
  const raw = img?.dataset?.src ?? img?.getAttribute('src') ?? img?.src ?? ActivityAssets.Logo
  const bannerImg = typeof raw === 'string' ? raw.trim().replace(/\r?\n/g, '') : ActivityAssets.Logo

  cacheEpisode = {
    text,
    nameAnime,
    seasonAnime,
    numberEpisode,
    bannerImg,
    nameAnimeUrl,
    epDesc,
  }

  return {
    nameAnime,
    seasonAnime,
    numberEpisode,
    bannerImg,
    nameAnimeUrl,
  }
}

let iframePlayback = false
let currTime = 0
let durTime = 0
let isPaused = true

presence.on('iFrameData', (data: any) => {
  if (data.iFrameVideoData) {
    iframePlayback = true
    currTime = data.iFrameVideoData.currTime
    durTime = data.iFrameVideoData.dur
    isPaused = data.iFrameVideoData.paused
  }
})

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
    type: ActivityType.Watching,
  }

  if (/^\/pelicula\/[^/]+\/?$/.test(pathname) || pathname.includes('/episodio/')) {
    const player = document.querySelector('#dooplay_player_response')
    if (player) {
      const dataAnime = document.querySelector('#info > h1')?.textContent || document.querySelector('#single h1')?.textContent
      if (dataAnime) {
        const animeData = await getEpisode(dataAnime)
        if (animeData) {
          presenceData.name = animeData.nameAnime
          presenceData.details = animeData.nameAnime
          presenceData.state = animeData.epDesc
          presenceData.largeImageKey = animeData.bannerImg
          presenceData.largeImageText = `${animeData.seasonAnime.toString()}, ${animeData.numberEpisode.toString()}`

          if (iframePlayback) {
            presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play
            presenceData.smallImageText = isPaused ? 'Pausado' : 'Reproduciendo'
          }

          if (!isPaused) {
            const [startTs, endTs] = getTimestamps(
              Math.floor(currTime),
              Math.floor(durTime),
            )
            presenceData.startTimestamp = startTs
            presenceData.endTimestamp = endTs
          }
          else {
            delete presenceData.startTimestamp
            delete presenceData.endTimestamp
          }
        }
      }
    }
  }
  else if (pathname.includes('/genero/')) {
    presenceData.details = 'Navegando'
    presenceData.state = 'Viendo: Categorias'
    presenceData.largeImageKey = ActivityAssets.Gif
    presenceData.smallImageKey = Assets.Search
  }
  else if (/^\/pelicula\/?$/.test(pathname)) {
    presenceData.details = 'Navegando'
    presenceData.state = 'Viendo: Peliculas'
    presenceData.largeImageKey = ActivityAssets.Gif
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/ratings/')) {
    presenceData.details = 'Navegando'
    presenceData.state = 'Viendo: Los Mas Valorados'
    presenceData.largeImageKey = ActivityAssets.Gif
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/tendencias/')) {
    presenceData.details = 'Navegando'
    presenceData.state = 'Viendo: Ultimas Tendencias'
    presenceData.largeImageKey = ActivityAssets.Gif
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/online/')) {
    presenceData.details = 'Navegando'
    presenceData.state = `Viendo: ${document.querySelector('#single h1')?.textContent}` || 'Un Anime'
    presenceData.largeImageKey = ActivityAssets.Gif
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.includes('/')) {
    presenceData.details = 'Navegando'
    presenceData.state = 'Viendo la Pagina Principal'
    presenceData.largeImageKey = ActivityAssets.Gif
    presenceData.smallImageKey = Assets.Reading
  }
  presence.setActivity(presenceData)
})
