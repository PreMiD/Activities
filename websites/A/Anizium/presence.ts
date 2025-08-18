import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1342545631629152287',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum Images {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/logo.png',
  SettingsICO = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/0.png',
}

const GenreMap: Record<string, string> = {
  2263: 'Video Oyunları',
  59517: 'Politik',
  38454: 'Vampir',
  46190: 'Ajan',
  72405: 'Dedektif',
  38932: 'Reenkarnasyon',
  21923: 'Şehir Macerası',
  90158: 'Bilim Kurgu',
  30302: 'Uzay',
  25731: 'Spor',
  75150: 'Sanat',
  8159: 'Tarih',
  41359: 'Strateji Oyunları',
  84484: 'Ödüllü Animeler',
  33458: 'Hayatta Kalma',
  40034: 'Askeri',
  88689: 'Dövüş Sanatları',
  17263: 'Ecchi',
  73510: 'Harem',
  82742: 'Büyü ve Kılıç',
  43306: 'Mitoloji',
  81980: 'Aşk Üçgeni',
  7628: 'Korku',
  78746: 'Gizem',
  34953: 'Iyashikei',
  11860: 'Doğaüstü',
  54464: 'Aile ve Çocuk',
  57593: 'Gerilim',
  92619: 'Karanlık Fantastik',
  29049: 'Psikolojik',
  14837: 'Gençlik Hikayesi',
  79793: 'Vahşet',
  66407: 'Türkçe Dublaj',
  79741: 'İngilizce Dublaj',
  15055: 'Çoklu Alt Yazı',
  73505: 'Okul',
  43261: 'Fantastik',
  57282: 'Dram',
  40561: 'Absürt Komedi',
  33359: 'Zaman Yolculuğu',
  59624: 'Romantizm',
  53897: 'Çete',
  4088: 'Suç',
  50737: 'Parodi',
  40838: 'Kara Mizah',
  47450: 'Komedi',
  47202: 'Yaşamdan Kesitler',
  98901: 'Shojo',
  94032: 'Shounen',
  87910: 'Seinen',
  21846: 'Meka',
  23813: 'Isekai',
  5263: 'Macera',
  19214: 'Süper Güçler',
  63917: 'Samuray',
  62263: 'Aksiyon',
}

interface IframeData {
  duration: number
  currentTime: number
  paused: boolean
}

class AniziumPresence {
  private video: IframeData | undefined
  private savedPosterUrl: string | null = null
  private seasonModeActive = false

  constructor() {
    this.init()
  }

  private init(): void {
    presence.on('iFrameData', (data: unknown) => {
      if (data) {
        this.video = data as IframeData
        this.updatePoster()
        this.handleWatchPage()
      }
    })

    presence.on('UpdateData', async () => {
      setTimeout(() => {
        this.updatePoster()
        this.handlePresenceUpdate()
      }, 1000)
    })
  }

  private updatePoster(): void {
    const pathname = document.location.pathname

    if (pathname.includes('/anime/')) {
      this.handleAnimePage()
    }
    else if (pathname.includes('/watch/')) {
      this.handleWatchPagePoster()
    }/* //*luii nin studio logolarını eklemesi bekleniyor
    else if (pathname.includes('/studio')) {
      this.handleStudioPagePoster()
    } */
    else {
      this.resetPoster()
    }
  }

