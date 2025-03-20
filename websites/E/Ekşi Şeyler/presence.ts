const presence = new Presence({
  clientId: '643771565951025153',
})

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const postTitle = document.querySelector(
    '#content-body-area > div > div > div.content-heading > h1',
  )

  if (page.includes('/kategori/')) {
    const category = document.title[0]?.toUpperCase()
      + document.title
        .replace(' - Ekşi Şeyler', '')
        .slice(1, document.title.length)
        .toLowerCase()

    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Ek%C5%9Fi%20%C5%9Eeyler/assets/logo.png',
      details: 'Bir kategoriye göz atıyor:',
      state: category || 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (page.includes('/kanal/')) {
    const channel = document.title[0]?.toUpperCase()
      + document.title
        .replace(' - Ekşi Şeyler', '')
        .slice(1, document.title.length)
        .toLowerCase()

    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Ek%C5%9Fi%20%C5%9Eeyler/assets/logo.png',
      details: 'Bir kanala göz atıyor:',
      state: channel || 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (page.includes('/derleme/arama/')) {
    const searchingFor = document.querySelector(
      '#main-content > div > div > div.search-result-info > span',
    )

    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Ek%C5%9Fi%20%C5%9Eeyler/assets/logo.png',
      details: 'Bir şey arıyor:',
      state: searchingFor && searchingFor.textContent !== ''
        ? searchingFor.textContent
        : 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (postTitle && postTitle.textContent !== '') {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Ek%C5%9Fi%20%C5%9Eeyler/assets/logo.png',
      details: 'Bir gönderiyi okuyor:',
      state: postTitle.textContent || 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Ek%C5%9Fi%20%C5%9Eeyler/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: 'Ana Sayfa',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
})
