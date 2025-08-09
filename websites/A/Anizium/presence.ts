import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1342545631629152287',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Images {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/logo.png',
  SettingsICO = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/0.png',
}

interface iframeData {
  duration: number
  currentTime: number
  paused: boolean
}
let video: iframeData | undefined

let savedPosterUrl: string | null = null
let seasonModeActive = false

function updatePoster() {
  const pathname = document.location.pathname

  if (pathname.includes('/anime/')) {
    const bannerimage = document.querySelector('.overlay-wrapper.iq-main-slider') as HTMLElement
    if (!bannerimage)
      return

    const backgroundimg = bannerimage.style.background || window.getComputedStyle(bannerimage).background

    const urlMatch = backgroundimg.match(/url\(["']?(.*?)["']?\)/)

    if (!urlMatch || urlMatch.length < 2)
      return

    const aniURL = urlMatch[1] as string
    const luiUrl = aniURL.replace(
      /^https:\/\/x\.anizium\.co\/assets\/anime-details-banner\//,
      'https://ani.luii.xyz/assets/anime-details-banner/',
    )

    savedPosterUrl = luiUrl
    seasonModeActive = false
  }

  else if (pathname.includes('/watch/')) {
    const animeImg = document.querySelector('.image-box > img')?.getAttribute('src')

    if (!animeImg)
      return

    const luiUrl = animeImg.replace(
      /^https:\/\/x\.anizium\.co\/assets\/anime-poster\//,
      'https://ani.luii.xyz/assets/anime-poster/',
    )

    if (!seasonModeActive) {
      seasonModeActive = true
      savedPosterUrl = luiUrl
    }
  }

  else {
    savedPosterUrl = null
    seasonModeActive = false
  }
}

function buildPresence(): PresenceData {
  const presenceData: PresenceData = {
    largeImageKey: savedPosterUrl || Images.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  if (video && document.location.pathname.includes('/watch/')) {
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused ? 'Duraklatıldı' : 'Oynatılıyor'
    const [start, end] = getTimestamps(video.currentTime, video.duration)
    presenceData.startTimestamp = start
    if (!video.paused) {
      presenceData.endTimestamp = end
    }
  }

  return presenceData
}

presence.on('iFrameData', (data: unknown) => {
  if (data) {
    video = data as iframeData

    updatePoster()

    if (document.location.pathname === '/anime'
      || document.location.pathname.includes('/anime/')
    ) {
      const iframePresenceData = buildPresence()

      if (document.location.pathname.includes('/watch/')) {
        const animetitleelement = document.querySelector('.d-block > h2')
        const animetitle = animetitleelement && animetitleelement.textContent ? animetitleelement.textContent.trim() : 'Loading'

        const cut = animetitle.match(/^(.*)\s(S\d+\sB\d+)$/)

        if (cut && cut[1] && cut[2]) {
          iframePresenceData.details = cut[1].trim()
          iframePresenceData.state = cut[2]
        }
        else {
          iframePresenceData.details = animetitle
          iframePresenceData.state = 'Bölüm bilgisi bulunamadı'
        }
      }
      else {
        iframePresenceData.details = document.querySelector('.trailer-content h1')?.textContent || 'Loading'
        iframePresenceData.state = 'Bölümler görüntüleniyor'
      }

      presence.setActivity(iframePresenceData)
    }
  }
})

presence.on('UpdateData', async () => {
  setTimeout(() => {
    updatePoster()

    const presenceData = buildPresence()
    const pathname = document.location.pathname

    if (
      pathname === '/'
      || pathname === '/privacy-policy'
      || pathname === '/comment-policy'
      || pathname === '/tos'
    ) {
      presenceData.details = 'Anizium'
      presenceData.state = 'Ana Sayfa görüntüleniyor'
    }
    else if (pathname.includes('/watch/')) {
      const params = new URLSearchParams(window.location.search)
      const season = params.get('season')
      const episode = params.get('episode')

      const animetitleelement = document.querySelector('.d-block > h2')
      let animetitle = animetitleelement?.textContent?.trim() || 'Loading'

      if (/\s*S\d+\s*B\d+$/i.test(animetitle)) {
        animetitle = animetitle.replace(/\s*S\d+\s*B\d+$/i, '').trim()
      }

      if (season && episode) {
        presenceData.details = animetitle
        presenceData.state = `Sezon ${season} | Bölüm ${episode}`
      }
      else {
        presenceData.details = animetitle
        presenceData.state = 'Tek Bölüm'
      }
    }
    else if (pathname.includes('/anime/')) {
      const animetitle = document.querySelector('html > head > title')?.textContent || 'Loading'
      const titlecut = animetitle.replace(/ - Anizium$/, '')
      presenceData.details = titlecut
      presenceData.state = 'Bölümler görüntüleniyor'
    }
    else if (
      pathname === '/animes'
      || pathname.includes('/animes/')
    ) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Göz atılıyor..'
      presenceData.details = 'Anizium'
      presenceData.state = 'Göz atılıyor..'
    }
    else if (pathname.includes('/catalog')) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.details = 'Anizium'
      presenceData.state = 'Kategoriler inceleniyor..'
    }
    else if (
      pathname === '/premium'
      || pathname.includes('/pay/')
    ) {
      presenceData.details = 'Anizium'
      presenceData.state = 'Premium paketleri görüntüleniyor'
    }
    else if (
      pathname === '/anime-request'
      || pathname.includes('/anime-request/')
    ) {
      presenceData.details = 'Anizium'
      presenceData.state = 'İstek animeler görüntüleniyor'
    }
    else if (
      pathname === '/calendar'
    ) {
      presenceData.details = 'Anizium'
      presenceData.state = 'Takvim görüntüleniyor'
    }
    else if (
      pathname === '/account'
      || pathname === '/premium/manager'
      || pathname === '/devices'
      || pathname === '/change-password'
    ) {
      presenceData.smallImageKey = Images.SettingsICO
      presenceData.details = 'Anizium'
      presenceData.state = 'Hesap yönetimi'
    }
    else if (
      pathname === '/profiles'
      || pathname.includes('/option')
    ) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Profiller'
      presenceData.details = 'Anizium'
      presenceData.state = 'Profiller görüntüleniyor'
    }
    else if (
      pathname.includes('/avatar-list')
    ) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.details = 'Anizium'
      presenceData.state = 'Avatar seçimi'
    }
    else if (
      pathname.includes('/watch-list')
    ) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.details = 'Anizium'
      presenceData.state = 'İzleme listesi görüntüleniyor'
    }
    else if (
      pathname.includes('/favorite-list')
    ) {
      presenceData.smallImageKey = Assets.Viewing
      presenceData.details = 'Anizium'
      presenceData.state = 'Favoriler görüntüleniyor'
    }
    else {
      switch (pathname) {
        case '/list':
          presenceData.smallImageKey = Assets.Viewing
          presenceData.smallImageText = 'Listeler'
          presenceData.details = 'Anizium'
          presenceData.state = 'Listeler görüntüleniyor..'
          break
        case '/search':
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = 'Aranıyor'
          presenceData.details = 'Aranıyor:'
          presenceData.state = document.querySelector('.container > .heading h2')?.textContent
          break
        default:
          presenceData.details = 'Anizium'
          presenceData.state = 'Sayfa görüntüleniyor..'
          break
      }
    }

    presence.setActivity(presenceData)
  }, 1000)
})
