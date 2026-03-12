const presence = new Presence({ clientId: '653578846448123906' })
const pages: { [key: string]: string } = {
  '/usercp.php': 'Kullanıcı Profili',
  '/ihbar/': 'İhbar Portalı',
}

presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const kategori = document.querySelector(
    '#inlinemodform > table.tborder.respborder > tbody > tr > td.tcat',
  )
  const CevapButon = document.querySelector(
    'body > div:nth-child(5) > div.showth-top-bor > div > div:nth-child(1) > a',
  )
  const login = document.querySelector(
    'body > div:nth-child(3) > table.tborder > tbody > tr:nth-child(2) > td > div > div > form > fieldset > legend',
  )
  const register = document.querySelector(
    'body > div:nth-child(3) > form > table > tbody > tr:nth-child(2) > td > div.panel > div > fieldset > legend',
  )
  const report = document.querySelector(
    'body > div:nth-child(5) > form > table > tbody > tr:nth-child(1) > td',
  )
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/T%C3%BCrk%20Hack%20Team/assets/logo.png',
    startTimestamp: Math.floor(Date.now() / 1000),
  }

  if (kategori && kategori.textContent !== '') {
    presenceData.details = 'Bir kategoriyi inceliyor:';
    [, presenceData.state] = kategori.textContent?.split(':') ?? []
  }
  else if (CevapButon && CevapButon.textContent !== '') {
    presenceData.details = 'Bir konuyu inceliyor:'
    presenceData.state = document.querySelector(
      'body > div:nth-child(6) > h1',
    )?.textContent
  }
  else if (login && login.textContent === 'Giriş') {
    presenceData.details = 'Kullanıcı Paneli'
    presenceData.state = 'Giriş Yap'
  }
  else if (
    register
    && register.textContent === 'Lütfen Doğum tarihinizi verin'
  ) {
    presenceData.details = 'Kullanıcı Paneli'
    presenceData.state = 'Kayıt Ol'
  }
  else if (
    report?.textContent?.toLowerCase().includes('mesaji moderatöre bi̇ldi̇r')
  ) {
    presenceData.details = 'Bir Mesajı Moderatöre Bildiriyor'
    presenceData.state = `Forum: ${report.textContent.split(':')[1]}`
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presenceData.details = 'Forumda geziniyor:'
    presenceData.state = pages[page] || pages[page.slice(0, -1)]
  }
  else {
    presenceData.details = 'Forumda geziniyor:'
    presenceData.state = 'Ana Sayfa'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
