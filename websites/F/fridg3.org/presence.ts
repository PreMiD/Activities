declare const Presence: new (options: { clientId: string }) => {
  on: (event: string, handler: () => void | Promise<void>) => void
  setActivity: (data: PresenceData) => void
  clearActivity: () => void
}

interface PresenceData {
  largeImageKey?: string
  details?: string
  state?: string
  startTimestamp?: number
}

const presence = new Presence({
  clientId: '1477950736951279666',
})
const browsingTimestamp = Math.floor(Date.now() / 1000) // Show elapsed time

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/F/fridg3.org/assets/logo.png',
}

function normalizePath(pathname: string): string {
  if (!pathname)
    return '/'
  const normalized = pathname
    .replace(/\/(?:index\.php|index\.html)$/i, '')
    .replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

function ensureTrailingSlash(pathname: string): string {
  if (pathname === '/')
    return '/'
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

function getDetailsPath(pathname: string): string {
  // For music, show "Listening to music"
  if (pathname.startsWith('/music'))
    return 'Listening to music'

  if (pathname.startsWith('/others/frdgbeats'))
    return 'frdgBeats'

  // For toast bot, show "Toast Discord Bot"
  if (pathname.startsWith('/others/toast-discord-bot'))
    return 'Toast Discord Bot'

  // For specific post views, show the post type
  if (pathname.startsWith('/feed/posts/'))
    return 'Viewing feed post'
  if (pathname.startsWith('/journal/posts/'))
    return 'Viewing journal post'
  if (pathname.startsWith('/chat/') && pathname !== '/chat')
    return 'Private chat'
  if (pathname.startsWith('/others/mdpaste/s/'))
    return 'Viewing mdpaste'

  // For non-post feed/journal paths, collapse to main page
  if (pathname.startsWith('/feed'))
    return '/feed/'
  if (pathname.startsWith('/journal'))
    return '/journal/'

  return ensureTrailingSlash(pathname)
}

function cleanText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function cleanSiteTitle(value: string | null | undefined): string {
  const text = cleanText(value)
  if (!text)
    return ''
  return text
    .replace(/\s*[|•·-]\s*fridg3\.org\s*$/i, '')
    .replace(/^fridg3\.org\s*[|•·-]\s*/i, '')
    .trim()
}

function getDocumentHeadingText(): string {
  const heading = document.querySelector<HTMLElement>('#content h1, h1')
  return cleanText(heading?.textContent)
}

function getJournalPostTitle(): string {
  const articleTitle = cleanText((document.getElementById('journal-article-title') as HTMLElement | null)?.textContent)
  if (articleTitle)
    return articleTitle

  const metaOg = cleanText(document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content)
  if (metaOg)
    return cleanSiteTitle(metaOg)

  return cleanSiteTitle(document.title)
}

function parseFeedPostDateFromPath(pathname: string): string {
  const match = pathname.match(/\/feed\/posts\/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})$/)
  if (!match || !match[1])
    return ''

  const [datePart, timePart] = match[1].split('_')
  if (!datePart || !timePart)
    return ''
  return `${datePart} ${timePart.replace(/-/g, ':')}`
}

function getFeedPostDate(pathname: string): string {
  const fromPath = parseFeedPostDateFromPath(pathname)
  if (fromPath)
    return fromPath

  const dateEl = document.getElementById('post-date-feed')
  const raw = cleanText(dateEl?.textContent)
  if (!raw)
    return ''

  const parts = raw.split('•')
  return cleanText(parts[0])
}

function getMiniPlayerNowPlaying(): string {
  const titleEl = document.getElementById('mini-player-title-inner')
  const raw = cleanText(titleEl?.textContent)
  if (!raw)
    return ''

  const sanitized = raw.replace(/^now playing:\s*/i, '').trim()
  if (!sanitized || /^nothing$/i.test(sanitized))
    return ''
  return sanitized
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
  if (!raw || /^loading/i.test(raw))
    return ''
  return raw
}

function getWikiPageTitle(): string {
  const heading = cleanText(document.querySelector<HTMLElement>('.wiki-content h1, #content h1, h1')?.textContent)
  if (heading)
    return heading

  const page = new URLSearchParams(document.location.search).get('page')
  return cleanText(page)
}

function getMdpasteTitle(): string {
  const title = cleanText(document.getElementById('paste-title')?.textContent)
  if (title && !/^mdpaste$/i.test(title))
    return title

  const heading = getDocumentHeadingText()
  if (heading && !/^mdpaste$/i.test(heading))
    return heading

  return ''
}

function getFrdgBeatsProjectName(): string {
  const projectName = cleanText((document.getElementById('fb-project-name') as HTMLInputElement | null)?.value)
  if (projectName)
    return projectName

  return cleanText(document.querySelector<HTMLElement>('.fb-app-title')?.textContent)
}