  private handleAnimePage(): void {
    const bannerImage = document.querySelector<HTMLElement>(
      '.overlay-wrapper.iq-main-slider',
    )
    if (!bannerImage)
      return

    const backgroundImg
            = bannerImage.style.background
              || window.getComputedStyle(bannerImage).background

    const urlMatch = backgroundImg.match(/url\(["']?(.*?)["']?\)/)
    if (!urlMatch?.[1])
      return

    this.savedPosterUrl = this.convertToLuiiUrl(
      urlMatch[1],
      'anime-details-banner',
    )
    this.seasonModeActive = false
  }

  private handleWatchPagePoster(): void {
    const animeImg
            = document.querySelector<HTMLImageElement>('.image-box > img')?.src
    if (!animeImg)
      return

    const luiUrl = this.convertToLuiiUrl(animeImg, 'anime-poster')

    if (!this.seasonModeActive) {
      this.seasonModeActive = true
      this.savedPosterUrl = luiUrl
    }
  }

  /* //*luii nin studio logolarını eklemesi bekleniyor
  private handleStudioPagePoster(): void {
    const studioImg = document.querySelector<HTMLImageElement>('#studio_logo')?.src

    if (!studioImg)
      return

    const luiUrl = this.convertToLuiiUrl(studioImg, 'studio-logo')

    this.savedPosterUrl = luiUrl
    this.seasonModeActive = false
  }
    */

  private convertToLuiiUrl(originalUrl: string, path: string): string {
    return originalUrl.replace(
      `https://x.anizium.co/assets/${path}/`,
      `https://ani.luii.xyz/assets/${path}/`,
    )
  }

  private resetPoster(): void {
    this.savedPosterUrl = null
    this.seasonModeActive = false
  }

  private buildBasePresence(): PresenceData {
    const presenceData: PresenceData = {
      largeImageKey: this.savedPosterUrl || Images.Logo,
      startTimestamp: browsingTimestamp,
      type: ActivityType.Watching,
    }

    if (this.video && document.location.pathname.includes('/watch/')) {
      presenceData.smallImageKey = this.video.paused
        ? Assets.Pause
        : Assets.Play
      presenceData.smallImageText = this.video.paused
        ? 'Duraklatıldı'
        : 'Oynatılıyor'

      const [start, end] = getTimestamps(
        this.video.currentTime,
        this.video.duration,
      )
      presenceData.startTimestamp = start

      if (!this.video.paused) {
        presenceData.endTimestamp = end
      }
    }

    return presenceData
  }

  private handleWatchPage(): void {
    if (!document.location.pathname.includes('/anime/'))
      return

    const presenceData = this.buildBasePresence()

    if (document.location.pathname.includes('/watch/')) {
      const animeTitle = this.getAnimeTitle()
      const { title, episode } = this.parseAnimeTitle(animeTitle)

      presenceData.details = title
      presenceData.state = episode
    }
    else {
      presenceData.details
                = document.querySelector('.trailer-content h1')?.textContent
                  || 'Loading'
      presenceData.state = 'Bölümler görüntüleniyor'
    }

    presence.setActivity(presenceData)
  }

  private getAnimeTitle(): string {
    const titleElement = document.querySelector('html > head > title')
    const pageTitle = titleElement?.textContent?.trim() || 'Loading'

    if (pageTitle === 'Anizium - Türkçe Dublaj & 4K İzleme Platformu') {
      return 'Loading'
    }

    return pageTitle
      .replace(/ - Anizium$/, '')
      .replace(/ İzle$/, '')
      .replace(/\s+\d+\.\s*Sezon.*$/, '')
      .trim()
  }

  private parseAnimeTitle(title: string): { title: string, episode: string } {
    const seasonEpisodeMatch = title.match(/^(.*)\s(S\d+\sB\d+)$/)

    if (seasonEpisodeMatch?.[1] && seasonEpisodeMatch[2]) {
      return {
        title: seasonEpisodeMatch[1].trim(),
        episode: seasonEpisodeMatch[2],
      }
    }

    return {
      title,
      episode: 'Bölüm bilgisi bulunamadı',
    }
  }

  // Dinamik routelar için yardımcı method
  private getRoutePattern(pathname: string): string {
    if (pathname.includes('/watch/'))
      return '/watch/'
    if (pathname.includes('/anime/'))
      return '/anime/'
    if (pathname.includes('/catalog'))
      return '/catalog/'
    return pathname
  }

  private handlePresenceUpdate(): void {
    const presenceData = this.buildBasePresence()
    const pathname = document.location.pathname
    const routePattern = this.getRoutePattern(pathname)

    const routeHandlers: Record<string, () => void> = {
      // Statik routelar
      '/': () => this.handleHomePage(presenceData),
      '/profiles': () => this.handleProfilesPage(presenceData),
      '/avatar-list': () => this.handleAvatarListPage(presenceData),
      '/animes': () => this.handleAnimesPage(presenceData),
      '/anime-request': () => this.handleAnimeRequestsPage(presenceData),
      '/premium': () => this.handlePremiumPage(presenceData),
      '/pay/process': () => this.handlePayPage(presenceData),
      '/calendar': () => this.handleCalendarPage(presenceData),
      '/account': () => this.handleAccountPage(presenceData),
      '/ticket': () => this.handleTicketPage(presenceData),
      '/search': () => this.handleSearchPage(presenceData),
      '/favorite-list': () => this.handleFavoriteList(presenceData),
      '/watch-list': () => this.handleWatchList(presenceData),
      '/watched-list': () => this.handleWatchedList(presenceData),
      '/studio': () => this.handleStudioPage(presenceData),
      '/privacy-policy': () => this.handlePrivacyPolicy(presenceData),
      '/comment-policy': () => this.handleCommentPolicy(presenceData),
      '/tos': () => this.handleTos(presenceData),

      // Dinamik routelar
      '/watch/': () => this.handleWatchPageUpdate(presenceData),
      '/anime/': () => this.handleAnimePageUpdate(presenceData),
      '/catalog/': () => this.handleCatalogPage(presenceData),
    }

    if (routeHandlers[routePattern]) {
      routeHandlers[routePattern]()
    }
    else {
      this.handleDefaultPage(presenceData)
    }

    presence.setActivity(presenceData)
  }

  private handleDefaultPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Sayfa görüntüleniyor..'
  }

  private handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Ana Sayfa görüntüleniyor'
  }

  private handleProfilesPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Profil Seçiyor...'
  }

