import { Assets } from 'premid'

const presence = new Presence({
  clientId: '690635264124518493',
})

function parseQueryString(queryString?: string): {
  [name: string]: string
} {
  queryString ??= window.location.search.substring(1)

  const params: {
    [name: string]: string
  } = {}
  const queries = queryString.split('&')
  for (const indexQuery in queries) {
    const indexPair = indexQuery.split('=')
    params[decodeURIComponent(indexPair[0]!)] = decodeURIComponent(
      indexPair.length > 1 ? indexPair[1]! : '',
    )
  }
  return params
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/Yarn/assets/logo.png',
  }
  const route = document.location.pathname.split('/')

  if (document.location.pathname === '/') {
    presenceData.details = 'Home'
    presenceData.state = parseQueryString(document.location.hash).q
      ? `Searching ${parseQueryString(document.location.hash).q} (page ${
        parseQueryString(document.location.hash).p ?? '0'
      })`
      : 'Navigate...'
    presenceData.smallImageKey = parseQueryString(document.location.hash).q
      ? Assets.Search
      : null
    presenceData.smallImageText = 'Searching...'
  }
  else if (document.location.pathname.includes('/package/')) {
    presenceData.details = 'Watching package'
    presenceData.state = !parseQueryString(document.location.hash).files
      ? `${document.querySelector('section h2')?.textContent}`
      : document.querySelector('header h2')?.textContent
  }
  else if (document.location.pathname.includes('/getting-started')) {
    presenceData.details = 'Getting Started'
    if (route[2] === 'install')
      presenceData.state = 'Installation'
    else if (route[2] === 'usage')
      presenceData.state = 'Usage'
    else presenceData.state = 'Introduction'
  }
  else if (document.location.pathname.includes('/configuration/')) {
    presenceData.details = 'Configuration'
    if (route[2] === 'manifest')
      presenceData.state = 'Manifests'
    else if (route[2] === 'yarnrc')
      presenceData.state = 'Yarnrc files'
  }
  else if (document.location.pathname.includes('/features/')) {
    presenceData.details = 'Features'
    presenceData.state = document.querySelector('article h1')?.textContent
  }
  else if (document.location.pathname.includes('/cli/')) {
    presenceData.details = 'Cli'
    presenceData.state = document.querySelector('article h1 code')?.textContent
  }
  else if (document.location.pathname.includes('/advanced/')) {
    presenceData.details = 'Advanced'
    presenceData.state = document.querySelector('article h1')?.textContent
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
