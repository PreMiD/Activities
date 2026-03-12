import { ActivityType } from 'premid'

const presence = new Presence({ clientId: '864304063804997702' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const ASURA_SCANS_LOGO = 'https://cdn.rcd.gg/PreMiD/websites/A/Asura%20Scans/assets/logo.png'
const CHAPTER_CONTAINER_SELECTORS = [
  'div.py-4.mx-5.md\\:mx-0.flex.flex-col.items-center.justify-center',
  'div.py-8.-mx-5.md\\:mx-0.flex.flex-col.items-center.justify-center',
]

interface Comic {
  title: string
  url: string
  image: string
}

const comic: Comic = {
  title: '',
  url: '',
  image: '',
}

presence.on('UpdateData', async () => {
  const { pathname, href } = window.location
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: ASURA_SCANS_LOGO,
    type: ActivityType.Watching,
  }

  const [
    displayPercentage,
    privacyMode,
    displayChapter,
    displayCover,
    displayButtons,
  ] = await Promise.all([
    presence.getSetting<boolean>('readingPercentage'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('chapterNumber'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showButtons'),
  ])

  if (privacyMode) {
    presenceData.details = 'Browsing Asura Scans'
    presence.setActivity(presenceData)
    return
  }

  if (onComicOrChapterPage(pathname) && isNewComic(href, comic)) {
    comic.url = href.split('/chapter')[0]!
    comic.title = document.title?.split('Chapter')[0]?.trim()?.split(' - ')[0]?.trim() ?? ''

    if (displayCover) {
      comic.image = (await getComicImage(comic.url)) ?? ASURA_SCANS_LOGO
    }
    else {
      comic.image = ASURA_SCANS_LOGO
    }
  }

  if (onChapterPage(pathname)) {
    presenceData.details = comic.title || document.title
    presenceData.largeImageKey = comic.image || ASURA_SCANS_LOGO

    if (displayButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Comic Page',
          url: comic.url || href.split('/chapter')[0]!,
        },
      ]
    }

    if (displayChapter) {
      const progress = displayPercentage ? getChapterProgress() : null

      presenceData.state = `Chapter ${getChapterNumber()} ${progress !== null ? ` - ${progress}%` : ''}`
      if (displayButtons) {
        presenceData.buttons?.push({
          label: 'Visit Chapter',
          url: href,
        })
      }
    }
  }
  else if (onComicHomePage(pathname)) {
    presenceData.details = 'Viewing Comic Home Page'
    presenceData.largeImageKey = comic.image || ASURA_SCANS_LOGO
    presenceData.state = comic.title || document.title

    if (displayButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Comic Page',
          url: comic.url || href,
        },
      ]
    }
  }
  else if (pathname.startsWith('/bookmark')) {
    presenceData.details = 'Viewing Bookmarks'
  }
  else if (pathname.startsWith('/series')) {
    presenceData.details = 'Viewing Comic List'
  }
  else if (pathname === '/') {
    presenceData.details = 'Viewing Home Page'
  }
  else {
    presenceData.details = 'Browsing Asura Scans'
    presenceData.state = document.title
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.setActivity()
})

function onComicOrChapterPage(path: string) {
  return /\/series\/[a-z0-9-].*$/i.test(path)
}

function onComicHomePage(path: string) {
  return /\/series\/[a-z0-9-]+\/?$/i.test(path)
}

function onChapterPage(path: string) {
  return /\/series\/[a-z0-9-]+\/chapter\/\d+\/?$/i.test(path)
}

function isNewComic(path: string, comic: Comic) {
  return comic.url !== path.split('/chapter')[0]
}

function getChapterNumber() {
  return document.title.split('Chapter')[1]?.split('-')[0]?.trim() ?? ''
}

function getChapterContainer(): HTMLElement | null {
  for (const selector of CHAPTER_CONTAINER_SELECTORS) {
    const el = document.querySelector<HTMLElement>(selector)
    if (el) {
      return el
    }
  }
  return null
}

function getChapterProgress(): number | null {
  try {
    const container = getChapterContainer()
    if (!container) {
      return null
    }

    const rect = container.getBoundingClientRect()
    const totalHeight = rect.height

    if (!totalHeight || !Number.isFinite(totalHeight)) {
      return null
    }

    const scrollY = window.scrollY || window.pageYOffset
    const containerTop = rect.top + scrollY
    const containerBottom = containerTop + totalHeight
    const viewportBottom = scrollY + window.innerHeight

    const visibleBottom = Math.min(viewportBottom, containerBottom)
    const progress = ((visibleBottom - containerTop) / totalHeight) * 100

    const clamped = Math.max(0, Math.min(100, progress))
    return Number.isFinite(clamped) ? Number(clamped.toFixed(1)) : null
  }
  catch {
    return null
  }
}

async function getComicImage(comicHomePageURL: string): Promise<string | undefined> {
  try {
    const res = await (await fetch(comicHomePageURL)).text()
    return new DOMParser()
      .parseFromString(res, 'text/html')
      ?.querySelector<HTMLMetaElement>('head > meta[property="og:image"]')
      ?.content
  }
  catch {
    return undefined
  }
}
