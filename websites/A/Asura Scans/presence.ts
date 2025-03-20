import { ActivityType } from 'premid'

const presence = new Presence({ clientId: '864304063804997702' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const ASURA_SCANS_LOGO = 'https://cdn.rcd.gg/PreMiD/websites/A/Asura%20Scans/assets/logo.png'
const CHAPTER_PROGRESS_SELECTOR = 'body > div:nth-child(4) > div > div > div > div.py-8.-mx-5.md\\:mx-0.flex.flex-col.items-center.justify-center'

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
    comic.title = document.title
      ?.split('Chapter')[0]
      ?.trim()
      ?.split(' - ')[0]
      ?.trim() ?? ''
    if (displayCover)
      comic.image = (await getComicImage(comic.url)) ?? ASURA_SCANS_LOGO
    else comic.image = ASURA_SCANS_LOGO
  }

  if (onChapterPage(pathname)) {
    presenceData.details = comic.title
    presenceData.largeImageKey = comic.image
    if (displayButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Comic Page',
          url: comic.url,
        },
      ]
    }
    if (displayChapter) {
      presenceData.state = `Chapter ${getChapterNumber()} ${
        displayPercentage ? `- ${getChapterProgress()}%` : ''
      }`
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
    presenceData.largeImageKey = comic.image
    presenceData.state = comic.title
    if (displayButtons) {
      presenceData.buttons = [
        {
          label: 'Visit Comic Page',
          url: comic.url,
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
  else presence.setActivity()
})

function onComicOrChapterPage(path: string) {
  return /\/series\/[a-z-\d].*$/i.test(path)
}

function onComicHomePage(path: string) {
  return /\/series\/[a-z-\d]+$/i.test(path)
}

function onChapterPage(path: string) {
  return /\/series\/[a-z-\d]+\/chapter\/\d+$/i.test(path)
}

function isNewComic(path: string, comic: Comic) {
  return comic.url !== path.split('/chapter')[0]
}

function getChapterNumber() {
  return document.title.split('Chapter')[1]?.split('-')[0]?.trim()
}

function getChapterProgress() {
  const progress = (document.documentElement.scrollTop
    / (document.querySelector(CHAPTER_PROGRESS_SELECTOR)!.scrollHeight
      - window.innerHeight))
    * 100
  return progress > 100 ? 100 : progress.toFixed(1)
}

async function getComicImage(comicHomePageURL: string): Promise<string | undefined> {
  const res = await (await fetch(comicHomePageURL)).text()
  return new DOMParser()
    .parseFromString(res, 'text/html')
    ?.querySelector<HTMLMetaElement>('head > meta[property=\'og:image\']')
    ?.content
}
