const presence = new Presence({
  clientId: '738522217221980222',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Novel%20Mania/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  const porcent = document.querySelector(
    '#settings-section > div > ul > li:nth-child(1) > div > div',
  )
  const currentChapTitle = document.querySelector(
    'body > div:nth-child(4) > main > section.landing.novel-single > div.novel-head.pt-3 > div > div > div:nth-child(1) > nav > ol > li.breadcrumb-item.active',
  )
  const novelName = document.querySelector('h1')
  const VolNumb = document.querySelector('#chapter-content > h3')
  const NovelTitle = document.querySelector(
    'body > div:nth-child(4) > main > section.landing.novel-single > div.novel-head.pt-3 > div > div > div:nth-child(2) > div > h1 > a',
  )
  const PagTitle = document.querySelector('h2')
  if (path === '/' || !path) {
    presenceData.details = 'Na página inicial' /* at home */
    presenceData.state = 'Só olhando... Que estranho!' /* Juist lookin, how strange! */
  }
  else if (path.includes('/noticias/')) {
    presenceData.details = 'Lendo Notícia:' /* reading a notice */
    presenceData.state = novelName?.textContent
  }
  else if (path.includes('/novels/')) {
    if (document.body.contains(document.querySelector('#myTab'))) {
      presenceData.details = 'No Indice da Novel:' /* At the novels's indice */
      presenceData.state = novelName?.textContent
    }
    else if (document.body.contains(VolNumb)) {
      presenceData.details = `Lendo ${NovelTitle?.textContent} || ${VolNumb?.textContent}` /* reading volume */
      presenceData.state = `Em ${porcent?.textContent} do ${currentChapTitle?.textContent}` /* in X% of... novel chapter */
    }
    else {
      presenceData.details = `Lendo${NovelTitle?.textContent}` /* reading *novel**/
      presenceData.state = `Em ${porcent?.textContent}do${currentChapTitle?.textContent}` /* in X% of... novel chapter */
    }
  }
  else if (path.includes('/u/')) {
    presenceData.details = 'Bisbilhotando:' /* Seeing the * user profile */
    presenceData.state = document.querySelector(
      'body > div > main > section.profile-top > div > div > div > div.col-sm-8.col-md-9.d-flex.align-items-center > div > ul > li.admin-name > h5',
    )?.textContent
  }
  else if (
    path.includes('/editoria')
    || path.includes('/salao-da-contribuicao')
    || path.includes('/regras-setorias')
    || path.includes('/politica-de-privacidade')
    || path.includes('contato')
  ) {
    presenceData.details = 'Lendo Página: ' /* reading page */
    presenceData.state = PagTitle?.textContent
  }
  else if (
    path.includes('/genero/')
    || path.includes('/chinesa')
    || path.includes('/japonesa')
    || path.includes('/coreana')
    || path.includes('/brasileira')
    || path.includes('/americana')
  ) {
    presenceData.details = 'Procurando:' /* searching for */
    presenceData.state = PagTitle?.textContent
  }
  else {
    presenceData.details = 'Buscando...' /* searching... */
    presenceData.state = 'Algo Incrível' /* Something incredible */
  }
  presence.setActivity(presenceData)
})
