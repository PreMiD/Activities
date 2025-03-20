const presence = new Presence({
  clientId: '685611188306051093',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const searchItems = {
  arch: 'architecture',
  edition: 'offering',
  os: 'operating_system',
  page: 'page',
  query: 'q',
  tab: 'tab',
  type: 'type',
}
/**
 * Lambda function to ucFirst
 * @param s string to capitalize
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

let match: string[]

presence.on('UpdateData', async () => {
  let url: URL,
    params: URLSearchParams,
    selector: Node | null,
    arch: string | null,
    page: string | null,
    tab: string | null

  const presenceData: PresenceData = {
    details: 'Unknown page', // Left here as a clue to find missing possible states
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DockerHub/assets/logo.png',
  }

  if (document.location.host === 'hub.docker.com') {
    presenceData.startTimestamp = browsingTimestamp

    if (document.location.pathname.match(/^\/(repositories)?$/)) {
      presenceData.details = 'Bowsing own repositories'
    }
    else if (document.location.pathname.match(/^\/settings/)) {
      presenceData.details = 'On settings page'
    }
    else if (document.location.pathname.match(/^\/search/)) {
      url = new URL(document.location.href)
      params = url.searchParams

      const query = params.get(searchItems.query)
      let type = params.get(searchItems.type)
      type = (type && decodeURIComponent(type)) || 'image'

      let edition = params.get(searchItems.edition)
      edition = (edition && decodeURIComponent(edition)) || ''

      let os = params.get(searchItems.os)
      os = (os && decodeURIComponent(os)) || null

      arch = params.get(searchItems.arch)
      arch = (arch && decodeURIComponent(arch)) || null

      presenceData.details = `Searching for${
        query ? `: ${query}` : ` ${edition} ${type}s`
      }`

      if (query && edition)
        presenceData.state = `${capitalize(edition)} ${type}s`
      if (os || arch) {
        presenceData.state = `${os ? `${capitalize(os)} ` : ''}${
          arch ? arch.toUpperCase() : ''
        }`
      }
    }
    else if (document.location.pathname.match(/^\/orgs$/)) {
      presenceData.details = 'Browsing organizations'
    }
    else if (
      document.location.pathname.match(/^\/orgs\/([^/]+)(?:\/([^/]+))?/)
    ) {
      let [, name, tab] = document.location.pathname.match(
        /^\/orgs\/([^/]+)(?:\/([^/]+))?/,
      ) ?? []
      tab = tab || 'members'
      presenceData.details = `On org ${tab}page`
      presenceData.state = `${name}`
    }
    else if (document.location.pathname.match(/^\/_\/([^?]+)/)) {
      url = new URL(document.location.href)
      params = url.searchParams

      const [, name] = document.location.pathname.match(/^\/_\/([^?]+)/) ?? []

      tab = params.get(searchItems.tab)

      presenceData.details = `On image ${tab ? `${tab} ` : ''}page`
      presenceData.state = `${name}`
    }
    else if (
      document.location.pathname.match(/^\/r\/([^/]+)\/([^/]+)(?:\/([^?]+))?/)
    ) {
      url = new URL(document.location.href)
      params = url.searchParams

      const [, owner, name, tab] = document.location.pathname.match(
        /^\/r\/([^/]+)\/([^/]+)(?:\/([^?]+))?/,
      ) ?? []

      page = params.get(searchItems.page)

      presenceData.details = `On image ${tab ?? ''} page${
        page ? ` ${page}` : ''
      }`
      presenceData.state = `${owner}/${name}`
    }
    else if (
      document.location.pathname.match(/^\/layers\/([^/]+)\/([^/]+)\/([^/]+)/)
    ) {
      match = document.location.pathname.match(
        /^\/layers\/([^/]+)\/([^/]+)\/([^/]+)/,
      ) ?? []
      url = new URL(document.location.href)
      params = url.searchParams

      const context = params.get('context')
      if (context && context === 'repo') {
        presenceData.details = 'On personal repository'
        presenceData.state = 'Image history'
      }
      else {
        const [, owner, name] = match
        selector = document.querySelector('.Select-value') || null
        arch = (selector && selector.textContent) || null

        presenceData.details = 'On image history'
        presenceData.state = `${owner}/${name}:${match[3]} ${arch ?? ''}`
      }
    }
    else if (
      document.location.pathname.match(/^\/u\/([^/]+)(?:\/([^/]+))?/)
    ) {
      tab = match[2] || 'repositories'
      presenceData.details = `On profile ${tab} page`;
      [, presenceData.state] = document.location.pathname.match(
        /^\/u\/([^/]+)(?:\/([^/]+))?/,
      ) ?? []
    }
    else if (document.location.pathname.match(/^\/repository\/create/)) {
      presenceData.details = 'Creating repository'
    }
    else if (document.location.pathname.match(/^\/repository(?:\/([^/?]+))+/)) {
      url = new URL(document.location.href)
      params = url.searchParams

      presenceData.details = 'On personal repository'

      let [, tab] = document.location.pathname.match(
        /^\/repository(?:\/([^/?]+))+/,
      ) ?? []

      page = params.get(searchItems.page)
      selector = document.querySelector(
        '#contextNav > div > div.styles__breadcrumbs___18Yr8 > div:nth-child(2) > a',
      )
      const breadcrum = (selector && selector.textContent) || null

      if (breadcrum && breadcrum.match(tab!))
        tab = 'general'
      else if (document.location.pathname.match(/\/builds\//))
        tab = 'builds'

      presenceData.state = `${capitalize(tab!)}${page ? ` ${page}` : ''}`
    }
    else if (
      document.location.pathname.match(/^\/support\/(doc)?(contact)?/)
    ) {
      match = document.location.pathname.match(
        /^\/support\/(doc)?(contact)?/,
      ) ?? []
      presenceData.details = 'Reading FAQ'
      if (match[1] && true) {
        selector = document.querySelector(
          '#gatsby-focus-wrapper > div > main > div > div.MuiCardHeader-root > div > span',
        ) || null
        presenceData.state = (selector && selector.textContent) || null
      }
      else if (match[2] && true) {
        presenceData.details = 'Contact page'
      }
    }
    else if (document.location.pathname.match(/^\/billing/)) {
      presenceData.details = 'Checking billing info'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
