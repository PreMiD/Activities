declare const Presence: new (options: { clientId: string }) => {
  on: (event: string, handler: () => void | Promise<void>) => void
  setActivity: (data: PresenceData) => void
  clearActivity: () => void
}

type PresenceData = {
  largeImageKey?: string
  details?: string
  state?: string
  startTimestamp?: number
}

const presence = new Presence({
  clientId: '1477950736951279666' // You must enter this yourself
})
const browsingTimestamp = Math.floor(Date.now() / 1000) // Show elapsed time

enum ActivityAssets {
  Logo = 'https://fridg3.org/resources/icon-512x512.png',
}

function normalizePath(pathname: string): string {
  if (!pathname) return '/'
  const normalized = pathname.replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

function ensureTrailingSlash(pathname: string): string {
  if (pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

function getDetailsPath(pathname: string): string {
  // For music, show "Listening to music"
  if (pathname.startsWith('/music')) return 'Listening to music'
  
  // For toast bot, show "Toast Discord Bot"
  if (pathname === '/others/toast-discord-bot') return 'Toast Discord Bot'
  
  // For specific post views, show the post type
  if (pathname.startsWith('/feed/posts/')) return 'Viewing feed post'
  if (pathname.startsWith('/journal/posts/')) return 'Viewing journal post'
  if (pathname.startsWith('/email/newsletter/release/')) return 'Viewing newsletter post'
  
  // For non-post feed/journal/newsletter, collapse to main page
  if (pathname.startsWith('/feed')) return '/feed/'
  if (pathname.startsWith('/journal')) return '/journal/'
  if (pathname.startsWith('/email/newsletter')) return '/email/newsletter/'
  
  return ensureTrailingSlash(pathname)
}

function cleanText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function cleanSiteTitle(value: string | null | undefined): string {
  const text = cleanText(value)
  if (!text) return ''
  return text
    .replace(/\s*[|•·-]\s*fridg3\.org\s*$/i, '')
    .replace(/^fridg3\.org\s*[|•·-]\s*/i, '')
    .trim()
}

function getDocumentHeadingText(): string {
  const heading = document.querySelector('#content h1, h1') as HTMLElement | null
  return cleanText(heading?.textContent)
}

function getJournalPostTitle(): string {
  const articleTitle = cleanText((document.getElementById('journal-article-title') as HTMLElement | null)?.textContent)
  if (articleTitle) return articleTitle

  const metaOg = cleanText((document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null)?.content)
  if (metaOg) return cleanSiteTitle(metaOg)

  return cleanSiteTitle(document.title)
}

function getNewsletterReleaseTitle(): string {
  const releaseRoot = document.getElementById('newsletter-release-html')
  if (releaseRoot) {
    const scopedHeading = releaseRoot.querySelector('h1, h2, .newsletter-title, .title') as HTMLElement | null
    const scopedHeadingText = cleanText(scopedHeading?.textContent)
    if (scopedHeadingText) return scopedHeadingText

    const scopedTitleTag = releaseRoot.querySelector('title')
    const scopedTitleText = cleanSiteTitle(scopedTitleTag?.textContent)
    if (scopedTitleText) return scopedTitleText
  }

  return cleanSiteTitle(document.title)
}

function parseFeedPostDateFromPath(pathname: string): string {
  const match = pathname.match(/\/feed\/posts\/([0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2})$/)
  if (!match || !match[1]) return ''

  const [datePart, timePart] = match[1].split('_')
  if (!datePart || !timePart) return ''
  return `${datePart} ${timePart.replace(/-/g, ':')}`
}

function getFeedPostDate(pathname: string): string {
  const fromPath = parseFeedPostDateFromPath(pathname)
  if (fromPath) return fromPath

  const dateEl = document.getElementById('post-date-feed')
  const raw = cleanText(dateEl?.textContent)
  if (!raw) return ''

  const parts = raw.split('•')
  return cleanText(parts[0])
}

function getMiniPlayerNowPlaying(): string {
  const titleEl = document.getElementById('mini-player-title-inner')
  const raw = cleanText(titleEl?.textContent)
  if (!raw) return ''

  const sanitized = raw.replace(/^now playing:\s*/i, '').trim()
  if (!sanitized || /^nothing$/i.test(sanitized)) return ''
  return sanitized
}

function isToastRadioInMiniPlayer(): boolean {
  const audioEl = document.getElementById('mini-player-audio') as HTMLAudioElement | null
  if (audioEl?.dataset?.toastLive === '1') return true

  const miniPlayer = document.getElementById('mini-player')
  return !!miniPlayer?.classList.contains('live-stream')
}

function getMiniPlayerAlbumArt(): string {
  const artEl = document.getElementById('mini-player-art') as HTMLImageElement | null
  const src = artEl?.src
  if (src && src !== '' && !src.includes('data:')) {
    return src
  }
  return ''
}

function getToastStreamName(): string {
  const nameEl = document.getElementById('now-playing-name')
  const raw = cleanText(nameEl?.textContent)
  if (!raw || /^loading/i.test(raw)) return ''
  return raw
}

function getStatusForPath(pathname: string): string {
  if (pathname === '/') return 'On the homepage'

  if (pathname === '/feed') return 'Reading feed posts'
  if (pathname === '/feed/create') return 'Writing a feed post'
  if (pathname === '/feed/edit') return 'Editing a feed post'
  if (pathname.startsWith('/feed/posts/')) {
    const feedDate = getFeedPostDate(pathname)
    return feedDate || 'Undated feed post'
  }

  if (pathname === '/journal') return 'Reading journal entries'
  if (pathname === '/journal/create') return 'Writing a journal entry'
  if (pathname.startsWith('/journal/create/preview')) return 'Previewing a journal draft'
  if (pathname === '/journal/edit') return 'Editing a journal entry'
  if (pathname.startsWith('/journal/edit/preview')) return 'Previewing journal edits'
  if (pathname.startsWith('/journal/posts/')) {
    const title = getJournalPostTitle()
    return title || 'Untitled journal entry'
  }

  if (pathname === '/email') return 'Writing an email'
  if (pathname === '/email/newsletter') return 'Browsing newsletters'
  if (pathname.startsWith('/email/newsletter/create/preview')) return 'Previewing a newsletter'
  if (pathname === '/email/newsletter/create') return 'Building a newsletter'
  if (pathname.startsWith('/email/newsletter/release/')) {
    const title = getNewsletterReleaseTitle()
    return title || 'Untitled newsletter'
  }
  if (pathname.startsWith('/email/newsletter/preview')) return 'Previewing a newsletter release'
  if (pathname.startsWith('/email/mailinglist/subscribe')) return 'Subscribing to the mailing list'
  if (pathname.startsWith('/email/mailinglist/unsubscribe')) return 'Unsubscribing from the mailing list'

  if (pathname === '/music') {
    const nowPlaying = getMiniPlayerNowPlaying()
    return nowPlaying || 'Browsing the music library'
  }

  if (pathname === '/others') return 'Browsing other pages'
  if (pathname === '/others/off-topic-archive') return 'Exploring the #off-topic archive'
  if (pathname === '/others/toast-discord-bot') {
    const streamName = getToastStreamName()
    return streamName || 'Toast Discord Bot offline'
  }

  if (pathname === '/gallery') return 'Browsing the gallery'
  if (pathname === '/guestbook') return 'Reading the guestbook'
  if (pathname === '/guestbook/create') return 'Signing the guestbook'
  if (pathname === '/guestbook/edit') return 'Editing a guestbook entry'
  if (pathname === '/bookmarks') return 'Reviewing saved posts'
  if (pathname === '/settings') return 'Updating site settings'
  if (pathname === '/discord') return 'Viewing Discord info'
  if (pathname === '/merch') return 'Browsing merch'
  if (pathname === '/formatting') return 'Viewing formatting reference'
  if (pathname === '/formatting/example_page') return 'Viewing an example page'

  if (pathname === '/account') return 'Managing account access'
  if (pathname === '/account/login') return 'Logging in'
  if (pathname === '/account/logout') return 'Logging out'
  if (pathname === '/account/create') return 'Creating an account'
  if (pathname === '/account/password') return 'Updating account password'
  if (pathname === '/account/change-password') return 'Changing account password'

  if (pathname.startsWith('/api/')) return 'Using API endpoints'
  if (pathname.startsWith('/data/')) return 'Viewing file'

  const heading = getDocumentHeadingText()
  if (heading) return `Viewing ${heading}`

  return 'Browsing fridg3.org'
}

presence.on('UpdateData', async () => {
  // Get the current URL
  const { pathname } = document.location
  const normalizedPath = normalizePath(pathname)

  const detailsPath = getDetailsPath(normalizedPath)
  const details = (detailsPath.startsWith('Viewing') || detailsPath.startsWith('Listening') || detailsPath.startsWith('Toast')) ? detailsPath : `Browsing ${detailsPath}`

  // Use album art as icon when playing music, otherwise use logo
  const largeImageKey: string = (() => {
    if (normalizedPath === '/music') {
      const albumArt = getMiniPlayerAlbumArt()
      if (albumArt) return albumArt
    }
    return ActivityAssets.Logo
  })()

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey,
    details,
    startTimestamp: browsingTimestamp, // Show elapsed time
    state: getStatusForPath(normalizedPath)
  }

  // Set the activity
  presence.setActivity(presenceData)
})