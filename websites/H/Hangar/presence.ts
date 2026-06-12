import { Presence } from '@premid/api'

export class HangarPresence extends Presence {
  public onUpdate() {
    const title = document.title
    const path = window.location.pathname
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content')

    const defaultLogo = 'logo'

    if (path === '/' || path === '/feed') {
      this.setActivity({
        state: 'Ana Sayfada',
        details: 'Akış\'ı inceliyor',
        largeImageKey: defaultLogo,
        largeImageText: 'usehangar.gg'
      })
    } else if (path.startsWith('/hub/')) {
      const hubName = title.split(' | ')[0] || 'Bir Hub'
      this.setActivity({
        state: 'Hub İnceliyor',
        details: hubName,
        largeImageKey: ogImage || defaultLogo,
        largeImageText: 'usehangar.gg',
        smallImageKey: defaultLogo,
        smallImageText: 'Hangar'
      })
    } else if (path.startsWith('/profile/')) {
      this.setActivity({
        state: 'Bir profili',
        details: 'inceliyor',
        largeImageKey: defaultLogo,
        largeImageText: 'usehangar.gg'
      })
    } else if (path.startsWith('/post/')) {
      this.setActivity({
        state: 'Bir gönderiyi',
        details: 'okuyor',
        largeImageKey: defaultLogo,
        largeImageText: 'usehangar.gg'
      })
    } else {
      this.setActivity({
        details: 'Hangar\'da Geziniyor',
        largeImageKey: defaultLogo,
        largeImageText: 'usehangar.gg'
      })
    }
  }
}