function getStatusForPath(pathname: string, search: string): string {
  const searchParams = new URLSearchParams(search)

  if (pathname === '/')
    return 'On the homepage'

  if (pathname === '/feed')
    return 'Reading feed posts'
  if (pathname === '/feed/create')
    return 'Writing a feed post'
  if (pathname === '/feed/edit')
    return 'Editing a feed post'
  if (pathname.startsWith('/feed/posts/')) {
    const feedDate = getFeedPostDate(pathname)
    return feedDate || 'Undated feed post'
  }

  if (pathname === '/journal')
    return 'Reading journal entries'
  if (pathname === '/journal/create')
    return 'Writing a journal entry'
  if (pathname.startsWith('/journal/create/preview'))
    return 'Previewing a journal draft'
  if (pathname === '/journal/edit')
    return 'Editing a journal entry'
  if (pathname.startsWith('/journal/edit/preview'))
    return 'Previewing journal edits'
  if (pathname.startsWith('/journal/posts/')) {
    const title = getJournalPostTitle()
    return title || 'Untitled journal entry'
  }

  if (pathname === '/music') {
    const nowPlaying = getMiniPlayerNowPlaying()
    return nowPlaying || 'Browsing the music library'
  }

  if (pathname === '/contact')
    return searchParams.get('dashboard') === '1' ? 'Reviewing contact submissions' : 'Sending a message'

  if (pathname === '/chat')
    return 'Managing private chats'
  if (pathname.startsWith('/chat/'))
    return 'In a private chat'

  if (pathname === '/others')
    return 'Browsing other pages'
  if (pathname === '/others/mdpaste')
    return 'Creating a markdown paste'
  if (pathname.startsWith('/others/mdpaste/s/')) {
    const title = getMdpasteTitle()
    return title || 'Reading a markdown paste'
  }
  if (pathname === '/others/off-topic-archive')
    return 'Exploring the #off-topic archive'
  if (pathname === '/others/minecraft-archive')
    return 'Browsing the Minecraft archive'
  if (pathname === '/others/fridge-builds-websites')
    return 'Checking out custom websites'
  if (pathname === '/others/toast-discord-bot') {
    const streamName = getToastStreamName()
    return streamName || 'Toast Discord Bot offline'
  }
  if (pathname === '/others/toast-discord-bot/messages')
    return 'Managing Toast DMs'
  if (pathname === '/others/frdgbeats') {
    const projectName = getFrdgBeatsProjectName()
    return projectName ? `Making music: ${projectName}` : 'Making music in frdgBeats'
  }
  if (pathname.startsWith('/others/frdgbeats/wiki')) {
    const pageTitle = getWikiPageTitle()
    return pageTitle ? `Reading ${pageTitle}` : 'Reading frdgBeats docs'
  }

  if (pathname === '/gallery')
    return 'Browsing the gallery'
  if (pathname === '/guestbook')
    return 'Reading the guestbook'
  if (pathname === '/guestbook/create')
    return 'Signing the guestbook'
  if (pathname === '/guestbook/edit')
    return 'Editing a guestbook entry'
  if (pathname === '/bookmarks')
    return 'Reviewing saved posts'
  if (pathname === '/settings')
    return 'Updating site settings'
  if (pathname === '/discord')
    return 'Viewing Discord info'
  if (pathname === '/merch')
    return 'Browsing merch'
  if (pathname === '/formatting')
    return 'Viewing formatting reference'
  if (pathname === '/formatting/example_page')
    return 'Viewing an example page'
  if (pathname === '/wiki') {
    const pageTitle = getWikiPageTitle()
    return pageTitle ? `Reading ${pageTitle}` : 'Reading the developer wiki'
  }

  if (pathname === '/account')
    return 'Managing account access'
  if (pathname === '/account/login')
    return 'Logging in'
  if (pathname === '/account/logout')
    return 'Logging out'
  if (pathname === '/account/create')
    return 'Creating an account'
  if (pathname === '/account/password')
    return 'Updating account password'
  if (pathname === '/account/change-password')
    return 'Changing account password'
  if (pathname === '/account/link-discord')
    return 'Linking Discord'
  if (pathname === '/account/admin')
    return 'Managing accounts'
  if (pathname === '/account/admin/edit')
    return 'Editing an account'

  if (pathname === '/error/403')
    return '403 forbidden'
  if (pathname === '/error/404')
    return '404 not found'
  if (pathname === '/error/50x')
    return 'Server error page'
  if (pathname === '/error/wip')
    return 'Waiting for maintenance'

  if (pathname.startsWith('/api/'))
    return 'Using API endpoints'
  if (pathname.startsWith('/data/'))
    return 'Viewing file'

  const heading = getDocumentHeadingText()
  if (heading)
    return `Viewing ${heading}`

  return 'Browsing fridg3.org'
}

presence.on('UpdateData', async () => {
  // Get the current URL
  const { pathname, search } = document.location
  const normalizedPath = normalizePath(pathname)

  const detailsPath = getDetailsPath(normalizedPath)
  const details = (detailsPath.startsWith('Viewing') || detailsPath.startsWith('Listening') || detailsPath.startsWith('Toast')) ? detailsPath : `Browsing ${detailsPath}`

  // Use album art as icon when playing music, otherwise use logo
  const largeImageKey: string = (() => {
    if (normalizedPath === '/music') {
      const albumArt = getMiniPlayerAlbumArt()
      if (albumArt)
        return albumArt
    }
    return ActivityAssets.Logo
  })()

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey,
    details,
    startTimestamp: browsingTimestamp, // Show elapsed time
    state: getStatusForPath(normalizedPath, search),
  }

  // Set the activity
  presence.setActivity(presenceData)
})
