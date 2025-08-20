export class Utils {
  static convertToLuiiUrl(originalUrl: string, path: string): string {
    return originalUrl.replace(
      `https://x.anizium.co/assets/${path}/`,
      `https://ani.luii.xyz/assets/${path}/`,
    )
  }

  static convertToWSRVUrl(originalUrl: string): string {
    return `https://wsrv.nl/?url=${originalUrl}`
  }

  static getRoutePattern(pathname: string): string {
    if (pathname.includes('/watch/'))
      return '/watch/'
    if (pathname.includes('/anime/'))
      return '/anime/'
    if (pathname.includes('/catalog'))
      return '/catalog/'
    return pathname
  }

  static getAnimeTitle(): string {
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

  static parseAnimeTitle(title: string): { title: string, episode: string } {
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

  static getActiveAnimeListType(): string | null {
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

  static getActiveAccountTab(): string | null {
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
}