  private handleAvatarListPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Avatar Seçiyor...'
  }

  private handleAnimesPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Animelere göz atıyor..'
    presenceData.details = 'Anizium'

    const activeListType = this.getActiveAnimeListType()
    presenceData.state = activeListType || 'Animelere göz atıyor...'
  }

  private getActiveAnimeListType(): string | null {
    const activeSelectors = [
      {
        selector: 'a[style*="rgb(246, 34, 28)"]',
        text: 'Anizium Top listesini görüntülüyor',
      },
      {
        selector: 'a[style*="rgba(191, 56, 199, 0.55)"]',
        text: 'Tüm Animeler listesini görüntülüyor',
      },
      {
        selector: 'a[style*="rgb(246, 199, 0)"]',
        text: 'IMDb Top listesini görüntülüyor',
      },
    ]

    for (const { selector, text } of activeSelectors) {
      if (document.querySelector(selector)) {
        return text
      }
    }

    return null
  }

  private handleAnimeRequestsPage(presenceData: PresenceData): void {
    const params = new URLSearchParams(document.location.search)
    const searchValue = params.get('search')

    if (searchValue) {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Aranıyor'
      presenceData.details = 'Anime İstek'
      presenceData.state = `Şunu aratıyor: "${decodeURIComponent(searchValue)}"`
      return
    }

    const activeButton = document.querySelector<HTMLAnchorElement>(
      'a#animeRequestStatus[style*="rgba(51, 255, 29, 0.43)"]',
    )

    if (activeButton?.textContent) {
      presenceData.details = 'Anime İstek'
      const buttonText = activeButton.textContent.trim()
      presenceData.state = `${buttonText} listesine göz atıyor`
    }
    else {
      presenceData.state = 'İstek animelere göz atıyor...'
    }
  }

  private handlePremiumPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'

    const donationPopup
            = document.querySelector<HTMLElement>('#donationPopup')
    const giftCodeModalTitle = document.querySelector('h2.swal2-title')

    if (
      donationPopup
      && window.getComputedStyle(donationPopup).display === 'flex'
    ) {
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'Proje destek bölümüne bakıyor'
    }
    else if (
      giftCodeModalTitle
      && giftCodeModalTitle.textContent === 'Hediye Kodu Kullan'
    ) {
      presenceData.state = 'Hediye kodu giriyor'
    }
    else {
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'Premium paketlerini görüntülüyor'
    }
  }

  private handlePayPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Ödeme Yapıyor'
  }

  private handleCalendarPage(presenceData: PresenceData): void {
    const activeButton = document.querySelector<HTMLButtonElement>(
      'button[style*="rgba(51, 255, 29, 0.43)"]',
    )

    if (activeButton?.textContent) {
      presenceData.state = `${activeButton.textContent.trim()} bölümünü inceliyor`
      presenceData.details = 'Takvim'
    }
    else {
      presenceData.details = 'Anizium'
      presenceData.state = 'Takvim görüntüleniyor'
    }
  }

  private handleAccountPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Images.SettingsICO
    presenceData.details = 'Anizium'

    const activeTab = this.getActiveAccountTab()
    presenceData.state = activeTab || 'Hesap yönetimi'
  }

  private handleTicketPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'
    presenceData.state = 'Destek talebini görüntülüyor'
  }

  private handleSearchPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Aranıyor'
    presenceData.details = 'Aranıyor'

    const params = new URLSearchParams(document.location.search)
    const searchValue = params.get('value')

    presenceData.state = searchValue || '...'
  }

  private getActiveAccountTab(): string | null {
    const activeButton = document.querySelector(
      'button[class-id="accountMenu"].active',
    )
    const tabSpan = activeButton?.querySelector('span')
    const tabName = tabSpan?.textContent?.trim()

    const tabMap: Record<string, string> = {
      'Genel Bakış': 'Hesaba genel bakış',
      'Üyelik': 'Üyelik durumunu görüntülüyor',
      'Cihazlar': 'Bağlı cihazları yönetiyor',
      'Profiller': 'Profilleri yönetiyor',
      'Güvenlik': 'Güvenlik ayarlarını yönetiyor',
      'Destek Talebi': 'Destek taleplerini görüntülüyor',
    }

    return tabName ? tabMap[tabName] || 'Hesap ayarlarını yönetiyor' : null
  }

  private handleFavoriteList(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Anizium'
    presenceData.state = 'Favoriler görüntüleniyor'
  }

  private handleWatchList(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Anizium'
    presenceData.state = 'İzleme listesi görüntüleniyor'
  }

  private handleWatchedList(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Anizium'
    presenceData.state = 'İzlediklerim listesi görüntüleniyor'
  }

  private handleStudioPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'

    const titleElement = document.querySelector('html > head > title')
    const pageTitle = titleElement?.textContent?.trim()

    if (pageTitle && pageTitle !== 'Anizium - Türkçe Dublaj & 4K İzleme Platformu') {
      const studioName = pageTitle.replace(/ - Anizium$/, '').trim()
      presenceData.state = `${studioName} stüdyosunu görüntülüyor`
    }
    else {
      presenceData.state = 'Stüdyo görüntüleniyor'
    }
  }

  private handlePrivacyPolicy(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'
    presenceData.state = 'Gizlilik Politikasını görüntülüyor'
  }

  private handleCommentPolicy(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'
    presenceData.state = 'Yorum Politikasını görüntülüyor'
  }

  private handleTos(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'
    presenceData.state = 'Hizmet Şart ve Koşullarını görüntülüyor'
  }

  private handleWatchPageUpdate(presenceData: PresenceData): void {
    const params = new URLSearchParams(document.location.search)
    const season = params.get('season')
    const episode = params.get('episode')

    let animeTitle = this.getAnimeTitle()
    animeTitle = animeTitle.replace(/\s*S\d+\s*B\d+$/i, '').trim()

    if (season && episode) {
      presenceData.details = animeTitle
      presenceData.state = `Sezon ${season} | Bölüm ${episode}`
    }
    else {
      presenceData.details = animeTitle
      presenceData.state = 'Tek Bölüm'
    }
  }

  private handleAnimePageUpdate(presenceData: PresenceData): void {
    const pageTitle
            = document.querySelector('html > head > title')?.textContent
              || 'Loading'
    presenceData.details = pageTitle.replace(/ - Anizium$/, '')
    presenceData.state = 'Bölümler görüntüleniyor'
  }

  private handleCatalogPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'

    const params = new URLSearchParams(document.location.search)
    const catalogType = params.get('type')
    const catalogId = params.get('id')

    if (catalogType === 'genre' && catalogId) {
      const genreName = GenreMap[catalogId]
      presenceData.state = genreName
        ? `${genreName} kategorisine göz atıyor`
        : 'Bir kategoriye göz atıyor'
    }
    else if (catalogId === 'series') {
      presenceData.state = 'Diziler kategorisine göz atıyor'
    }
    else if (catalogId === 'movie') {
      presenceData.state = 'Filmler kategorisine göz atıyor'
    }
    else {
      presenceData.state = 'Kategoriler inceleniyor..'
    }
  }
}

const _aniziumPresence = new AniziumPresence()
