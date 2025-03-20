import { Assets } from 'premid'

const presence = new Presence({
  clientId: '691406198091677737',
})

function parseQueryString(queryString?: string) {
  queryString ??= window.location.search.substring(1)

  const params: { [queryKey: string]: string } = {}
  const queries = queryString.split('&')
  for (const indexQuery in queries) {
    const indexPair = indexQuery.split('=')
    params[decodeURIComponent(indexPair[0] ?? '')] = decodeURIComponent(
      indexPair.length > 1 ? indexPair[1] ?? '' : '',
    )
  }
  return params
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Electron/assets/logo.png',
  }
  const route = document.location.pathname.split('/')

  presenceData.smallImageKey = Assets.Reading
  presenceData.smallImageText = `Language : ${
    document.querySelector('a.site-header-nav-item.bordered.lang-select-button')
      ?.textContent
  }`

  if (document.location.pathname === '/') {
    presenceData.details = 'Home'
  }
  else if (document.location.pathname.includes('/apps')) {
    if (!route[2]) {
      presenceData.details = 'Apps'
      presenceData.state = !parseQueryString(document.location.hash).q
        ? `Watching apps list ${
          !parseQueryString(document.location.hash).category
            ? ''
            : `(${parseQueryString(document.location.hash).category})`
        }`
        : `Searching ${parseQueryString(document.location.hash).q} ${
          !parseQueryString(document.location.hash).category
            ? ''
            : `(${parseQueryString(document.location.hash).category})`
        }`
    }
    else {
      presenceData.details = 'Watching app'
      presenceData.state = document.querySelector(
        'h1.f00-light.lh-condensed.mb-3',
      )?.textContent
    }
  }
  else if (document.location.pathname.includes('/docs')) {
    if (!route[2]) {
      presenceData.details = document.querySelector(
        'span.f0-light.mr-3.mr-lg-4',
      )?.textContent
    }
    else {
      switch (route[2]) {
        case 'tutorial': {
          if (!route[3]) {
            presenceData.details = document.querySelector(
              'h4.f3-light.docs-breadcrumbs',
            )?.textContent
          }
          else {
            presenceData.details = 'Docs / Guides'
            presenceData.state = document
              .querySelector('title')
              ?.textContent
              ?.replace(' | Electron', '')
          }

          break
        }
        case 'api': {
          if (!route[3]) {
            presenceData.details = document.querySelector(
              'h4.f3-light.docs-breadcrumbs',
            )?.textContent
          }
          else if (route[3] === 'structures') {
            if (!route[4]) {
              presenceData.details = document.querySelector(
                'h4.f3-light.docs-breadcrumbs',
              )?.textContent
            }
            else {
              presenceData.details = 'Docs / API Structures'
              presenceData.state = document
                .querySelector('title')
                ?.textContent
                ?.replace(' | Electron', '')
            }
          }
          else {
            presenceData.details = 'Docs / API'
            presenceData.state = document
              .querySelector('title')
              ?.textContent
              ?.replace(' | Electron', '')
          }

          break
        }
        case 'development': {
          if (!route[3]) {
            presenceData.details = document.querySelector(
              'h4.f3-light.docs-breadcrumbs',
            )?.textContent
          }
          else {
            presenceData.details = 'Docs / Development'
            presenceData.state = document
              .querySelector('title')
              ?.textContent
              ?.replace(' | Electron', '')
          }

          break
        }
      }
    }
  }
  else if (document.location.pathname.includes('/blog')) {
    if (!route[2]) {
      presenceData.details = document.querySelector('h1.f00-light')?.textContent
    }
    else {
      const [title, TitleOne] = document
        .querySelector('title')
        ?.textContent
        ?.split(' | ') ?? []
      presenceData.details = title
      presenceData.state = TitleOne
    }
  }
  else if (document.location.pathname.includes('/releases/')) {
    presenceData.details = document.querySelector(
      '.container-narrow h1',
    )?.textContent
    presenceData.state = `${
      !parseQueryString(document.location.hash).version
        ? 'Version : all'
        : `Version : ${parseQueryString(document.location.hash).version}`
    }${
      !parseQueryString(document.location.hash).page
        ? ' | Page : 1'
        : ` | Page : ${parseQueryString(document.location.hash).page}`
    }`
  }
  else {
    presenceData.details = document.querySelector('h1.f00-light')?.textContent
  }

  if (!presenceData.details) {
    presence.setActivity()
  }
  else {
    presenceData.state ??= 'Navigating...'
    presence.setActivity(presenceData)
  }
})
