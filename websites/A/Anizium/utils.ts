export class Utils {
  static convertToAniziumde(originalUrl: string): string {
    try {
      const url = new URL(originalUrl)

      if (url.hostname.endsWith('.anizium.co')) {
        url.hostname = url.hostname.replace('.anizium.co', '.anizium.de')
      }

      return url.toString()
    }
    catch {
      return originalUrl
    }
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
    const pageTitle
      = document.querySelector('head > title')?.textContent?.trim()
        ?? 'Loading'

    if (pageTitle === 'Anizium - Türkçe Dublaj & 4K İzleme Platformu') {
      return 'Loading'
    }

    return pageTitle
      .replace(/\s*-\s*Anizium\s*$/i, '')
      .replace(/\s+(?:İzle|Watch)\s*$/i, '')
      .split(/\s+\d+\.\s*(Sezon|Season)|\s+(Sezon|Season|Episode|Bölüm)/i)[0] ?? ''
      .replace(/\s*S\d+\s*B\d+$/i, '')
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
