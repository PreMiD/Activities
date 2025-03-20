import { Assets } from 'premid'

const presence = new Presence({
  clientId: '643821029940133898',
})
const pages: { [key: string]: string } = {
  '/': 'Ana Sayfa',
  '/galeri': 'Galeri',
  '/ukt': 'UKT',
  '/nasil-yapilir': 'Nasıl Yapılır?',
  '/android-uygulamalari': 'Android Uygulamaları',
  '/ios': 'iOS',
  '/yazilim/windows-10': 'Windows 10 Haberleri',
  '/donanim': 'Donanım Haberleri',
  '/otomobil': 'Otomobil Haberleri',
  '/sdntv': 'SDNTV',
  '/inceleme': 'İncelemeler',
  '/mobil': 'Mobil',
  '/oyun': 'Oyun Haberleri',
  '/sosyal-medya': 'Sosyal Medya Haberleri',
  '/populer-bilim': 'Popüler Bilim Haberleri',
  '/uyelik.php': 'Giriş / Kayıt',
  '/enler-haber': 'En Çok Okunan Haberler',
  '/teknoloji-haberleri': 'Teknoloji Haberleri',
  '/alinti-sartlari': 'Alıntı Şartları',
  '/kunye': 'Künye',
  '/site-kullanim-kosullari': 'Site Kullanım Koşulları',
  '/hukuka-aykirilik-bildirimi': 'Şikayet',
  '/gizlilik-bildirimi': 'Gizlilik Politikası',
  '/whats-new': 'Neler Yeni?',
  '/members': 'Üyeler',
  '/members/list': 'Üyeler',
  '/online': 'Şu anda Aktif Kullanıcılar',
  '/whats-new/news-feed': 'Haber Akışı',
  '/whats-new/latest-activity': 'Son Akiviteler',
  '/find-threads/started': 'Konularım',
  '/find-threads/contributed': 'Mesajlarım & Konularım',
  '/find-threads/unanswered': 'Cevaplanmamış Konular',
  '/watched/threads': 'Takip Ettiğim Konular',
  '/watched/forums': 'Takip Ettiğim Forumlar',
  '/conversations': 'Mesajlar',
  '/account/alerts': 'Bildirimler',
  '/account/reactions': 'Alınan Tepkiler',
  '/account/bookmarks': 'Yer İmleri',
  '/account/account-details': 'Hesap Ayrıntıları',
  '/account/security': 'Şifre & Güvenlik',
  '/account/privacy': 'Gizlilik Ayarları',
  '/account/preferences': 'Tercihler',
  '/account/connected-accounts': 'Bağlı Hesaplar',
  '/account/following': 'Takip Ettiklerim',
  '/account/ignored': 'Yok Sayılanlar',
  '/account': 'Hesap Ayrıntıları',
}

presence.on('UpdateData', async () => {
  const host = document.location.hostname
  const page = document.location.pathname

  if (host === 'shiftdelete.net') {
    const title = document.querySelector(
      'body > div.wrapper > section > div > div.left.harber > h1',
    )
    const author = document.querySelector(
      'body > div.wrapper > section > div > div.left.harber > div.twtCommnets > div > div.desc > em',
    )
    const time = document.querySelector(
      'body > div.wrapper > section > div > div.left.harber > div.need_to_be_rendered',
    )
    || document.querySelector(
      'body > div.wrapper > section > div > div.left.harber > div:nth-child(4)',
    )

    if (
      title
      && author
      && time
      && title.textContent !== ''
      && author.textContent !== ''
      && time.textContent !== ''
    ) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: title.textContent || 'Belirsiz',
        state: `Yazar: ${author.textContent?.replace(
          'yazar',
          '',
        )} (${time.textContent?.trim().replace('eklendi', '')})`,
        smallImageKey: Assets.Reading,
        smallImageText: 'Bir gönderi okuyor...',
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (page.includes('/yazar/')) {
      const title = document.title.split(' ')

      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: 'Bir yazara bakıyor:',
        state: title.slice(0, title.indexOf('Yazıları')).join(' ') ?? 'Belirsiz',
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (page.includes('/arama/')) {
      const searchingFor = document.querySelector(
        'body > div.wrapper > section > div > div.left > h5 > strong',
      )

      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: 'Bir şey arıyor:',
        state: searchingFor && searchingFor.textContent
          ? searchingFor.textContent.replaceAll('"', '')
          : 'Belirsiz',
        smallImageKey: Assets.Search,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (pages[page] || pages[page.slice(0, -1)]) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: 'Bir sayfaya göz atıyor:',
        state: pages[page] || pages[page.slice(0, -1)],
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
  }
  else if (host === 'forum.shiftdelete.net') {
    const user = document.querySelector(
      '#top > div.p-body > div > div.p-body-main.p-body-main--withSidebar > div.p-body-content > div > div > div > div > div > div.memberHeader-main > div > h1 > span',
    )

    if (page.includes('/members/') && user && user.textContent !== '') {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: 'Bir kullanıcıya bakıyor:',
        state: user.textContent,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (page.includes('/post-thread')) {
      const newTitle = document.querySelector(
        '.js-titleInput',
      ) as HTMLInputElement

      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: 'Yeni bir forum gönderisi açıyor:',
        state: newTitle && newTitle.value !== ''
          ? newTitle.value
          : 'Henüz Başlık Girilmemiş',
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (page.includes('/forums/')) {
      const forumTitle = document.querySelector(
        '#top > div.p-body > div > div.p-body-header > div.p-title > h1',
      )

      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: 'Bir foruma göz atıyor:',
        state: forumTitle && forumTitle.textContent
          ? forumTitle.textContent
          : 'Belirsiz',
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (page.includes('/threads/')) {
      const title = document.querySelector(
        '#top > div.p-body > div > div.p-body-header > div.p-title > h1',
      )
      const author = document.querySelector('#js-XFUniqueId1')
      const time = document.querySelector(
        '#top > div.p-body > div > div.p-body-header > div.p-description > ul > li:nth-child(2) > a > time',
      )

      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: title && title.textContent !== ''
          ? title.textContent
          : 'Belirsiz Gönderi',
        state: `Yazar: ${
          author && author.textContent !== ''
            ? author.textContent
            : 'Belirsiz Gönderi Sahibi'
        } ${time && time.textContent !== '' ? `(${time.textContent})` : ''}`,
        smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/0.png',
        smallImageText: 'Bir forum gönderisi okuyor.',
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (page.includes('/search/')) {
      const searchingFor = document.querySelector(
        '#top > div.p-body > div > div.p-body-header > div > h1 > a > em',
      )

      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: 'Forumda bir gönderi arıyor:',
        state: searchingFor && searchingFor.textContent !== ''
          ? searchingFor.textContent
          : 'Belirsiz',
        smallImageKey: Assets.Search,
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
    else if (pages[page] || pages[page.slice(0, -1)]) {
      presence.setActivity({
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/logo.png',
        details: 'Bir sayfaya göz atıyor:',
        state: pages[page] || pages[page.slice(0, -1)],
        smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/ShiftDelete.Net/assets/0.png',
        smallImageText: 'Bu kullanıcı şuan da SDN Forum\'da.',
        startTimestamp: Math.floor(Date.now() / 1000),
      })
    }
  }
})
