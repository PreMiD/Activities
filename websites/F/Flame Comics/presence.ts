import { ActivityType } from 'premid'

const presence = new Presence({ clientId: '864304063804997702' })
const browsingTimestamp = Math.floor(Date.now() / 1000)
const FLAME_COMICS_LOGO = 'https://cdn.rcd.gg/PreMiD/websites/F/Flame%20Comics/assets/logo.png'
// Old selector that doesn't work on Flame Comics
// const CHAPTER_PROGRESS_SELECTOR = 'body > div:nth-child(4) > div > div > div > div.py-8.-mx-5.md\\:mx-0.flex.flex-col.items-center.justify-center'

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
    largeImageKey: FLAME_COMICS_LOGO,
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
    presenceData.details = 'Browsing Flame Comics'
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
      comic.image = (await getComicImage(comic.url)) ?? FLAME_COMICS_LOGO
    else comic.image = FLAME_COMICS_LOGO
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
  else if (pathname.startsWith('/browse')) {
    presenceData.details = 'Viewing Comic List'
  }
  else if (pathname === '/') {
    presenceData.details = 'Viewing Home Page'
  }
  else {
    presenceData.details = 'Browsing Flame Comics'
    presenceData.state = document.title
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

// Add these URL pattern detection functions 
function onComicOrChapterPage(path: string) {
  return path.startsWith('/series/')
}

function onComicHomePage(path: string) {
  // Matches /series/ID pattern (without chapter part)
  return /^\/series\/\d+$/.test(path)
}

function onChapterPage(path: string) {
  // Matches /series/ID/CHAPTER_ID pattern
  return /^\/series\/\d+\/[a-zA-Z0-9]+$/.test(path)
}

// Add function to extract chapter ID
function getChapterNumber() {
  const chapterId = window.location.pathname.split('/')[3] || ''
  // You might need to map chapter IDs to readable numbers if available on the page
  // For now, just return the chapter ID
  return chapterId
}

// Add function to check if URL changed to a new comic
function isNewComic(href: string, comic: Comic) {
  const comicUrl = href.split('/')[4] // Get series ID
  return comicUrl !== comic.url
}

// Add function to extract comic image
async function getComicImage(url: string): Promise<string | null> {
  try {
    // Try to find the comic cover image on the page
    const coverElement = document.querySelector('.comic-cover-image') || 
                        document.querySelector('.series-image') ||
                        document.querySelector('img[alt*="cover"]')
    
    return coverElement ? (coverElement as HTMLImageElement).src : null
  } catch (e) {
    console.error('Error getting comic image:', e)
    return null
  }
}

// Add function to calculate reading progress
function getChapterProgress() {
  try {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
    return Math.min(100, Math.max(0, progress)).toFixed(0)
  } catch (e) {
    return "0"
  }
}
