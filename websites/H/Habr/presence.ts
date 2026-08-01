import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1064607977996296262',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings(
    {
      buttonViewPage: 'general.buttonViewPage',
      reading: 'general.reading',
      readingADM: 'general.readingADM',
      readingAPost: 'general.readingAPost',
      readingPost: 'general.readingPost',
      readingArticle: 'general.readingArticle',
      readingAnArticle: 'general.readingAnArticle',
      search: 'general.search',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      view: 'general.view',
      viewACategory: 'general.viewACategory',
      viewAProfile: 'general.viewAProfile',
      viewCategory: 'general.viewCategory',
      viewHome: 'general.viewHome',
      viewProfile: 'general.viewProfile',
    },
  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Habr/assets/logo.png',
}

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

function getDirectTextContent(selector: string): string | null {
  const element = document.querySelector<HTMLElement>(selector)
  return element
    ? Array.from(element.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent?.trim() || '')
        .join('')
    : null
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Где-то на сайте',
    largeImageKey: ActivityAssets.Logo,
  }
  const [newLang, privacy, logo, time, buttons] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'ru'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('logo'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { pathname, href } = document.location
  const path = pathname.split('/')
  const subTitle = getDirectTextContent('.tabs.tm-tabs_page-header .tab-link.active')
    ?? getDirectTextContent('.tabs.tm-user__tabs .tab-link.active')
    ?? getDirectTextContent('.tabs.tm-tabs_page-header .tm-navigation-dropdown__option_active > button')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  function getPostData(type: string): void {
    switch (type) {
      case 'articles':
      case 'news':
        presenceData.details = privacy ? strings.readingAnArticle : strings.readingArticle
        presenceData.state = textContent('.tm-title')
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
          '.tm-user-info__userpic .tm-entity-image__pic',
        )?.src ?? ActivityAssets.Logo
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.reading
        presenceData.buttons = [
          {
            label: strings.buttonViewPage,
            url: href,
          },
        ]
        break

      case 'posts':
        presenceData.details = privacy ? strings.readingAPost : strings.readingPost
        presenceData.state = document.querySelector('meta[property=\'og:title\']')?.getAttribute('content')
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.reading
        presenceData.buttons = [
          {
            label: strings.buttonViewPage,
            url: href,
          },
        ]
        break
    }
  }

  switch (path[2]) {
    case 'feed':
      presenceData.details = strings.viewHome
      break

    case 'all':
    case 'articles':
    case 'flows':
    case 'hubs':
    case 'news':
    case 'posts':
    case 'companies':
    case 'users':
    {
      presenceData.details = privacy ? strings.viewACategory : strings.viewCategory
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = strings.view

      const categoryTitle = textContent('.tm-page__top > div > h1 > span') || textContent('.tm-page__top .tm-section-name__text')
      if (categoryTitle) {
        presenceData.state = `${categoryTitle}${subTitle ? ` – ${subTitle}` : ''}`
      }
      else {
        switch (path[2]) {
          case 'companies':
            presenceData.details = privacy ? strings.viewAProfile : strings.viewProfile
            presenceData.state = `${textContent('.tm-company-card__name > span')}${subTitle ? ` – ${subTitle}` : ''}`
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
              '.tm-company-profile-card .tm-entity-image__pic',
            )?.src ?? ActivityAssets.Logo
            presenceData.buttons = [
              {
                label: strings.buttonViewPage,
                url: href,
              },
            ]

            if (path[4] && path[5] && !subTitle) {
              getPostData(path[4])
            }
            break

          case 'users':
            presenceData.details = privacy ? strings.viewAProfile : strings.viewProfile
            presenceData.state = `${textContent('.tm-user-card__title a')}${subTitle ? ` – ${subTitle}` : ''}`
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
              '.tm-user-card__header-data .tm-entity-image__pic',
            )?.src ?? ActivityAssets.Logo
            presenceData.buttons = [
              {
                label: strings.buttonViewPage,
                url: href,
              },
            ]
            break

          default:
            getPostData(path[2])
            break
        }
      }
      break
    }

    case 'search':
    {
      const searchValue = document.querySelector<HTMLInputElement>('input')?.value
      presenceData.details = strings.searchSomething
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search

      if (searchValue && !privacy) {
        presenceData.details = strings.searchFor
        presenceData.state = searchValue
      }
      break
    }

    case 'conversations':
    case 'tracker':
      presenceData.details = strings.readingADM
      presenceData.state = subTitle
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = strings.reading
      break

    case 'sandbox':
      presenceData.details = privacy ? strings.viewACategory : strings.viewCategory
      presenceData.state = `${textContent('.tm-section-name__text')}${subTitle ? ` – ${subTitle}` : ''}`
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = strings.view
      break
  }

  if (!logo || privacy)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (!buttons || privacy)
    delete presenceData.buttons
  if (time)
    presenceData.startTimestamp = browsingTimestamp
  if (privacy)
    delete presenceData.state
  presence.setActivity(presenceData)
})
