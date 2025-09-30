import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({ clientId: '980817205480550410' })
const strings = presence.getStrings({
  playing: 'general.playing',
  paused: 'general.paused',
  browsing: 'general.browsing',
  watching: 'general.watching',
  anime: 'general.anime',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let video: HTMLVideoElement | null = null
let tags: HTMLElement | null = null

presence.on('iFrameData', async (msg: unknown) => {
  if (!msg)
    return
  try {
    video = msg as HTMLVideoElement
  } catch (e) {
    video = null
  }
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnizmTV/assets/logo.png',
    startTimestamp: browsingTimestamp
  }

  const title = 
    document.querySelector('h1.anizm_pageTitle a.anizmTitleLink') || 
    document.querySelector('h1.anizm_pageTitle a') ||
    document.querySelector('html > body > main > #pageContent > div > h2 > a')
    
  const episode = 
    document.querySelector('h1.anizm_pageTitle span:last-child') || 
    document.querySelector('.episodeContainer h1.anizm_pageTitle span') ||
    document.querySelector('html > body > main > #pageContent > div > h2.anizm_pageTitle > span')
    
  const animeSeries = 
    document.querySelector('h1.anizm_pageTitle a')?.getAttribute('href') || 
    document.querySelector('#pageContent > div > h2 > a')?.getAttribute('href') || 
    document.location.href

  const isAnimeDetailPage = title !== null
  const isAnimePage = isAnimeDetailPage || video !== null

  const getAnimePosterUrl = () => {
    if (!isAnimePage)
      return 'https://cdn.rcd.gg/PreMiD/websites/A/AnizmTV/assets/logo.png'

    const blurredCoverElement = document.querySelector<HTMLElement>('.cover.blurred')
    if (blurredCoverElement?.style?.background) {
      const imgUrlMatch = blurredCoverElement.style.background.match(/url\(['"]?([^'"]+)['"]?\)/i)
      if (imgUrlMatch?.[1]) {
        const posterPath = imgUrlMatch[1].split('/').pop()?.split('?')[0]
        if (posterPath) {
          const currentDomain = window.location.hostname
          return `https://${currentDomain}/storage/pcovers/${posterPath}`
        }
      }
    }

    const animeImageElement = document.querySelector<HTMLElement>('.anizm_posterThumb.anizm_img')
    if (animeImageElement?.style?.backgroundImage) {
      const imgUrl = animeImageElement.style.backgroundImage.replace(/url\(['"]?([^'"]+)['"]?\)/gi, '$1')
      if (imgUrl?.trim()) return imgUrl
    }

    const metaImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
    if (metaImage?.content) return metaImage.content

    return 'https://cdn.rcd.gg/PreMiD/websites/A/AnizmTV/assets/logo.png'
  }

  presenceData.largeImageKey = getAnimePosterUrl()

  if (!title || !episode)
    video = null

  const path = document.location.pathname
  const adminPaths = ['/SeriEkle', '/Bolac', '/TopluBolac', '/BolumSil', '/FanEkle', '/FanSil', '/VideoEkle', '/Toplu', '/HyperVideo', '/yetkiliislemleri']

  if (path && adminPaths.some(adminPath => path.includes(adminPath))) {
    tags = path.includes('/yetkiliislemleri')
      ? document.querySelector<HTMLElement>('#pageContent > div > div > div > div:nth-child(1) > div > div > div.header')
      : document.querySelector<HTMLElement>('#pageContent > div.ui.container.anizm_colorWhite.pb-8 > h2 > span')

    presenceData.details = 'Yönetici Panelinde'
    presenceData.state = `${tags?.textContent || ''} panelinde!`
  }
  else if (path === '/' || path === '/anime-izle') {
    presenceData.details = 'Ana Sayfada geziniyor'
  }
  else if (path.includes('/profil')) {
    presenceData.details = 'Profile Göz Atıyor'
    tags = document.querySelector('#pageContent > div > div.profileCoverArea.autoPosterSize.anizm_round > div.info.pfull > div > div > div:nth-child(1) > div.profileNickname')
    presenceData.state = tags?.textContent?.split('@').slice(1).join(' ') || 'Bir profil'
  }
  else if (path.includes('/ayarlar')) {
    presenceData.details = 'Ayarlara Göz Atıyor'
  }
  else if (path.includes('/tavsiyeRobotu') || path.includes('/tavsiye-robotu')) {
    presenceData.details = 'Tavsiye Robotunu Kullanıyor'
  }
  else if (path.includes('/fansublar')) {
    presenceData.details = 'Fansubları İnceliyor'
  }
  else if (path.includes('/fansub/') && path.includes('/ceviriler')) {
    const headerContent = document.querySelector('.ui.inverted.top.attached.large.header .content')
    const fansubTitle = headerContent?.textContent?.trim().split(' - ')[0] || 'Fansub'

    const stats = document.querySelectorAll('.ui.inverted.mini.statistic .value')
    let animeCount = '?'
    let episodeCount = '?'

    if (stats && stats.length >= 2) {
      animeCount = stats[0]?.textContent?.trim() || '?'
      episodeCount = stats[1]?.textContent?.trim() || '?'
    }

    presenceData.details = `${fansubTitle} çevirilerini inceliyor`
    presenceData.state = `${animeCount} Anime, ${episodeCount} Bölüm`
  }
  else if (path.includes('/fansub/')) {
    const fansubName = document.querySelector('.ui.inverted.top.attached.large.header .content')?.textContent?.trim() || 'Fansub'

    const stats = document.querySelectorAll('.ui.inverted.statistic .value')
    let animeCount = '?'
    let episodeCount = '?'

    if (stats && stats.length >= 2) {
      animeCount = stats[0]?.textContent?.trim() || '?'
      episodeCount = stats[1]?.textContent?.trim() || '?'
    }

    presenceData.details = `${fansubName} inceliyor`
    presenceData.state = `${animeCount} Anime, ${episodeCount} Bölüm`
  }
  else if (path.includes('/ara')) {
    presenceData.details = 'Aranıyor'
    tags = document.querySelector('#pageContent > div > h2 > span')
    presenceData.state = tags?.textContent?.split('Aranan: ').slice(1).join(' ') || ''
  }
  else if (path.includes('/girisyap')) {
    presenceData.details = 'Giriş Yapıyor'
  }
  else if (path.includes('/uyeol')) {
    presenceData.details = 'Üye Oluyor'
  }
  else if (path.includes('/takvim')) {
    presenceData.details = 'Takvime Göz Atıyor'
  }
  else if (window.location.href.indexOf('?sayfa=') > 1) {
    const pageNumber = document.location.href.split('?sayfa=')[1]?.split('#episodes').slice(0).join(' ') || '?'
    presenceData.details = 'Sayfalar Arasında Geziniyor'
    presenceData.state = `Sayfa: ${pageNumber}`
  }
  else if (!title && !episode) {
    presenceData.details = 'Anizm\'de Geziniyor'
  }
  if (title && episode) {
    presenceData.details = title.textContent || 'Anime İzliyor'
    
    let episodeText = episode.textContent || ''
    if (episodeText.startsWith('/ ')) {
      episodeText = episodeText.substring(2)
    } else if (episodeText.startsWith('/')) {
      episodeText = episodeText.substring(1)
    }
    
    presenceData.state = `İzliyor: ${episodeText}`
  }
  else if (title) {
    presenceData.details = title.textContent || 'Anime Detayları'
  }

  if (video) {
    (presenceData as PresenceData).type = ActivityType.Watching
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).paused
      : (await strings).watching

    if (!video.paused && video.duration && Number.isFinite(video.duration)) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
  }

  presence.setActivity(presenceData)
})