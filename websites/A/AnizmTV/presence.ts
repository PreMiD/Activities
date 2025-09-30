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
  video = msg as HTMLVideoElement
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AnizmTV/assets/logo.png',
    startTimestamp: browsingTimestamp, // Add timestamp by default for all states
  }

  // Get basic selectors once - Updated for new site structure
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

  // Check if this is an anime watching page or anime detail page
  const isAnimeDetailPage = title != null
  const isAnimePage = isAnimeDetailPage || video != null

  // Generate poster URL in a more optimized way
  const getAnimePosterUrl = () => {
    if (!isAnimePage)
      return 'https://cdn.rcd.gg/PreMiD/websites/A/AnizmTV/assets/logo.png'

    // Get URL from blurred cover element
    const blurredCoverElement = document.querySelector<HTMLElement>('.cover.blurred')
    if (blurredCoverElement?.style?.background) {
      const imgUrlMatch = blurredCoverElement.style.background.match(/url\(['"]?([^'"]+)['"]?\)/i)
      if (imgUrlMatch?.[1]) {
        const posterPath = imgUrlMatch[1].split('/').pop()?.split('?')[0]
        if (posterPath) {
          // Use current domain dynamically instead of hardcoded anizm.net
          const currentDomain = window.location.hostname
          return `https://${currentDomain}/storage/pcovers/${posterPath}`
        }
      }
    }

    // Get URL from poster thumb element
    const animeImageElement = document.querySelector<HTMLElement>('.anizm_posterThumb.anizm_img')
    if (animeImageElement?.style?.backgroundImage) {
      const imgUrl = animeImageElement.style.backgroundImage.replace(/url\(['"]?([^'"]+)['"]?\)/gi, '$1')
      if (imgUrl?.trim()) return imgUrl
    }

    // Try to get poster from meta tags as fallback
    const metaImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
    if (metaImage?.content) return metaImage.content

    return 'https://cdn.rcd.gg/PreMiD/websites/A/AnizmTV/assets/logo.png'
  }

  presenceData.largeImageKey = getAnimePosterUrl()

  // Clear video object if video is invalid
  if (!title || !episode)
    video = null

  // Set presence data according to page
  const path = document.location.pathname

  // Admin panels check - combined in a single condition
  const adminPaths = ['/SeriEkle', '/Bolac', '/TopluBolac', '/BolumSil', '/FanEkle', '/FanSil', '/VideoEkle', '/Toplu', '/HyperVideo', '/yetkiliislemleri']

  if (adminPaths.some(adminPath => path.includes(adminPath))) {
    tags = path.includes('/yetkiliislemleri')
      ? document.querySelector<HTMLElement>('#pageContent > div > div > div > div:nth-child(1) > div > div > div.header')
      : document.querySelector<HTMLElement>('#pageContent > div.ui.container.anizm_colorWhite.pb-8 > h2 > span')

    presenceData.details = 'Yönetici Panelinde'
    presenceData.state = `${tags?.textContent || ''} panelinde!`
  }
  else if (path === '/' || path === '/anime-izle') {
    presenceData.details = 'Ana Sayfada geziniyor'
    presenceData.buttons = [{ label: 'Ana Sayfayı Ziyaret Et', url: document.location.href }]
  }
  else if (path.includes('/profil')) {
    presenceData.details = 'Profile Göz Atıyor'
    tags = document.querySelector('#pageContent > div > div.profileCoverArea.autoPosterSize.anizm_round > div.info.pfull > div > div > div:nth-child(1) > div.profileNickname')
    presenceData.state = tags?.textContent?.split('@').slice(1).join(' ') || 'Bir profil'
    presenceData.buttons = [{ label: 'Profili Görüntüle', url: document.location.href }]
  }
  else if (path.includes('/ayarlar')) {
    presenceData.details = 'Ayarlara Göz Atıyor'
  }
  else if (path.includes('/tavsiyeRobotu') || path.includes('/tavsiye-robotu')) {
    presenceData.details = 'Tavsiye Robotunu Kullanıyor'
    presenceData.buttons = [{ label: 'Tavsiye Robotunu Kullan', url: document.location.href }]
  }
  else if (path.includes('/fansublar')) {
    presenceData.details = 'Fansubları İnceliyor'
    presenceData.buttons = [{ label: 'Fansubları Görüntüle', url: document.location.href }]
  }
  else if (path.includes('/fansub/') && path.includes('/ceviriler')) {
    // Fansub translations page
    const headerContent = document.querySelector('.ui.inverted.top.attached.large.header .content')
    const fansubTitle = headerContent?.textContent?.trim().split(' - ')[0] || 'Fansub'

    // Get statistics
    const stats = document.querySelectorAll('.ui.inverted.mini.statistic .value')
    let animeCount = '?'
    let episodeCount = '?'

    if (stats && stats.length >= 2) {
      animeCount = stats[0]?.textContent?.trim() || '?'
      episodeCount = stats[1]?.textContent?.trim() || '?'
    }

    presenceData.details = `${fansubTitle} çevirilerini inceliyor`
    presenceData.state = `${animeCount} Anime, ${episodeCount} Bölüm`
    presenceData.buttons = [{ label: 'Çevirileri Görüntüle', url: document.location.href }]
  }
  else if (path.includes('/fansub/')) {
    // Fansub detail page
    const fansubName = document.querySelector('.ui.inverted.top.attached.large.header .content')?.textContent?.trim() || 'Fansub'

    // Get statistics
    const stats = document.querySelectorAll('.ui.inverted.statistic .value')
    let animeCount = '?'
    let episodeCount = '?'

    if (stats && stats.length >= 2) {
      animeCount = stats[0]?.textContent?.trim() || '?'
      episodeCount = stats[1]?.textContent?.trim() || '?'
    }

    presenceData.details = `${fansubName} inceliyor`
    presenceData.state = `${animeCount} Anime, ${episodeCount} Bölüm`
    presenceData.buttons = [{ label: 'Fansubu Görüntüle', url: document.location.href }]
  }
  else if (path.includes('/ara')) {
    presenceData.details = 'Aranıyor'
    tags = document.querySelector('#pageContent > div > h2 > span')
    presenceData.state = tags?.textContent?.split('Aranan: ').slice(1).join(' ') || ''
    presenceData.buttons = [{ label: 'Aramayı Görüntüle', url: document.location.href }]
  }
  else if (path.includes('/girisyap')) {
    presenceData.details = 'Giriş Yapıyor'
  }
  else if (path.includes('/uyeol')) {
    presenceData.details = 'Üye Oluyor'
  }
  else if (path.includes('/takvim')) {
    presenceData.details = 'Takvime Göz Atıyor'
    presenceData.buttons = [{ label: 'Takvimi Görüntüle', url: document.location.href }]
  }
  else if (window.location.href.indexOf('?sayfa=') > 1) {
    const pageNumber = document.location.href.split('?sayfa=')[1]?.split('#episodes').slice(0).join(' ') || '?'
    presenceData.details = 'Sayfalar Arasında Geziniyor'
    presenceData.state = `Sayfa: ${pageNumber}`
  }
  else if (!title && !episode) {
    // If doesn't match any special condition
    presenceData.details = 'Anizm\'de Geziniyor'
    presenceData.buttons = [{ label: 'Anizm\'i Ziyaret Et', url: document.location.href }]
  }

  // Episode watching state - Updated for new episode structure
  if (title && episode) {
    presenceData.details = title.textContent || 'Anime İzliyor'
    
    // Updated episode text extraction for new format
    let episodeText = episode.textContent || ''
    // Remove leading "/ " if it exists
    if (episodeText.startsWith('/ ')) {
      episodeText = episodeText.substring(2)
    } else if (episodeText.startsWith('/')) {
      episodeText = episodeText.substring(1)
    }
    
    presenceData.state = `İzliyor: ${episodeText}`
    presenceData.buttons = [
      { label: 'Bölümü İzle', url: document.location.href.split('&')[0] || document.location.href },
      { label: (await strings).anime, url: animeSeries },
    ]
  }
  else if (title) {
    // Anime detail page
    presenceData.details = title.textContent || 'Anime Detayları'
    presenceData.buttons = [{ label: (await strings).anime, url: animeSeries }]
  }

  // If video exists and is playing
  if (video) {
    (presenceData as PresenceData).type = ActivityType.Watching
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? (await strings).paused
      : (await strings).watching

    if (!video.paused && video.duration) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
  }

  presence.setActivity(presenceData)
})
