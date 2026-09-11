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
  buttons?: { label: string, url: string }[]
}

const presence = new Presence({
  clientId: '1477950736951279666',
})
const browsingTimestamp = Math.floor(Date.now() / 1000) // Show elapsed time

enum ActivityAssets {
  Logo = 'https://fridge.dev/resources/icons/icon-512.png',
}

function normalizePath(pathname: string): string {
  if (!pathname)
    return '/'
  const normalized = pathname
    .replace(/\/+/g, '/')
    .replace(/\/(?:index\.php|index\.html)(?=\/|$)/i, '')
    .replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

// Match complete route segments so /music-other cannot become /music.
function isRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

function getDetailsPath(pathname: string): string {
  if (isRoute(pathname, '/feed/posts'))
    pathname = '/feed'
  // Only show the tool's base path, never shared resource or room identifiers.
  if (isRoute(pathname, '/tools'))
    pathname = pathname.split('/').slice(0, 3).join('/')
  if (isRoute(pathname, '/chat'))
    pathname = '/chat'
  // pathname excludes query strings and fragments on every page.
  return `fridge.dev${pathname}`.slice(0, 128)
}

function canLinkPage(pathname: string): boolean {
  return ![
    '/account',
    '/chat',
    '/error',
    '/feed/create',
    '/feed/edit',
    '/journal/create',
    '/journal/edit',
    '/music/upload',
    '/notifications',
    '/settings',
    // Tool URLs can contain private resource or room identifiers.
    '/tools',
  ].some(route => isRoute(pathname, route))
}

function cleanText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function cleanSiteTitle(value: string | null | undefined): string {
  const text = cleanText(value).replace(/^(?:(?:\(\d+\)|\[DEV\])\s*)+/i, '')
  if (!text)
    return ''
  return text
    .replace(/\s*[|•·-]\s*(?:m\.)?(?:fridge\.dev|fridg3\.org)\s*$/i, '')
    .replace(/^(?:m\.)?(?:fridge\.dev|fridg3\.org)\s*[|•·-]\s*/i, '')
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
  const [year, month, day] = datePart.split('-')
  return `${day}/${month}/${year!.slice(-2)} ${timePart.slice(0, 5).replace('-', ':')}`
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
  return cleanText(parts[0]).replace(/\b(\d{2}\/\d{2}\/)\d{2}(\d{2})\b/, '$1$2').replace(/(\d{2}:\d{2}):\d{2}\b/, '$1')
}

function getMiniPlayerNowPlaying(): string {
  const titleEl = document.getElementById('mini-player-title-inner')
  const raw = cleanText(titleEl?.textContent)
  if (!raw)
    return ''

  const sanitized = raw.replace(/^now playing:\s*/i, '').trim()
  if (!sanitized || /^nothing$/i.test(sanitized))
    return ''
  const artist = cleanText(document.getElementById('mini-player-artist')?.textContent)
  return artist ? `${sanitized} — ${artist}` : sanitized
}

function getMiniPlayerAlbumArt(): string {
  const artEl = document.getElementById('mini-player-art') as HTMLImageElement | null
  const src = artEl?.src
  if (src && /^https?:\/\//i.test(src)) {
    return src
  }
  return ''
}

function getWikiPageTitle(): string {
  const heading = cleanText(document.querySelector<HTMLElement>('#wiki-rendered h1')?.textContent)
  if (heading)
    return heading

  const page = new URLSearchParams(document.location.search).get('page')
  return cleanText(page)
}

function getMdpasteTitle(): string {
  const title = cleanText(document.querySelector('#mdpaste-formatted .mdpaste-article-title, #mdpaste-formatted h1')?.textContent)
  if (title && !/^mdpaste$/i.test(title))
    return title

  const heading = getDocumentHeadingText()
  if (heading && !/^mdpaste$/i.test(heading))
    return heading

  return ''
}

function isMusicPlaying(): boolean {
  const audio = document.getElementById('mini-player-audio') as HTMLAudioElement | null
  return !!audio && !audio.paused && !audio.ended && !!audio.currentSrc && audio.readyState >= 2
}

type PageStatus = string | ((pathname: string, searchParams: URLSearchParams) => string)

const pageStatuses: Record<string, PageStatus> = {
  '/': 'On the homepage',
  '/account': 'Managing account access',
  '/account/admin': 'Managing accounts',
  '/account/admin/edit': 'Editing an account',
  '/account/change-password': 'Changing account password',
  '/account/create': 'Creating an account',
  '/account/email': 'Managing account email',
  '/account/link-discord': 'Linking Discord',
  '/account/login': 'Logging in',
  '/account/logout': 'Logging out',
  '/account/password': 'Updating account password',
  '/api/': 'Using API endpoints',
  '/bookmarks': 'Reviewing saved posts',
  '/chat': (pathname, searchParams) => pathname !== '/chat' || searchParams.has('id') ? 'In a private chat' : 'Managing private chats',
  '/contact': (_pathname, searchParams) => searchParams.get('dashboard') === '1' ? 'Reviewing contact submissions' : 'Sending a message',
  '/data/': 'Viewing file',
  '/discord': 'Viewing Discord info',
  '/error/403': '403 forbidden',
  '/error/404': '404 not found',
  '/error/50x': 'Server error page',
  '/error/blacklisted': 'Access denied',
  '/error/unknown': 'Viewing the unknown page',
  '/error/wip': 'Waiting for maintenance',
  '/feed': 'Reading feed posts',
  '/feed/create': 'Writing a feed post',
  '/feed/edit': 'Editing a feed post',
  '/feed/posts': (pathname, searchParams) => {
    const feedDate = getFeedPostDate(pathname)
    if (searchParams.has('edit_reply'))
      return 'Editing a feed reply'
    if (searchParams.has('reply_to'))
      return 'Replying to a feed comment'
    const username = cleanText(document.getElementById('post-username')?.textContent).replace(/^@+/, '')
    const postStatus = username ? `Viewing post by @${username}` : 'Viewing feed post'
    return feedDate ? `${postStatus} | ${feedDate}` : postStatus
  },
  '/formatting': 'Viewing formatting reference',
  '/formatting/example': 'Viewing an example page',
  '/formatting/example_md': 'Viewing a Markdown example page',
  '/formatting/markdown': 'Reading the Markdown guide',
  '/formatting/markdown/feed': 'Reading the feed Markdown guide',
  '/gallery': 'Browsing the gallery',
  '/guestbook': 'Reading the guestbook',
  '/guestbook/create': 'Signing the guestbook',
  '/guestbook/edit': 'Editing a guestbook entry',
  '/journal': 'Reading journal entries',
  '/journal/create': 'Writing a journal entry',
  '/journal/create/preview': 'Previewing a journal draft',
  '/journal/edit': 'Editing a journal entry',
  '/journal/edit/preview': 'Previewing journal edits',
  '/journal/posts': () => getJournalPostTitle() || 'Untitled journal entry',
  '/merch': 'Browsing merch',
  '/music': () => {
    const nowPlaying = getMiniPlayerNowPlaying()
    return isMusicPlaying() ? nowPlaying || 'Playing music' : 'Browsing the music library'
  },
  '/music/upload': 'Uploading a music release',
  '/notifications': 'Reading notifications',
  '/others': 'Browsing other pages',
  '/others/firefox-theme': 'Viewing the Blackprint Firefox theme',
  '/others/fridge-builds-websites': 'Checking out custom websites',
  '/others/fridge-builds-websites/submit': 'Requesting a custom website',
  '/others/minecraft-archive': 'Browsing the Minecraft archive',
  '/others/toast-discord-bot': 'Viewing Toast status and radio',
  '/others/toast-discord-bot/chat': 'Chatting with Toast',
  '/others/toast-discord-bot/chat/history': 'Reviewing Toast website conversations',
  '/others/toast-discord-bot/messages': 'Managing Toast Discord messages',
  '/settings': 'Updating site settings',
  '/settings/audit-log': 'Reviewing moderation activity',
  '/settings/banned-ips': 'Managing site access bans',
  '/settings/guests': 'Managing guest activity',
  '/settings/notices': 'Managing site notices',
  '/settings/restricted-ips': 'Managing content bans',
  '/settings/sysinfo': 'Viewing system information',
  '/tools': 'Browsing tools',
  '/tools/discord-export-viewer': 'Viewing a Discord export',
  '/tools/mdpaste': 'Creating a markdown paste',
  '/tools/mdpaste/s': () => {
    if (document.querySelector('#password'))
      return 'Unlocking an encrypted paste'
    return getMdpasteTitle() || 'Reading a markdown paste'
  },
  '/tools/upload': 'Transferring files peer-to-peer',
  '/wiki': () => {
    const pageTitle = getWikiPageTitle()
    return pageTitle ? `Reading ${pageTitle}` : 'Reading the developer wiki'
  },
}

function getStatusForPath(pathname: string, search: string): string {
  const route = Object.hasOwn(pageStatuses, pathname)
    ? pathname
    : ['/feed/posts', '/journal/posts', '/chat', '/tools/mdpaste/s'].find(route => isRoute(pathname, route))
      || ['/api/', '/data/'].find(route => pathname.startsWith(route))
  if (route) {
    const status = pageStatuses[route]!
    return typeof status === 'function' ? status(pathname, new URLSearchParams(search)) : status
  }

  const heading = getDocumentHeadingText()
  if (heading)
    return `Viewing ${heading}`

  return 'Browsing fridge.dev'
}

presence.on('UpdateData', () => {
  const { pathname, search } = document.location
  const normalizedPath = normalizePath(pathname)
  // Error documents can be served internally at the original requested URL.
  const title = cleanSiteTitle(document.title).toLowerCase()
  const errorState = (title === 'page not found' || /^(?:error[ :/-]*)?404(?:\b|$)/.test(title))
    ? '404 not found'
    : (title === 'forbidden' || /^(?:error[ :/-]*)?403(?:\b|$)/.test(title))
        ? '403 forbidden'
        : (title === 'internal error' || /^(?:error[ :/-]*)?50[0-9x](?:\b|$)/.test(title)) ? 'Server error page' : ''
  const playing = !errorState && normalizedPath === '/music' && isMusicPlaying()
  presence.setActivity({
    largeImageKey: playing ? getMiniPlayerAlbumArt() || ActivityAssets.Logo : ActivityAssets.Logo,
    details: getDetailsPath(normalizedPath),
    startTimestamp: browsingTimestamp,
    state: cleanText(errorState || getStatusForPath(normalizedPath, search)).slice(0, 128),
    buttons: !errorState && canLinkPage(normalizedPath)
      ? [{ label: 'Visit page', url: `https://fridge.dev${normalizedPath}` }]
      : undefined,
  })
})
