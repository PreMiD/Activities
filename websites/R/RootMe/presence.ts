import { Assets } from 'premid'

const presence = new Presence({
  clientId: '673322920809988120',
})

function parseQueryString(queryString?: string): { [key: string]: string } {
  queryString ??= window.location.search.substring(1)

  const params: { [key: string]: string } = {}
  const queries = queryString.split('&')
  for (const indexQuery of queries) {
    const indexPair = indexQuery.split('=')
    params[decodeURIComponent(indexPair[0]!)] = decodeURIComponent(
      indexPair.length > 1 ? indexPair[1]! : '',
    )
  }
  return params
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/RootMe/assets/logo.png',
  Ctf = 'https://cdn.rcd.gg/PreMiD/websites/R/RootMe/assets/0.png',
  Chall = 'https://cdn.rcd.gg/PreMiD/websites/R/RootMe/assets/1.png',
  Commu = 'https://cdn.rcd.gg/PreMiD/websites/R/RootMe/assets/2.png',
  Docu = 'https://cdn.rcd.gg/PreMiD/websites/R/RootMe/assets/3.png',
  Infos = 'https://cdn.rcd.gg/PreMiD/websites/R/RootMe/assets/4.png',
  Tools = 'https://cdn.rcd.gg/PreMiD/websites/R/RootMe/assets/5.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const route = document.location.pathname.split('/')

  if (document.location.pathname === '/') {
    presenceData.details = 'Home'
    if (!parseQueryString(document.location.hash).page) {
      presenceData.state = 'Watching home page'
    }
    else if (parseQueryString(document.location.hash).page === 'news') {
      presenceData.state = parseQueryString(document.location.hash).inc
        ? `Watching ${parseQueryString(document.location.hash).page} page (${
          document.querySelector('dl.tabs > dd.active')?.textContent
        } )`
        : `Watching ${parseQueryString(document.location.hash).page} page`
    }
    else if (parseQueryString(document.location.hash).page === 'structure') {
      if (
        parseQueryString(document.location.hash).inc === 'inclusions/services'
      ) {
        presenceData.state = document.querySelector('.row > h1')?.textContent
      }
      else {
        presenceData.state = document.querySelector('.ajaxbloc > h1')?.textContent
      }
    }
    else if (parseQueryString(document.location.hash).page === 'contact') {
      presenceData.state = document.querySelector('.t-body > h1')?.textContent
    }
    else if (parseQueryString(document.location.hash).page === 'plan') {
      presenceData.state = document.querySelector('.t-body > h1')?.textContent
    }
    else if (parseQueryString(document.location.hash).page === 'faq') {
      presenceData.state = document.querySelector('h1.crayon')?.textContent
    }

    presenceData.smallImageKey = Assets.Reading
    switch (
      document.querySelector('img.grayscale')?.getAttribute('alt')
      || document.querySelector('img.grayscale')?.getAttribute('title')
    ) {
      case 'fr':
        presenceData.smallImageText = 'Language : français'
        break
      case 'es':
        presenceData.smallImageText = 'Language : espanol'
        break
      case 'de':
        presenceData.smallImageText = 'Language : deutsch'
        break
      case 'en':
        presenceData.smallImageText = 'Language : english'
        break
      default:
        break
    }
  }
  else if (document.location.pathname.includes('/Challenges/')) {
    presenceData.smallImageKey = ActivityAssets.Chall
    presenceData.smallImageText = 'Challenges'
    presenceData.details = route[3]
      ? `${route[2]} - ${route[3].replaceAll('-', ' ')}`
      : `${route[2]}`
    presenceData.state = !route[4]
      ? 'Navigating...'
      : document.querySelector('.crayon')?.textContent
  }
  else if (document.location.pathname.includes('/Capture-The-Flag/')) {
    presenceData.smallImageKey = ActivityAssets.Ctf
    presenceData.smallImageText = 'Capture The Flag'
    presenceData.details = route[3]
      ? `${route[2]?.replaceAll('-', ' ')} - ${route[3].replaceAll('-', ' ')}`
      : route[2]?.replaceAll('-', ' ')
    presenceData.state = 'Navigating...'
  }
  else if (
    document.location.pathname.includes('/Communaute/')
    || document.location.pathname.includes('/Comunidad/')
    || document.location.pathname.includes('/Community/')
  ) {
    presenceData.smallImageKey = ActivityAssets.Commu
    presenceData.smallImageText = 'Communaute'
    presenceData.details = route[3]
      ? `${route[2]} - ${route[3].replaceAll('-', ' ')}`
      : route[2]
    presenceData.state = 'Navigating...'
  }
  else if (
    document.location.pathname.includes('/Documentation/')
    || document.location.pathname.includes('/Materialien/')
    || document.location.pathname.includes('/Documentacion/')
    || document.location.pathname.includes('/Docs/')
  ) {
    presenceData.smallImageKey = ActivityAssets.Docu
    presenceData.smallImageText = 'Documentation'
    if (route[3] !== 'Reseaux') {
      presenceData.details = route[3]
        ? `${route[2]} - ${route[3].replaceAll('-', ' ')}`
        : `${route[2]}`
      presenceData.state = !route[4]
        ? 'Navigating...'
        : route[4].replaceAll('-', ' ')
    }
    else {
      presenceData.details = route[4]
        ? `${route[2]} - ${route[3]} > ${route[4]}`
        : `${route[2]} - ${route[3]}`
      presenceData.state = !route[5]
        ? 'Navigating...'
        : route[5].replaceAll('-', ' ')
    }
  }
  else if (
    document.location.pathname.includes('/Informations/')
    || document.location.pathname.includes('/Information/')
    || document.location.pathname.includes('/Info/')
  ) {
    presenceData.smallImageKey = ActivityAssets.Infos
    presenceData.smallImageText = 'Informations'
    presenceData.details = `${route[2]}`
    presenceData.state = !route[3]
      ? 'Navigating...'
      : document.querySelector('.crayon')?.textContent
  }
  else if (
    document.location.pathname.includes('/Tools/')
    || document.location.pathname.includes('/Herramientas/')
    || document.location.pathname.includes('/Outils/')
  ) {
    presenceData.smallImageKey = ActivityAssets.Tools
    presenceData.smallImageText = 'Tools'
    presenceData.details = route[3]
      ? `${route[2]} - ${route[3].replaceAll('-', ' ')}`
      : `${route[2]}`
    presenceData.state = route[4] ?? 'Navigating...'
  }
  else {
    presenceData.details = `Watching member : ${
      document.querySelector('span.forum')?.textContent
    }`
    presenceData.state = parseQueryString(document.location.hash).inc
      ? `Page : ${parseQueryString(document.location.hash).inc}`
      : 'Page : profil'
  }

  if (!presenceData.details) {
    presence.setActivity()
  }
  else {
    if (!presenceData.state)
      presenceData.state = 'Navigating...'

    presence.setActivity(presenceData)
  }
})
