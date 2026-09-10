import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1545636765875048538', // TODO: replace with your Discord application ID
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/lrQuCiY.png',
}

async function getStrings() {
  return presence.getStrings({
    viewHome: 'general.viewHome',
    search: 'general.search',
    searchFor: 'general.searchFor',
    searchSomething: 'general.searchSomething',
    reading: 'general.reading',
    viewAManga: 'general.viewAManga',
    view: 'general.view',
    chapter: 'general.chapter',
    buttonViewPage: 'general.buttonViewPage',
    browsing: 'general.browsing',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>

const CHAPTER_MARKER = '\u0627\u0644\u0641\u0635\u0644' // "الفصل"
const FROM_MANGA_MARKER = '\u0645\u0646 \u0645\u0627\u0646\u062C\u0627' // "من مانجا"
const TRANSLATED_MARKER = '\u0645\u062A\u0631\u062C\u0645' // "مترجم"
const FSI = '\u2068' // First Strong Isolate
const PDI = '\u2069' // Pop Directional Isolate

// Chapter page titles follow the pattern:
// "الفصل  1192 - لن نسمح!! من مانجا One Piece مترجم للعربية على موقع العاشق للمانجا"
function parseChapterTitle() {
  const { title } = document
  const fromMangaIndex = title.indexOf(FROM_MANGA_MARKER)

  if (!title.startsWith(CHAPTER_MARKER) || fromMangaIndex === -1)
    return {}

  const chapterPart = title.slice(CHAPTER_MARKER.length, fromMangaIndex).trim()
  const afterFromManga = title.slice(fromMangaIndex + FROM_MANGA_MARKER.length).trim()
  const translatedIndex = afterFromManga.indexOf(TRANSLATED_MARKER)
  const manga = (translatedIndex === -1 ? afterFromManga : afterFromManga.slice(0, translatedIndex)).trim()

  const dashIndex = chapterPart.indexOf('-')
  const chapter = (dashIndex === -1 ? chapterPart : chapterPart.slice(0, dashIndex)).trim()
  const subtitle = dashIndex === -1 ? undefined : chapterPart.slice(dashIndex + 1).trim()

  return { chapter, subtitle, manga }
}

// Manga info page titles follow the pattern "{Manga Name} – 3asq"
function getMangaNameFromTitle() {
  const { title } = document
  const separators = [' \u2013 ', ' - ']

  for (const separator of separators) {
    const index = title.indexOf(separator)
    if (index !== -1)
      return title.slice(0, index).trim()
  }

  return title.trim()
}

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const path = pathname.split('/').filter(Boolean)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const [privacy, cover, buttons, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('time'),
  ])

  if (!strings)
    strings = await getStrings()

  const coverImage = document
    .querySelector('meta[property=\'og:image\']')
    ?.getAttribute('content') ?? undefined

  const params = new URLSearchParams(search)

  if (params.has('s')) {
    // Search results, e.g. /?s=one+piece&post_type=wp-manga
    presenceData.details = privacy ? strings.searchSomething : strings.searchFor
    presenceData.state = privacy ? undefined : (params.get('s') ?? undefined)
  }
  else if (path.length === 0) {
    // Homepage
    presenceData.details = strings.viewHome
  }
  else if (path[0] === 'manga' && path[1] && path[2]) {
    // Chapter reading page: /manga/{slug}/{chapter}/
    const { chapter, subtitle, manga } = parseChapterTitle()

    presenceData.details = `${FSI}${strings.reading}${PDI} ${FSI}${privacy ? strings.chapter : (manga ?? path[1])}${PDI}`
    presenceData.state = privacy
      ? undefined
      : `${strings.chapter} ${chapter ?? path[2]}${subtitle ? ` - ${FSI}${subtitle}${PDI}` : ''}`
    presenceData.largeImageKey = cover && coverImage ? coverImage : ActivityAssets.Logo

    if (buttons && !privacy) {
      presenceData.buttons = [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ]
    }
  }
  else if (path[0] === 'manga' && path[1]) {
    // Manga info page: /manga/{slug}/
    presenceData.details = strings.viewAManga
    presenceData.state = privacy ? undefined : (getMangaNameFromTitle() ?? path[1])
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = strings.view
    presenceData.largeImageKey = cover && coverImage ? coverImage : ActivityAssets.Logo

    if (buttons && !privacy) {
      presenceData.buttons = [
        {
          label: strings.buttonViewPage,
          url: href,
        },
      ]
    }
  }
  else if (
    path[0] === 'manga'
    || path[0] === 'manga-genre'
    || path[0] === 'manga-tag'
    || path[0] === 'manga-author'
    || path[0] === 'manga-artist'
    || path[0] === 'manga-release'
  ) {
    // Manga list / genre / tag / author / artist archive pages
    presenceData.details = privacy ? strings.searchSomething : strings.searchFor
    presenceData.state = privacy ? undefined : decodeURIComponent(path[1] ?? '')
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.search
  }
  else if (path[0] === 'blog') { // Articles / news
    presenceData.details = strings.reading
    presenceData.state = privacy ? undefined : getMangaNameFromTitle()
  }
  else {
    presenceData.details = strings.browsing
  }
  if (!time)
    delete presenceData.startTimestamp

  presence.setActivity(presenceData)
})
