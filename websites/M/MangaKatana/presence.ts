import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1104842127034306724',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const { pathname, href, search } = document.location
const path = pathname.split('/')
const title = document
  .querySelector('meta[property=\'og:title\']')
  ?.getAttribute('content')

async function getStrings() {
  return presence.getStrings(
    {
      editing: 'general.editing',
      genre: 'general.genre',
      manga: 'general.manga',
      reading: 'general.reading',
      readingAbout: 'general.readingAbout',
      search: 'general.search',
      searchFor: 'general.searchFor',
      searchSomething: 'general.searchSomething',
      view: 'general.view',
      viewHome: 'general.viewHome',
      viewPage: 'general.viewPage',
      buttonViewPage: 'general.buttonViewPage',
    },

  )
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaKatana/assets/logo.png',
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null
let currentMangaPage: string | null = null

function textContent(tags: string) {
  return document.querySelector(tags)?.textContent?.trim()
}

const observer = new IntersectionObserver(
  (entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target)
        currentMangaPage = (<HTMLImageElement>entry.target)?.src
      }
    }
  },
  { threshold: 0.5 },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const [newLang, privacy, cover, time, buttons, pages] = await Promise.all([
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('pages'),
  ])
  const searchInput = document.querySelector<HTMLInputElement>('input#input_search')?.value

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  function getSearchState() {
    if (!search)
      return title
    const genres = search?.match(/include=([-\w]+)/)
    if (!genres)
      return
    return `${strings.genre}: ${genres[1]
      ?.split('_')
      ?.map((genre: string) => genre.charAt(0).toUpperCase() + genre.slice(1))
      ?.join(', ')}`
  }

  switch (path[1]) {
    case '':
      presenceData.details = strings.viewHome
      break

    case 'manga':
      presenceData.details = privacy
        ? strings.searchSomething
        : strings.searchFor
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search
      presenceData.state = getSearchState()

      if (path[3]) {
        presenceData.details = `${strings.reading} ${
          privacy
            ? strings.manga
            : textContent('ol.uk-breadcrumb li:nth-child(2) span')
        }`
        presenceData.state = textContent(
          'ol.uk-breadcrumb li:nth-child(3) span',
        )

        if (pages) {
          for (const page of document.querySelectorAll('#imgs img'))
            observer.observe(page)
          presenceData.largeImageKey = currentMangaPage ?? ActivityAssets.Logo
        }
        else {
          presenceData.largeImageKey = ActivityAssets.Logo
        }

        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = strings.reading
        presenceData.buttons = [
          {
            label: strings.buttonViewPage,
            url: href,
          },
        ]
      }
      else if (path[2]) {
        presenceData.details = privacy
          ? `${strings.viewPage} ${strings.manga}`
          : strings.readingAbout
        presenceData.state = textContent('#single_book .info .heading')
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
          '#single_book .cover img',
        )?.src
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = strings.view
        presenceData.buttons = [
          {
            label: strings.buttonViewPage,
            url: href,
          },
        ]
      }
      break

    case 'genres':
    case 'latest':
    case 'new-manga':
    case 'genre':
    case 'author':
      presenceData.details = privacy
        ? strings.searchSomething
        : strings.searchFor
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = strings.search
      presenceData.state = getSearchState()
      break

    case 'settings':
    case 'bookmarks':
      presenceData.details = strings.editing
      presenceData.state = title
      presenceData.smallImageKey = ActivityAssets.Logo
      break
  }

  if (searchInput) {
    presenceData.details = privacy
      ? strings.searchSomething
      : strings.searchFor
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
    presenceData.state = searchInput
  }

  if (!cover || privacy)
    presenceData.largeImageKey = ActivityAssets.Logo
  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons
  if (!time && presenceData.startTimestamp)
    delete presenceData.startTimestamp
  if (privacy && presenceData.state)
    delete presenceData.state
  presence.setActivity(presenceData)
})
