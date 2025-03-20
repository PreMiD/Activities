import { Assets } from 'premid'

const presence = new Presence({
  clientId: '707431547715977218',
})
const pages: { [name: string]: string } = {
  '/turbobit-premium-alma-hizli-indirme': 'Turbobit Premium Alma Hızlı indirme !',
  '/redbunker-premium-alma-hizli-indirme': 'Redbunker Premium Alma Hızlı indirme !',
  '/windows-nasil-lisanslanir': 'Windows Nasıl lisanslanır !',
  '/kirik-link-bildirimi-yapin': 'Kırık Link Bildirimi Yapın!',
  '/winrar-crc-hatasi-cozumu-0': 'Winrar CRC Hatası Çözümü %100',
  '/windows-dvd-usb-ile-format-atma': 'Windows DVD USB İle Format Atma !',
  '/yardim-istek-bolumu': 'Yardım & İstek Bölümü !',
}
presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const searchingFor = document.querySelector('#icerik > h1')
  const category = document.querySelector('#icerik > h1')
  if (page.includes('/kategori/') && category && category.textContent !== '') {
    if (page.includes('/page/')) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Full%20Programlar%20%C4%B0ndir/assets/logo.png',
        details: 'Bir kategoriyi inceliyor:',
        state: `${category?.textContent
          ?.slice(0, category.textContent.length - 27)
          ?.trim()}(${`Sayfa: ${document.location.pathname.slice(
          document.location.pathname.indexOf('page') + 5,
          document.location.pathname.length,
        )}`})`,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
  }
  else if (document.location.href.includes('?s=') && searchingFor) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Full%20Programlar%20%C4%B0ndir/assets/logo.png',
      details: 'Bir şey arıyor:',
      state: searchingFor.textContent
        ? searchingFor.textContent.slice(17, searchingFor.textContent.length)
        : 'Belirsiz',
      smallImageKey: Assets.Search,
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (page.includes('/page/')) {
    const pgnum = document.location.pathname.slice(
      6,
      document.location.pathname.length,
    )
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Full%20Programlar%20%C4%B0ndir/assets/logo.png',
      details: 'Sayfalar arasında geziniyor:',
      state: pgnum ? `Ana Sayfa: ${pgnum}` : 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (page.includes('.html')) {
    const published = document.querySelector(
      '#icerik > div > div.yazi-alt > ul > li.tarih > span',
    )
    const publisher = document.querySelector(
      '#icerik > div > div.yazi-alt > ul > li.yazar > a',
    )
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Full%20Programlar%20%C4%B0ndir/assets/logo.png',
      details: document
        .querySelector('#icerik-yazi > div.icerik-baslik > h1 > a')
        ?.textContent
        ?.trim() || 'Belirsiz',
      state: publisher && publisher.textContent
        ? `${publisher.textContent.trim()} ${
          published && published.textContent !== ''
            ? `(${published.textContent?.trim()})`
            : ''
        }`
        : 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Full%20Programlar%20%C4%B0ndir/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: pages[page] || pages[page.slice(0, -1)],
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Full%20Programlar%20%C4%B0ndir/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: 'Ana Sayfa',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
})
