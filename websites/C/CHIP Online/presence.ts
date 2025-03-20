const presence = new Presence({
  clientId: '651438286962688044',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/CHIP%20Online/assets/logo.png',
  }

  if (window.location.pathname.startsWith('/haber/')) {
    presenceData.details = 'Bir haberi okuyor:'
    presenceData.state = document.querySelector(
      '#colana > article > h1',
    )?.textContent
  }
  else if (window.location.pathname.endsWith('video/')) {
    presenceData.details = 'Bütün videolara göz atıyor.'
    presenceData.state = 'CHIP Online'
  }
  else if (window.location.pathname.endsWith('haber/')) {
    presenceData.state = 'Bütün haberlere göz atıyor.'
    presenceData.details = 'CHIP Online'
  }
  else if (window.location.pathname.endsWith('inceleme/')) {
    presenceData.state = 'Bütün incelemelere göz atıyor.'
    presenceData.details = 'CHIP Online'
  }
  else if (window.location.pathname.startsWith('/inceleme/')) {
    presenceData.state = document.querySelector('#anacontainer > h1')?.textContent
    presenceData.details = 'Bir incelemeyi okuyor:'
  }
  else if (window.location.pathname.startsWith('/blog/')) {
    presenceData.state = document.querySelector('#article-body > h1')?.textContent
    presenceData.details = 'Bir blog okuyor:'
  }
  else if (window.location.pathname.endsWith('forum/')) {
    presenceData.details = 'Tüm forumlara göz atıyor.'
  }
  else if (window.location.pathname.endsWith('canli/')) {
    presenceData.state = 'CHIP Online'
    presenceData.details = 'Tüm Tech-Talk arşivine göz atıyor.'
  }
  else if (window.location.pathname.startsWith('/forum/')) {
    presenceData.state = 'Adlı konuyu/gönderiyi okuyor.'
    presenceData.details = document.querySelector('#forumwrap > h1')?.textContent
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
