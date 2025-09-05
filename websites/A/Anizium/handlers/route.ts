import type { AniziumSettings } from '../types.js'
import { Assets } from 'premid'
import { GenreMap, Images } from '../types.js'
import { Utils } from '../utils.js'

export class RouteHandlers {
  private static formatString(
    template: string,
    data: Record<string, string | null>,
  ): string {
    let result = template
    for (const key in data) {
      const value = data[key] || '?'
      result = result.replace(new RegExp(`%${key}%`, 'g'), value)
    }
    return result
  }

  static handleDefaultPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Sayfa görüntüleniyor..'
  }

  static handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Ana Sayfa görüntüleniyor'
  }

  static handleProfilesPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Profil Seçiyor...'
  }

  static handleAvatarListPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Avatar Seçiyor...'
  }

  static handleAnimesPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Animelere göz atıyor..'
    presenceData.details = 'Anizium'

    const activeListType = Utils.getActiveAnimeListType()
    presenceData.state = activeListType || 'Animelere göz atıyor...'
  }

  static handleAnimeRequestsPage(presenceData: PresenceData): void {
    const activeModal = document.querySelector<HTMLDivElement>('.swal2-popup.swal2-show')

    if (activeModal) {
      const modalTitle = activeModal.querySelector<HTMLElement>('#swal2-content')

      if (modalTitle && modalTitle.textContent?.trim() === 'Eklenmesi istediğiniz animenin adını yazınız') {
        presenceData.details = 'Anime İstek'
        presenceData.state = 'Yeni bir istekte bulunuyor...'
        return
      }
    }

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

    if (activeButton && activeButton.dataset.status !== 'waiting' && activeButton.textContent) {
      presenceData.details = 'Anime İstek'
      const buttonText = activeButton.textContent.trim()
      presenceData.state = `${buttonText} listesine göz atıyor`
      return
    }

    const animeCards = document.querySelectorAll<HTMLDivElement>('#table > .col-md-3')
    const firstCard = animeCards[0]
    const lastCard = animeCards[animeCards.length - 1]

    if (firstCard && lastCard) {
      const firstRankEl = firstCard.querySelector<HTMLDivElement>('.bg-secondary')
      const lastRankEl = lastCard.querySelector<HTMLDivElement>('.bg-secondary')

      if (firstRankEl?.textContent && lastRankEl?.textContent) {
        const startRank = firstRankEl.textContent.trim().replace('#', '')
        const endRank = lastRankEl.textContent.trim().replace('#', '')

        if (activeButton && activeButton.textContent) {
          const buttonText = activeButton.textContent.trim()
          presenceData.details = `Anime İstek - ${buttonText}`
        }
        else {
          presenceData.details = 'Anime İstek'
        }

        if (startRank === endRank) {
          presenceData.state = `#${startRank} numaralı isteğe bakıyor`
        }
        else {
          presenceData.state = `#${startRank}-${endRank} arası isteklere göz atıyor`
        }
        return
      }
    }

    presenceData.details = 'Anime İstek'
    presenceData.state = 'İstek animelere göz atıyor...'
  }

  static handlePremiumPage(presenceData: PresenceData): void {
    presenceData.details = 'Premium'

    const donationPopup = document.querySelector<HTMLElement>('#donationPopup')
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

  static handlePayPage(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Ödeme Yapıyor'
  }

  static handleCalendarPage(presenceData: PresenceData): void {
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

  static handleAccountPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Images.SettingsICO
    presenceData.details = 'Anizium'

    const activeTab = Utils.getActiveAccountTab()
    presenceData.state = activeTab || 'Hesap yönetimi'
  }

  static handleTicketPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'
    presenceData.state = 'Destek talebini görüntülüyor'
  }

  static handleSearchPage(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = 'Aranıyor'
    presenceData.details = 'Aranıyor'

    const params = new URLSearchParams(document.location.search)
    const searchValue = params.get('value')

    presenceData.state = searchValue || '...'
  }

  static handleFavoriteList(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Anizium'
    presenceData.state = 'Favoriler görüntüleniyor'
  }

  static handleWatchList(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Anizium'
    presenceData.state = 'İzleme listesi görüntüleniyor'
  }

  static handleWatchedList(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Viewing
    presenceData.details = 'Anizium'
    presenceData.state = 'İzlediklerim listesi görüntüleniyor'
  }

  static handleStudioPage(presenceData: PresenceData): void {
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

  static handlePrivacyPolicy(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'
    presenceData.state = 'Gizlilik Politikasını görüntülüyor'
  }

  static handleCommentPolicy(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'
    presenceData.state = 'Yorum Politikasını görüntülüyor'
  }

  static handleTos(presenceData: PresenceData): void {
    presenceData.smallImageKey = Assets.Reading
    presenceData.details = 'Anizium'
    presenceData.state = 'Hizmet Şart ve Koşullarını görüntülüyor'
  }

  static handleApp(presenceData: PresenceData): void {
    presenceData.details = 'Anizium'
    presenceData.state = 'Uygulamalar bölümünü görüntülüyor'
  }

  static handleWatchPageUpdate(presenceData: PresenceData, settings: AniziumSettings): void {
    const params = new URLSearchParams(document.location.search)
    const season = params.get('season')
    const episode = params.get('episode')

    let animeTitle = Utils.getAnimeTitle()
    animeTitle = animeTitle.replace(/\s*S\d+\s*B\d+$/i, '').trim()

    const placeholders = {
      anime_title: animeTitle,
      season,
      episode,
    }

    if (season && episode) {
      presenceData.details = this.formatString(settings.watchingDetails, placeholders)
      presenceData.state = this.formatString(settings.watchingState, placeholders)
    }
    else {
      const singleEpisodeState
                = settings.watchingState.includes('%season%')
                  || settings.watchingState.includes('%episode%')
                  ? 'Tek Bölüm'
                  : settings.watchingState

      presenceData.details = this.formatString(settings.watchingDetails, placeholders)
      presenceData.state = this.formatString(singleEpisodeState, placeholders)
    }

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: 'Bölümü Görüntüle',
          url: document.location.href,
        },
      ]
    }
  }

  static handleAnimePageUpdate(presenceData: PresenceData, settings: AniziumSettings): void {
    const pageTitle = document.querySelector('html > head > title')?.textContent || 'Loading'

    presenceData.details = pageTitle.replace(/ - Anizium$/, '')
    presenceData.smallImageKey = Assets.Viewing
    presenceData.state = 'Anime detayları ve bölümleri görüntüleniyor'

    if (settings?.showButtons) {
      presenceData.buttons = [
        {
          label: 'Animeyi Görüntüle',
          url: document.location.href,
        },
      ]
    }
  }

  static handleCatalogPage(presenceData: PresenceData): void {
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
