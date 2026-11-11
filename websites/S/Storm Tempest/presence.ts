import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1233213267053248633',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Storm%20Tempest/assets/logo.png',
  Keyboard = 'https://i.imgur.com/HuS6SkP.jpeg',
  Moon = 'https://i.imgur.com/PqT7xJ4.png',
  Js = 'https://i.imgur.com/FH6KGTc.png',
  Jsx = 'https://i.imgur.com/C340rKu.png',
  Ts = 'https://i.imgur.com/5nXesVp.png',
  Tsx = 'https://i.imgur.com/U4bfs4Y.png',
  Py = 'https://i.imgur.com/sjZjxC1.png',
  Go = 'https://i.imgur.com/zUJmvxp.png',
  Html = 'https://i.imgur.com/cvOy8al.png',
  Css = 'https://i.imgur.com/H08IIi3.png',
  Json = 'https://i.imgur.com/KhT2obK.png',
  Md = 'https://i.imgur.com/K99vbls.png',
  Yml = 'https://i.imgur.com/Py3YttK.png',
  Sh = 'https://i.imgur.com/MtwpqvA.png',
  Sql = 'https://i.imgur.com/JRYM1wW.png',
  Bat = 'https://i.imgur.com/mZEjROI.png',
  Env = 'https://i.imgur.com/fuYGTtN.png',
  Xml = 'https://i.imgur.com/XtPCwcn.png',
  Txt = 'https://i.imgur.com/3zDU6R2.png',
  Php = 'https://i.imgur.com/TYpgRem.png',
  C = 'https://i.imgur.com/CGuoF46.png',
  Cpp = 'https://i.imgur.com/CgmfJYa.png',
  Java = 'https://i.imgur.com/s0oaDfH.png',
  Rust = 'https://i.imgur.com/7imwzug.png',
  Vue = 'https://i.imgur.com/MgXTLIT.png',
  Svg = 'https://i.imgur.com/Fu9ofFI.png',
  Toml = 'https://i.imgur.com/cDzp54I.png',
  Docker = 'https://i.imgur.com/prrk2om.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

let iframePlayback: (Playback & { at: number }) | undefined

/** Stores the playback state sent by the embedded player. */
presence.on('iFrameData', (data: Playback) => {
  iframePlayback = { ...data, at: Date.now() }
})

interface WatchState {
  title: string
  source?: string
  episode?: string
  totalEpisodes?: string
  url: string
  image?: string
  video?: HTMLVideoElement
}

interface ReadState {
  kind: string
  title: string
  source: string
  chapter?: string
  chapterLabel?: string
  page?: number
  pages?: number
  progress?: number
  position?: { partySize: number, maxPartySize: number }
  url: string
  image?: string
}

interface CodestoState {
  project?: string
  file?: string
  running: boolean
  url: string
}

interface SectionState {
  details: string
  state: string
  privateDetails: string
  privateState: string
  buttonLabel: string
  url: string
  image?: string
  video?: HTMLVideoElement
  media?: boolean
  party?: { partySize: number, maxPartySize: number }
  teacher?: { source: string, id: string }
}

interface Playback {
  paused: boolean
  ended?: boolean
  currentTime: number
  duration: number
}

interface PageState {
  name: string
  url: string
  kind?: 'search' | 'profile'
  subject?: string
}

interface RoomState {
  joined: boolean
  name?: string
  title?: string
  episode?: string
  members?: number
  hosting?: boolean
  titleHref?: string
  url: string
  image?: string
  video?: HTMLVideoElement
}

interface Options {
  buttons: boolean
  cover: boolean
  time: boolean
}

/** Collapses whitespace and trims `value`, returning `undefined` for an empty result. */
function clean(value: string | null | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim()

  return normalized || undefined
}

/** Returns the cleaned text content of `element`, if any. */
function textOf(element: Element | null): string | undefined {
  return clean(element?.textContent)
}

/** Converts Arabic-Indic and Persian digits in `value` to Latin digits so numbers can be parsed in any site language. */
function latinDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[\u06F0-\u06F9]/g, digit => String(digit.charCodeAt(0) - 0x6F0))
    .replace(/\u066B/g, '.')
}

/** Returns the cleaned value of `attribute` on `element`, if any. */
function attrOf(
  element: Element | null,
  attribute: string,
): string | undefined {
  return clean(element?.getAttribute(attribute))
}

/** Returns the text of the first element matching any of `selectors`. */
function queryText(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const value = textOf(document.querySelector(selector))

    if (value) {
      return value
    }
  }

  return undefined
}

/** Returns `attribute` from the first element matching any of `selectors`. */
function queryAttr(
  selectors: string[],
  attribute: string,
): string | undefined {
  for (const selector of selectors) {
    const value = attrOf(document.querySelector(selector), attribute)

    if (value) {
      return value
    }
  }

  return undefined
}

/** Whether `element` is rendered with a non-empty box. */
function isVisible(element: Element): boolean {
  const node = element as HTMLElement
  const style = window.getComputedStyle(node)
  const rect = node.getBoundingClientRect()

  return (
    style.display !== 'none'
    && style.visibility !== 'hidden'
    && rect.width > 0
    && rect.height > 0
  )
}

/** Whether `element` sits inside a group labelled as the player's server/source/provider switcher. */
function isInServerControl(element: Element): boolean {
  const group = element.closest(
    '[role="group"], [role="radiogroup"], [role="tablist"], [role="listbox"], [role="menu"], [id*="server" i], [class*="server" i], [data-server]',
  )

  if (!group) {
    return false
  }

  const labelledBy = (group.getAttribute('aria-labelledby') ?? '')
    .split(/\s+/)
    .map(id => textOf(document.getElementById(id)) ?? '')
    .join(' ')

  const label = [
    group.getAttribute('aria-label'),
    labelledBy,
    group.id,
    group.getAttribute('class'),
    group.hasAttribute('data-server') ? 'server' : '',
  ].join(' ')

  return /server|source|provider/i.test(label)
}

/** Reads the label of the active server/source control in the player. */
function sourceFromSelectedControl(): string | undefined {
  const selectors = [
    '[aria-pressed="true"]',
    '[aria-selected="true"]',
    '[aria-checked="true"]',
    '[data-state="active"]',
    '[data-state="selected"]',
    '[data-selected="true"]',
    '.active',
    '.selected',
    '.current',
    '.chosen',
  ]

  const elements = Array.from(
    document.querySelectorAll(selectors.join(',')),
  ).filter(isVisible)

  for (const element of elements) {
    const value = textOf(element)

    if (!value || value.length > 60) {
      continue
    }

    if (
      /^(?:watch|play|next|previous|episode|episodes|server|source|provider|stream|player|dub|sub|quality|auto|default)$/i.test(
        value,
      )
    ) {
      continue
    }

    const parentText = clean(element.parentElement?.textContent) ?? ''

    if (
      isInServerControl(element)
      || /server|source|provider|stream|player/i.test(parentText)
    ) {
      return value
    }
  }

  return undefined
}

/** Decodes a URL path segment, returning it unchanged when it is malformed. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

/** Turns a slug such as "kaoru-hana-wa-rin-to-saku" into "Kaoru Hana Wa Rin To Saku". */
function prettify(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\p{L}/gu, letter => letter.toUpperCase())
    .trim()
}

/** Parses `/watch/<source>/<slug>/<episode>` from the URL path. */
function parseWatchPath():
  | { source: string, slug: string, episode?: string }
  | undefined {
  const match = document.location.pathname.match(
    /\/watch\/([^/]+)\/([^/]+)(?:\/([^/]+))?\/?$/,
  )

  if (!match?.[1] || !match[2]) {
    return undefined
  }

  return {
    source: safeDecode(match[1]),
    slug: safeDecode(match[2]),
    episode: match[3] && /^\d{1,4}$/.test(match[3]) ? match[3] : undefined,
  }
}

/** Resolves the provider from a watch URL, else the app section or a `source`/`server`/`provider` param. */
function sourceFromUrl(): string | undefined {
  const watchPath = parseWatchPath()

  if (watchPath) {
    return prettify(watchPath.source)
  }

  const sources: Record<string, string> = {
    anisto: 'Anisto',
    mangasto: 'Mangasto',
    movisto: 'Movisto',
    booksto: 'Booksto',
    novelsto: 'Novelsto',
    codesto: 'Codesto',
    tvsto: 'Tvsto',
    toolsto: 'Toolsto',
    gamesto: 'Gamesto',
    studysto: 'Studysto',
    plansto: 'Plansto',
    roomsto: 'Roomsto',
  }

  for (const part of document.location.pathname.split('/').filter(Boolean)) {
    const source = sources[part.toLowerCase()]

    if (source) {
      return source
    }
  }

  const params = new URLSearchParams(document.location.search)

  for (const key of ['source', 'server', 'provider']) {
    const value = clean(params.get(key))

    if (value) {
      return value
    }
  }

  return undefined
}

/** Extracts an episode number from text such as "S1E5", "Episode 5", "Ep 5" or "#5". */
function extractEpisode(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const text = latinDigits(value)
  const patterns = [
    /\bS\d{1,2}\s*E(\d{1,4})\b/i,
    /\bEpisode\s*(\d{1,4})\b/i,
    /\bEp\.?\s*(\d{1,4})\b/i,
    /(?:الحلقة|حلقة)\s*(\d{1,4})/,
    /(?:^|\s)#(\d{1,4})(?:\s|$)/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)

    if (match?.[1]) {
      return match[1]
    }
  }

  return undefined
}

/** Finds the current episode number from the URL, title, or page elements. */
function getEpisode(): string | undefined {
  const listed = textOf(
    document.querySelector(
      'aside[aria-labelledby="episodes-title"] [aria-current="true"] span',
    ),
  )
  const fromList = listed && latinDigits(listed)

  if (fromList && /^\d{1,4}(?:\.\d+)?$/.test(fromList)) {
    return fromList
  }

  const fromPath = parseWatchPath()?.episode

  if (fromPath) {
    return fromPath
  }

  const params = new URLSearchParams(document.location.search)
  const fromQuery = params.get('ep') ?? params.get('episode')

  if (fromQuery && /^\d{1,4}$/.test(fromQuery)) {
    return fromQuery
  }

  const candidates = [
    document.location.pathname,
    document.location.search,
    document.title,
    queryText([
      '[data-episode]',
      '[class*="episode"]',
      '[id*="episode"]',
      '[aria-label*="Episode" i]',
      '[aria-label*="الحلقة"]',
    ]),
    queryAttr(['[data-episode]'], 'data-episode'),
  ]

  for (const candidate of candidates) {
    const episode = extractEpisode(candidate)

    if (episode) {
      return episode
    }
  }

  return undefined
}

/** Removes a trailing "· storm" site suffix and "- Episode N" or "- Chapter N" from a title. */
function stripEpisode(value: string): string {
  return value
    .replace(/\s*[-|•·]\s*storm\s*$/i, '')
    .replace(
      /\s*[-|•·]\s*(?:Episode|Ep\.?|Chapter|Ch\.?|الحلقة|حلقة|الفصل|فصل)\s*[\d\u0660-\u0669]{1,5}\s*$/i,
      '',
    )
    .trim()
}

/** Finds the title of the show being watched, ignoring generic site titles. */
function getAnimeTitle(): string | undefined {
  const candidates = [
    queryAttr(
      [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ],
      'content',
    ),
    queryText([
      'main a[href*="/title/"]',
      'main h1',
      'article h1',
      '[data-anime-title]',
      '[class*="anime-title"]',
      '[class*="show-title"]',
      '[class*="series-title"]',
    ]),
    document.title,
  ]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const title = clean(stripEpisode(candidate))

    if (
      title
      && !/^(?:storm|stormd|storm tempest|anisto|mangasto|movisto|novelsto|booksto|tvsto|anime|watch anime)$/i.test(
        title,
      )
    ) {
      return title
    }
  }

  return undefined
}

/** Parses `/<app>/<kind>/<source>/<slug>/<chapter>` for the manga, novel and book readers. */
function parseReadPath():
  | { app: string, source: string, slug: string }
  | undefined {
  const match = document.location.pathname.match(
    /^\/(mangasto|novelsto|booksto)\/(?!browse|library|source|classic|search)[^/]+\/([^/]+)\/([^/]+)\/[^/]+\/?$/i,
  )

  if (!match?.[1] || !match[2] || !match[3]) {
    return undefined
  }

  return {
    app: match[1].toLowerCase(),
    source: safeDecode(match[2]),
    slug: safeDecode(match[3]),
  }
}

/** Reads the current and total page from the manga reader's counter, or from its page elements. */
function getReaderPage(): { page: number, pages: number } | undefined {
  for (const counter of Array.from(document.querySelectorAll('span[class*="fixed"]'))) {
    const match = latinDigits(textOf(counter) ?? '').match(/^(\d{1,4})\s*\/\s*(\d{1,4})$/)
    const page = Number(match?.[1])
    const pages = Number(match?.[2])

    if (page >= 1 && page <= pages) {
      return { page, pages }
    }
  }

  const elements = Array.from(document.querySelectorAll('[data-page]'))

  if (elements.length < 2) {
    return undefined
  }

  const middle = window.innerHeight / 2
  let page = 1

  for (const [index, element] of elements.entries()) {
    if (element.getBoundingClientRect().top <= middle) {
      page = index + 1
    }
  }

  return { page, pages: elements.length }
}

/** Splits the reader heading "Series · Chapter 20" into its title and chapter label. */
function readerHeading(): { title?: string, label?: string } {
  const heading = textOf(document.querySelector('h1'))

  if (!heading) {
    return {}
  }

  const index = heading.lastIndexOf(' · ')

  return index > 0
    ? { title: heading.slice(0, index), label: heading.slice(index + 3) }
    : { label: heading }
}

/** Extracts a chapter number from text such as "Chapter 20", "Ch. 20" or "الفصل 20". */
function extractChapter(value: string | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  const text = latinDigits(value)
  const match
    = text.match(/\b(?:Chapter|Ch\.?)\s*(\d{1,5}(?:\.\d+)?)\b/i)
      ?? text.match(/(?:الفصل|فصل)\s*(\d{1,5}(?:\.\d+)?)/)

  return match?.[1]
}

/** Returns a short chapter title from the reader heading, used when it has no number. */
function getChapterLabel(): string | undefined {
  const { title, label } = readerHeading()

  return label && label.length <= 40 && label !== title ? label : undefined
}

/** Finds the current chapter number from the reader heading, the page title or elements. */
function getChapter(): string | undefined {
  const candidates = [
    readerHeading().label,
    document.title,
    queryText([
      '[data-chapter]',
      '[class*="chapter"]',
      '[id*="chapter"]',
      '[aria-label*="Chapter" i]',
    ]),
  ]

  for (const candidate of candidates) {
    const chapter = extractChapter(candidate)

    if (chapter) {
      return chapter
    }
  }

  return undefined
}

/** Returns the first loaded, unfinished `<video>` element on the page. */
function getVideo(): HTMLVideoElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLVideoElement>('video'),
  ).find(video => !video.ended && video.readyState > 0)
}

/** Whether `video` is in the viewport and big enough to be the main player rather than a preview. */
function isMainPlayer(video: HTMLVideoElement): boolean {
  const rect = video.getBoundingClientRect()

  return (
    isVisible(video)
    && rect.bottom > 0
    && rect.top < window.innerHeight
    && rect.right > 0
    && rect.left < window.innerWidth
    && rect.width >= 200
    && rect.width >= window.innerWidth * 0.5
  )
}

/** Whether the current page is a watch/episode page or shows a main player. */
function isWatchPage(): boolean {
  const url
    = `${document.location.pathname}${document.location.search}`.toLowerCase()

  if (
    /\/watch\b/.test(url)
    || /\/episode\b/.test(url)
    || /\/play\b/.test(url)
    || /[?&](?:episode|ep)=/i.test(url)
  ) {
    return true
  }

  const video = getVideo()

  return Boolean(video && isMainPlayer(video))
}

/** Returns `value` as an absolute https URL (upgrading http), or undefined when missing, invalid or the site's generic share card at `/og/`. */
function usableImage(
  value: string | null | undefined,
  base: string,
): string | undefined {
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value, base)

    if (url.protocol === 'http:') {
      url.protocol = 'https:'
    }

    return url.protocol === 'https:' && !/^\/og(?:\/|$)/.test(url.pathname)
      ? url.href
      : undefined
  }
  catch {
    return undefined
  }
}

/** Finds the episode or show artwork as an absolute https URL, ignoring the generic share card. */
function getArtwork(video: HTMLVideoElement | undefined): string | undefined {
  const candidates = [
    video?.poster,
    queryAttr(
      [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ],
      'content',
    ),
    queryAttr(['link[rel="image_src"]'], 'href'),
  ]

  for (const candidate of candidates) {
    const image = usableImage(candidate, document.location.href)

    if (image) {
      return image
    }
  }

  return undefined
}

/** Finds the series cover shown in the manga reader's top bar. */
function getReaderCover(): string | undefined {
  return usableImage(
    document
      .querySelector('[class*="aspect-[5/7]"] img, [class*="aspect-[2/3]"] img')
      ?.getAttribute('src'),
    document.location.href,
  )
}

const coverCache = new Map<string, Promise<string | undefined>>()

/** Picks the share image from a fetched page. */
function shareImageOf(doc: Document, href: string): string | undefined {
  return usableImage(
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    href,
  )
}

/** Picks the first photo in a fetched teacher page, such as the teacher's avatar. */
function teacherPhotoOf(doc: Document, href: string): string | undefined {
  return usableImage(
    (
      doc.querySelector('main img[src^="https"]')
      ?? doc.querySelector('img[src^="https"]')
    )?.getAttribute('src'),
    href,
  )
}

/** Fetches `href` once, picks an image from it with `pick`, and remembers the result. */
function fetchCover(
  href: string,
  pick: (doc: Document, href: string) => string | undefined = shareImageOf,
): Promise<string | undefined> {
  const cached = coverCache.get(href)

  if (cached) {
    return cached
  }

  const request = fetch(href, { credentials: 'same-origin' })
    .then(response => (response.ok ? response.text() : ''))
    .then(html =>
      pick(new DOMParser().parseFromString(html, 'text/html'), href),
    )
    .catch(() => undefined)
    .then((image) => {
      if (!image) {
        setTimeout(() => coverCache.delete(href), 30_000)
      }

      return image
    })

  coverCache.set(href, request)

  return request
}

const teacherPhotos = new Map<string, string>()
const teacherRequests = new Map<string, Promise<string | undefined>>()

/** Finds the teacher's photo from one seen earlier, the site's API, or the teacher's page. */
async function fetchTeacherPhoto(teacher: { source: string, id: string }): Promise<string | undefined> {
  const known = teacherPhotos.get(teacher.id)

  if (known) {
    return known
  }

  let request = teacherRequests.get(teacher.id)

  if (!request) {
    request = fetch(`/v1/studysto/sources/${teacher.source}/titles/${teacher.id}`)
      .then(response => (response.ok ? response.json() : undefined))
      .then(data =>
        usableImage((data as { cover?: string } | undefined)?.cover, document.location.href),
      )
      .catch(() => undefined)
      .then(
        photo =>
          photo
          ?? fetchCover(
            `/studysto/t/${teacher.id}?source=${teacher.source}`,
            teacherPhotoOf,
          ),
      )
      .then((photo) => {
        if (photo) {
          teacherPhotos.set(teacher.id, photo)
        }
        else {
          setTimeout(() => teacherRequests.delete(teacher.id), 30_000)
        }

        return photo
      })

    teacherRequests.set(teacher.id, request)
  }

  return request
}

/** Finds the cover of the title behind the current watch or reader page from its title page. */
function fetchTitleCover(): Promise<string | undefined> {
  const path = document.location.pathname
  const content = path.match(
    /^\/(anisto|movisto|novelsto|booksto)\/(?:watch|read)\/([^/]+)\/([^/]+)/i,
  )
  const manga = path.match(/^\/mangasto\/series\/([^/]+)\/([^/]+)\/[^/]+/i)
  const href = content
    ? `/${content[1]}/title/${content[2]}/${content[3]}`
    : manga ? `/mangasto/series/${manga[1]}/${manga[2]}` : undefined

  return href ? fetchCover(href) : Promise.resolve(undefined)
}

/** Finds the total number of episodes from the page description or text, such as "13 episodes". */
function getTotalEpisodes(): string | undefined {
  const listed = document.querySelectorAll(
    'aside[aria-labelledby="episodes-title"] ol li',
  ).length

  if (listed > 0) {
    return String(listed)
  }

  const candidates = [
    queryAttr(
      [
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]',
      ],
      'content',
    ),
    queryText(['[data-episodes]', '[class*="episodes" i]']),
  ]

  for (const candidate of candidates) {
    const match = candidate && latinDigits(candidate).match(/(\d{1,4})\s*(?:episodes|eps\b|حلقات|حلقة)/i)

    if (match?.[1]) {
      return match[1]
    }
  }

  return undefined
}

/** Collects the title, source, episode, artwork and video of the current watch page. */
function getWatchState(): WatchState {
  const video = getVideo()
  const slug = parseWatchPath()?.slug
  const episode = getEpisode()
  const totalEpisodes = getTotalEpisodes()

  return {
    title: getAnimeTitle() ?? (slug ? prettify(slug) : 'Unknown Anime'),
    source: sourceFromUrl() ?? sourceFromSelectedControl(),
    episode,
    totalEpisodes:
      episode && totalEpisodes && Number(totalEpisodes) >= Number(episode)
        ? totalEpisodes
        : undefined,
    url: document.location.href,
    image: getArtwork(video),
    video,
  }
}

const codestoIcons: Record<string, ActivityAssets> = {
  js: ActivityAssets.Js,
  mjs: ActivityAssets.Js,
  cjs: ActivityAssets.Js,
  jsx: ActivityAssets.Jsx,
  ts: ActivityAssets.Ts,
  tsx: ActivityAssets.Tsx,
  py: ActivityAssets.Py,
  go: ActivityAssets.Go,
  html: ActivityAssets.Html,
  htm: ActivityAssets.Html,
  css: ActivityAssets.Css,
  json: ActivityAssets.Json,
  md: ActivityAssets.Md,
  mdx: ActivityAssets.Md,
  yml: ActivityAssets.Yml,
  yaml: ActivityAssets.Yml,
  sh: ActivityAssets.Sh,
  bash: ActivityAssets.Sh,
  zsh: ActivityAssets.Sh,
  sql: ActivityAssets.Sql,
  db: ActivityAssets.Sql,
  sqlite: ActivityAssets.Sql,
  bat: ActivityAssets.Bat,
  cmd: ActivityAssets.Bat,
  env: ActivityAssets.Env,
  xml: ActivityAssets.Xml,
  txt: ActivityAssets.Txt,
  php: ActivityAssets.Php,
  c: ActivityAssets.C,
  h: ActivityAssets.C,
  cpp: ActivityAssets.Cpp,
  cc: ActivityAssets.Cpp,
  cxx: ActivityAssets.Cpp,
  hpp: ActivityAssets.Cpp,
  java: ActivityAssets.Java,
  rs: ActivityAssets.Rust,
  vue: ActivityAssets.Vue,
  svg: ActivityAssets.Svg,
  toml: ActivityAssets.Toml,
  dockerfile: ActivityAssets.Docker,
}

/** Returns the language icon for a file name, if it has one. */
function codestoIcon(file: string | undefined): ActivityAssets | undefined {
  return codestoIcons[file?.split('.').pop()?.toLowerCase() ?? '']
}

/** Whether the current page is a Codesto project editor at `/codesto/p/<id>`. */
function isCodestoWorkspace(): boolean {
  return /^\/codesto\/p\/[^/]+/i.test(document.location.pathname)
}

/** Removes a language badge such as "TS" or "JS" glued to the front of a file name. */
function stripBadge(name: string): string {
  const extension = name.split('.').pop()?.toUpperCase() ?? ''
  const aliases: Record<string, string[]> = {
    MJS: ['JS'],
    CJS: ['JS'],
    JSX: ['JS'],
    TSX: ['TS'],
    YML: ['YAML'],
    YAML: ['YML'],
  }

  for (const badge of [extension, ...(aliases[extension] ?? [])]) {
    const rest = name.slice(badge.length)

    if (name.startsWith(badge) && /^[a-z_@-]/.test(rest)) {
      return rest
    }
  }

  return name
}

/** Finds a file name inside `element`, preferring a child that holds only the name. */
function fileNameIn(element: Element): string | undefined {
  const pattern = /[\w@+.-]+\.[a-z][a-z0-9]{0,7}/i

  for (const child of Array.from(element.querySelectorAll('*'))) {
    const text = textOf(child)

    if (text && child.children.length === 0 && text.match(pattern)?.[0] === text) {
      return text
    }
  }

  const match = textOf(element)?.match(pattern)?.[0]

  return match ? stripBadge(match) : undefined
}

/** Finds the file name of the active editor tab. */
function getCodestoFile(): string | undefined {
  const fileName = /[\w@+.-]+\.[a-z][a-z0-9]{0,7}/i
  const tabPath = document
    .querySelector('[role="tab"][aria-selected="true"]')
    ?.getAttribute('title')
  const tabName = tabPath?.split('/').pop()

  if (tabName && /\.[a-z][a-z0-9]{0,7}$/i.test(tabName)) {
    return tabName
  }

  const tabElement = document.querySelector(
    '#wsTabs [aria-selected="true"], #wsTabs .active, #wsTabs [class*="active"], [role="tab"][aria-selected="true"]',
  )
  const fromTab = tabElement ? fileNameIn(tabElement) : undefined

  if (fromTab) {
    return fromTab
  }

  const active = document.querySelectorAll(
    '[aria-selected="true"], [data-active="true"], [data-state="active"], [class*="active" i], [class*="selected" i], [class*="current" i]',
  )

  for (const element of Array.from(active)) {
    const text = textOf(element)

    if (!text || text.length > 60 || !isVisible(element)) {
      continue
    }

    const match = fileName.test(text) ? fileNameIn(element) : undefined

    if (match) {
      return match
    }
  }

  return undefined
}

/** Collects the project, active file and run state of the workspace. */
function getCodestoState(): CodestoState {
  const title = clean(document.title)
    ?.replace(/\s*[—·-]\s*storm\s*$/i, '')
    .replace(/\s*[—·-]\s*codesto\s*$/i, '')

  return {
    project:
      textOf(document.querySelector('#wsName'))
      ?? queryText([
        '[data-project-name]',
        '[class*="project-name" i]',
        '[class*="projectName" i]',
      ])
      ?? (title && !/^(?:codesto|editor)$/i.test(title) ? title : undefined),
    file: getCodestoFile(),
    running:
      Boolean(document.querySelector('.cs-run-btn[aria-label="Stop"]'))
      || Array.from(document.querySelectorAll('button')).some(
        button =>
          /^(?:stop|running)\b/i.test(textOf(button) ?? '')
          && isVisible(button),
      ),
    url: document.location.href,
  }
}

/** Returns the page heading when it is short enough to be a name, else `fallback`. */
function headingOr(fallback: string): string {
  const heading = textOf(document.querySelector('main h1'))

  return heading && heading.length <= 60 ? heading : fallback
}

const studySubjects = [
  'Math',
  'Physics',
  'Chemistry',
  'Biology',
  'Arabic',
  'English',
  'Islamic studies',
]

/** Finds the subject name shown on a Studysto teacher or lecture page. */
function findSubject(): string | undefined {
  const nodes = Array.from(
    document.querySelectorAll('main span, main a, main p, main h2, main li'),
  ).slice(0, 400)

  for (const node of nodes) {
    const text = textOf(node)?.toLowerCase()
    const subject = studySubjects.find(name => name.toLowerCase() === text)

    if (subject) {
      return subject
    }
  }

  return undefined
}

/** Finds the teacher's display name from a link to their page, falling back to the URL slug. */
function findTeacher(slug: string): string {
  const link = Array.from(document.querySelectorAll('a[href]')).find((anchor) => {
    const href = safeDecode(anchor.getAttribute('href') ?? '')
    const text = textOf(anchor)

    return (
      href.startsWith(`/studysto/t/${slug}`)
      && Boolean(text)
      && (text?.length ?? 0) <= 40
      && !/back|رجوع|عودة/i.test(text ?? '')
    )
  })

  return textOf(link ?? null) ?? slug
}

/** Finds the first large https image in the main content, such as a teacher photo. */
function findMainImage(): string | undefined {
  return Array.from(document.querySelectorAll<HTMLImageElement>('main img')).find(
    image =>
      image.src.startsWith('https:')
      && image.getBoundingClientRect().width >= 40,
  )?.src
}

const toolNames: Record<string, string> = {
  'compress-image': 'Compress image',
  'resize-image': 'Resize image',
  'convert-image': 'Convert image',
  'merge-pdf': 'Merge PDFs',
  'split-pdf': 'Split PDF',
  'images-to-pdf': 'Images to PDF',
  'word-counter': 'Word counter',
  'case-converter': 'Case converter',
  'compare-text': 'Compare text',
  'arabic-keyboard': 'Arabic keyboard',
  'json': 'JSON formatter',
  'base64': 'Base64',
  'jwt': 'JWT decoder',
  'regex': 'Regex tester',
  'uuid': 'UUID generator',
  'color': 'Color picker',
  'canvas': 'Canvas editor',
}

const gameNames: Record<string, string> = {
  'snake': 'Snake',
  '2048': '2048',
  'memory': 'Memory',
  'tic-tac-toe': 'Tic-Tac-Toe',
}

/** Describes what the user is doing in a Toolsto tool, a Gamesto game or on a Studysto teacher or lecture page. */
function getSectionState(): SectionState | undefined {
  const segments = document.location.pathname.split('/').filter(Boolean)
  const [app, second, third, fourth, fifth] = segments.map(segment =>
    safeDecode(segment),
  )
  const url = document.location.href

  if (app === 'toolsto' && second && third) {
    const categories: Record<string, string> = {
      images: 'Images',
      pdf: 'PDF',
      text: 'Text',
      developer: 'Developer',
    }

    return {
      details: `Using ${toolNames[third.toLowerCase()] ?? headingOr(prettify(third))}`,
      state: `Toolsto • ${categories[second] ?? prettify(second)}`,
      privateDetails: 'Using a tool',
      privateState: 'Toolsto',
      buttonLabel: 'Open Tool',
      url,
    }
  }

  if (
    app === 'gamesto'
    && second
    && !/^(?:browse|library|leaderboard|scores|settings)$/i.test(second)
  ) {
    return {
      details: `Playing ${gameNames[second.toLowerCase()] ?? headingOr(prettify(second))}`,
      state: 'Gamesto',
      privateDetails: 'Playing a game',
      privateState: 'Gamesto',
      buttonLabel: 'Open Game',
      url,
    }
  }

  if (app === 'studysto' && second === 'watch' && fifth) {
    const [, , rawSource = '', rawTeacher = ''] = document.location.pathname
      .split('/')
      .filter(Boolean)
    const video = getVideo()
    const [teacher, subject] = (
      textOf(document.querySelector('main a[href*="/studysto/t/"]')) ?? ''
    ).split(' · ')
    const detail = textOf(document.querySelector('main h1 ~ p'))
    const party = parseCount(textOf(document.querySelector('main aside h2 + span')))

    return {
      details: `Watching ${headingOr('a lecture')}`,
      state: [detail, teacher, subject].filter(Boolean).join(' • ') || 'Studysto',
      privateDetails: 'Watching a lecture',
      privateState: 'Studysto',
      buttonLabel: 'Open Lecture',
      url,
      video,
      media: true,
      party,
      teacher: { source: rawSource, id: rawTeacher },
    }
  }

  if (app === 'studysto' && second === 't' && third) {
    const subject = findSubject()
    const image = getArtwork(undefined) ?? findMainImage()

    if (image && segments[2]) {
      teacherPhotos.set(segments[2], image)
    }

    return {
      details: `Studying with ${headingOr(findTeacher(third))}`,
      state: subject ? `${subject} • Studysto` : 'Studysto',
      privateDetails: 'Studying',
      privateState: 'Studysto',
      buttonLabel: 'Open Teacher',
      url,
      image,
    }
  }

  const titleKinds: Record<string, string> = {
    anisto: 'Anime',
    movisto: 'Movie',
    novelsto: 'Novel',
    booksto: 'Book',
    mangasto: 'Manga',
  }
  const kind = app ? titleKinds[app] : undefined
  const isTitlePage
    = (second === 'title' && Boolean(fourth) && !fifth)
      || (app === 'mangasto' && second === 'series' && Boolean(fourth) && !fifth)

  if (kind && third && isTitlePage) {
    return {
      details: `Viewing ${getAnimeTitle() ?? prettify(fourth ?? '')}`,
      state: `${kind} • ${prettify(third)}`,
      privateDetails: `Viewing a ${kind.toLowerCase()}`,
      privateState: kind,
      buttonLabel: 'Open Series',
      url,
      image: getArtwork(undefined),
    }
  }

  return undefined
}

/** Returns a display name for the current browsing page. */
function getPageName(): string {
  const pathname = document.location.pathname
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return 'Home'
  }

  const firstSegment = segments[0]

  if (!firstSegment) {
    return 'Home'
  }

  const pageNames: Record<string, string> = {
    anisto: 'Anime',
    mangasto: 'Manga',
    movisto: 'Movies',
    novelsto: 'Novels',
    booksto: 'Books',
    tvsto: 'Live TV',
    gamesto: 'Games',
    codesto: 'Code Tools',
    toolsto: 'Tools',
    studysto: 'Study',
    plansto: 'Plans',
    roomsto: 'Rooms',
    r: 'Rooms',
  }

  const subPages: Record<string, Record<string, string>> = {
    studysto: { library: 'My teachers', desk: 'My study' },
    tvsto: { favorites: 'Favorites' },
    plansto: {
      tasks: 'Tasks',
      calendar: 'Calendar',
      study: 'Study',
      settings: 'Settings',
      day: 'Day',
    },
    codesto: { new: 'Templates', plans: 'Plans', usage: 'Usage' },
    toolsto: {
      images: 'Images',
      pdf: 'PDF',
      text: 'Text',
      developer: 'Developer',
    },
  }

  const pageName = pageNames[firstSegment.toLowerCase()]
  const subPage = segments[1]
    ? subPages[firstSegment.toLowerCase()]?.[segments[1].toLowerCase()]
    : undefined

  if (pageName) {
    return subPage ? `${pageName} • ${subPage}` : pageName
  }

  const title = clean(document.title)

  if (
    title
    && !/^(?:storm|stormd|storm tempest)$/i.test(title)
  ) {
    return stripEpisode(title)
  }

  return 'Storm Tempest'
}

/** Reads a "3 of 10" style count from `text` as a party size, or undefined when it is empty or inconsistent. */
function parseCount(
  text: string | undefined,
): { partySize: number, maxPartySize: number } | undefined {
  const match = latinDigits(text ?? '').match(/^(\d+)\D+(\d+)$/)
  const partySize = Number(match?.[1])
  const maxPartySize = Number(match?.[2])

  return partySize >= 1 && partySize <= maxPartySize
    ? { partySize, maxPartySize }
    : undefined
}

/** Reads the chapter's position among all chapters from the novel and book reader's top bar. */
function getChapterPosition(): { partySize: number, maxPartySize: number } | undefined {
  return parseCount(textOf(document.querySelector('header span.truncate + span')))
}

/** Collects the kind, title, provider, chapter, page and cover of the current reader page. */
function getReadState(path: { app: string, source: string, slug: string }): ReadState {
  const kinds: Record<string, string> = {
    mangasto: 'Manga',
    novelsto: 'Novel',
    booksto: 'Book',
  }
  const kind = kinds[path.app] ?? 'Manga'
  const reader = kind === 'Manga' ? getReaderPage() : undefined

  return {
    kind,
    title: readerHeading().title ?? getAnimeTitle() ?? prettify(path.slug),
    source: prettify(path.source),
    chapter: getChapter(),
    chapterLabel: getChapterLabel(),
    page: reader?.page,
    pages: reader?.pages,
    progress: reader ? undefined : readingProgress(),
    position: kind === 'Manga' ? undefined : getChapterPosition(),
    url: document.location.href,
    image: getReaderCover() ?? getArtwork(undefined),
  }
}

/** Returns how far down the page the reader has scrolled as a percentage, or undefined for short pages. */
function readingProgress(): number | undefined {
  const root = document.scrollingElement ?? document.documentElement
  const total = root.scrollHeight - window.innerHeight

  if (total < window.innerHeight * 0.5) {
    return undefined
  }

  return Math.min(100, Math.max(0, Math.round((root.scrollTop / total) * 100)))
}

/** Collects the name and URL of the current browsing page, noting a search query or a profile. */
function getPageState(): PageState {
  const url = document.location.href
  const [first, second] = document.location.pathname.split('/').filter(Boolean)

  if (first?.toLowerCase() === 'u' && second) {
    return {
      name: 'Profile',
      url,
      kind: 'profile',
      subject: safeDecode(second),
    }
  }

  const params = new URLSearchParams(document.location.search)
  const query = clean(
    ['q', 'query', 'search'].map(key => params.get(key)).find(Boolean),
  )

  return query
    ? { name: getPageName(), url, kind: 'search', subject: query }
    : { name: getPageName(), url }
}

/** Whether the current page is a watch-together room at `/r/<code>`. */
function isRoomPage(): boolean {
  return /^\/r\/[a-z0-9]{8}\/?$/i.test(document.location.pathname)
}

/** Reads the room name, show, episode, member count and player from the join card or the live room. */
function getRoomState(): RoomState | undefined {
  const url = document.location.href
  const card = document.querySelector('section[aria-labelledby="join-title"]')

  if (card) {
    const parts = (
      textOf(card.querySelector('#join-title')?.nextElementSibling ?? null) ?? ''
    ).split(' · ')
    const count = Array.from(card.querySelectorAll('span'))
      .map(span => latinDigits(span.textContent?.trim() ?? '').match(/^(\d+)\D+\d+(?::\d{2}){1,2}$/))
      .find(Boolean)

    return {
      joined: false,
      name: textOf(card.querySelector('#join-title')),
      title: clean(parts[0]),
      episode: parts.length > 2 ? clean(parts[1]) : undefined,
      members: count?.[1] ? Number(count[1]) : undefined,
      url,
      image: usableImage(
        card.querySelector('img')?.getAttribute('src'),
        url,
      ),
    }
  }

  const heading = document.querySelector('main h1')

  if (!heading) {
    return undefined
  }

  const segments = (textOf(heading.nextElementSibling) ?? '').split(' · ')
  const crowd = latinDigits(segments[segments.length - 2] ?? '').match(/\d+/)
  const link = document.querySelector<HTMLAnchorElement>('a[href*="/title/"]')
  const video = getVideo()
  const buttons = heading.parentElement?.parentElement?.querySelectorAll('button')

  return {
    joined: true,
    hosting: (buttons?.length ?? 0) >= 3,
    name: textOf(heading),
    title: clean(link?.firstChild?.textContent),
    episode: clean(
      textOf(document.querySelector('h2[dir="auto"]'))?.split(' · ')[0],
    ),
    members: crowd ? Number(crowd[0]) : undefined,
    titleHref: link?.getAttribute('href') ?? undefined,
    url,
    image: getArtwork(video),
    video,
  }
}

/** Joins the distinct, non-empty parts of a status line, skipping names that repeat the show's title. */
function distinctParts(title: string | undefined, parts: (string | undefined)[]): string {
  const seen = new Set<string>(title ? [title.toLowerCase()] : [])

  return parts
    .filter((part): part is string => Boolean(part))
    .filter((part) => {
      const key = part.toLowerCase()

      return seen.has(key) ? false : Boolean(seen.add(key))
    })
    .join(' • ')
}

/** Builds the presence shown on a watch-together room, with the member count as the party and the room's playback. */
function buildRoomActivity(room: RoomState, privacy: boolean): PresenceData {
  const playback = room.joined ? getPlayback(room.video) : undefined
  const party = room.members
    ? { partySize: room.members, maxPartySize: 50 }
    : undefined
  const state = privacy
    ? room.hosting ? 'Hosting • Roomsto' : 'Roomsto'
    : [
        distinctParts(room.title, [room.episode, room.name]),
        room.hosting ? 'Hosting' : undefined,
        'Roomsto',
      ].filter(Boolean).join(' • ')

  return {
    type: ActivityType.Playing,
    details: privacy
      ? room.joined ? 'In a watch party' : 'Joining a watch party'
      : room.joined
        ? room.title ?? room.name ?? 'Watch party'
        : `Joining ${room.title ?? room.name ?? 'a watch party'}`,
    state,
    largeImageKey: privacy
      ? ActivityAssets.Logo
      : room.image ?? ActivityAssets.Logo,
    ...smallImageFor(playback, !privacy && Boolean(room.image)),
    ...(party && { party }),
    startTimestamp: browsingTimestamp,
    buttons: privacy
      ? buildButtons()
      : buildButtons({ label: 'Join Room', url: room.url }),
    ...getPlaybackTimestamps(playback),
  }
}

/** Returns the page video's playback, or the embedded player's if it reported in the last 5 seconds. */
function getPlayback(video: HTMLVideoElement | undefined): Playback | undefined {
  if (video) {
    return video
  }

  if (iframePlayback && Date.now() - iframePlayback.at < 5000) {
    return iframePlayback
  }

  return undefined
}

/** Builds start/end timestamps from `playback`, or none while it is paused or unknown. */
function getPlaybackTimestamps(
  playback: Playback | undefined,
): {
  startTimestamp?: number
  endTimestamp?: number
} {
  if (
    !playback
    || playback.paused
    || playback.ended
    || !Number.isFinite(playback.duration)
    || playback.duration <= 0
    || !Number.isFinite(playback.currentTime)
  ) {
    return {}
  }

  const [startTimestamp, endTimestamp] = getTimestamps(
    Math.floor(playback.currentTime),
    Math.floor(playback.duration),
  )

  return {
    startTimestamp,
    endTimestamp,
  }
}

/** Builds the home-page button and, when given, a second button to the current item. */
function buildButtons(item?: ButtonData): [ButtonData, ButtonData?] {
  const home = {
    label: 'Storm Tempest',
    url: `${document.location.origin}/`,
  }

  return item ? [home, item] : [home]
}

/** Picks a play or pause icon while playback is known, else the site logo when artwork fills the large image. */
function smallImageFor(
  playback: Playback | undefined,
  hasArtwork: boolean,
): { smallImageKey?: string, smallImageText?: string } {
  if (playback) {
    return playback.paused
      ? { smallImageKey: Assets.Pause, smallImageText: 'Paused' }
      : { smallImageKey: Assets.Play, smallImageText: 'Playing' }
  }

  return hasArtwork
    ? { smallImageKey: ActivityAssets.Logo, smallImageText: 'Storm Tempest' }
    : {}
}

/** Builds the presence shown while watching an episode, a movie or a live channel. */
function buildWatchActivity(watch: WatchState, privacy: boolean): PresenceData {
  const playback = getPlayback(watch.video)
  const path = document.location.pathname
  const live = path.startsWith('/tvsto/')
  const kind = live
    ? 'live TV'
    : path.startsWith('/movisto/') ? 'a movie' : 'an anime'
  const source = watch.source ?? 'Unknown Source'
  const episode = watch.episode
    ? watch.totalEpisodes
      ? `Episode ${watch.episode} of ${watch.totalEpisodes}`
      : `Episode ${watch.episode}`
    : undefined
  const info = live
    ? `Live TV • ${source}`
    : episode ? `${episode} • ${source}` : source

  return {
    type: ActivityType.Watching,
    details: privacy ? `Watching ${kind}` : watch.title,
    state: privacy ? undefined : info,
    largeImageKey: privacy
      ? ActivityAssets.Logo
      : watch.image ?? ActivityAssets.Logo,
    ...smallImageFor(playback, !privacy && Boolean(watch.image)),
    buttons: privacy
      ? buildButtons()
      : buildButtons({
          label: live ? 'Open Channel' : 'Open Series',
          url: watch.url,
        }),
    ...(live && !playback?.paused && { startTimestamp: browsingTimestamp }),
    ...getPlaybackTimestamps(playback),
  }
}

/** Builds the presence shown while reading a manga, novel or book chapter, with its page as party size. */
function buildReadActivity(read: ReadState, privacy: boolean): PresenceData {
  return {
    type: ActivityType.Playing,
    details: privacy
      ? `Reading a ${read.kind.toLowerCase()}`
      : `Reading ${read.title}`,
    state: privacy
      ? read.kind
      : [
          read.kind,
          read.chapter ? `Chapter ${read.chapter}` : read.chapterLabel,
          read.progress === undefined ? undefined : `${read.progress}%`,
          read.source,
        ].filter(Boolean).join(' • '),
    largeImageKey: privacy
      ? ActivityAssets.Logo
      : read.image ?? ActivityAssets.Logo,
    ...smallImageFor(undefined, !privacy && Boolean(read.image)),
    ...(read.page && read.pages
      ? { party: { partySize: read.page, maxPartySize: read.pages } }
      : read.position && { party: read.position }),
    startTimestamp: browsingTimestamp,
    buttons: privacy
      ? buildButtons()
      : buildButtons({ label: 'Open Series', url: read.url }),
  }
}

/** Builds the presence shown while working in a Codesto project, like an editor. */
function buildCodestoActivity(code: CodestoState, privacy: boolean): PresenceData {
  const icon = codestoIcon(code.file)
  const idle = !code.file && !code.running

  return {
    type: ActivityType.Playing,
    details: code.running
      ? privacy || !code.project ? 'Running a project' : `Running ${code.project}`
      : idle
        ? 'Idling'
        : `Editing ${privacy ? 'a file' : code.file ?? 'a file'}`,
    state: privacy || !code.project ? 'Codesto' : `Workspace: ${code.project}`,
    largeImageKey: idle ? ActivityAssets.Keyboard : icon ?? ActivityAssets.Logo,
    ...(idle
      ? { smallImageKey: ActivityAssets.Moon, smallImageText: 'Idling' }
      : smallImageFor(undefined, Boolean(icon))),
    startTimestamp: browsingTimestamp,
    buttons: buildButtons(),
  }
}

/** Builds the presence shown while using a tool or game, or studying with a teacher. */
function buildSectionActivity(section: SectionState, privacy: boolean): PresenceData {
  const playback = section.media ? getPlayback(section.video) : undefined

  return {
    type: ActivityType.Playing,
    details: privacy ? section.privateDetails : section.details,
    state: privacy ? section.privateState : section.state,
    largeImageKey: privacy
      ? ActivityAssets.Logo
      : section.image ?? ActivityAssets.Logo,
    ...smallImageFor(playback, !privacy && Boolean(section.image)),
    ...(!privacy && section.party && { party: section.party }),
    startTimestamp: browsingTimestamp,
    buttons: privacy
      ? buildButtons()
      : buildButtons({ label: section.buttonLabel, url: section.url }),
    ...getPlaybackTimestamps(playback),
  }
}

/** Builds the presence shown while browsing, keeping the elapsed time fixed. */
function buildPageActivity(page: PageState, privacy: boolean): PresenceData {
  const details = page.kind === 'profile'
    ? 'Viewing a profile'
    : page.kind === 'search'
      ? privacy ? 'Searching Storm Tempest' : `Searching ${page.name}`
      : privacy ? 'Browsing Storm Tempest' : `Browsing ${page.name}`
  const state = privacy || !page.subject
    ? 'Storm Tempest'
    : page.kind === 'profile' ? `@${page.subject}` : `"${page.subject}"`

  return {
    type: ActivityType.Watching,
    details,
    state,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    buttons: page.kind === 'profile' && !privacy
      ? buildButtons({ label: 'View Profile', url: page.url })
      : buildButtons(),
  }
}

/** Whether `key` is one of this presence's own icons rather than a title cover or teacher photo. */
function isOwnAsset(key: unknown): boolean {
  return Object.values(ActivityAssets).includes(key as ActivityAssets)
}

/** Reads a boolean setting, using `fallback` when it is missing. */
async function readSetting(id: string, fallback: boolean): Promise<boolean> {
  return presence.getSetting<boolean>(id).catch(() => fallback)
}

/** Drops the buttons, cover or timestamps from `data` according to the user's settings. */
function applyOptions(data: PresenceData, options: Options): PresenceData {
  const result = { ...data }

  if (!options.buttons) {
    delete result.buttons
  }

  if (!options.cover && result.largeImageKey && !isOwnAsset(result.largeImageKey)) {
    result.largeImageKey = ActivityAssets.Logo
  }

  if (!options.time) {
    delete result.startTimestamp
    delete result.endTimestamp
  }

  return result
}

/** Updates the presence with coding, reading, watching, tool, game or browsing activity on every refresh. */
presence.on('UpdateData', async () => {
  const privacy = await readSetting('privacy', false)
  const options: Options = {
    buttons: await readSetting('showButtons', true),
    cover: await readSetting('showCover', true),
    time: await readSetting('showTime', true),
  }
  const show = (data: PresenceData): void => {
    presence.setActivity(applyOptions(data, options))
  }

  if (isCodestoWorkspace()) {
    show(buildCodestoActivity(getCodestoState(), privacy))

    return
  }

  if (isRoomPage()) {
    const room = getRoomState()

    if (room) {
      if (!room.image && room.titleHref) {
        room.image = await fetchCover(room.titleHref)
      }

      show(buildRoomActivity(room, privacy))

      return
    }
  }

  const readPath = parseReadPath()

  if (readPath) {
    const read = getReadState(readPath)

    read.image ??= await fetchTitleCover()

    show(buildReadActivity(read, privacy))

    return
  }

  const section = getSectionState()

  if (section) {
    if (section.teacher) {
      section.image = await fetchTeacherPhoto(section.teacher)
    }

    show(buildSectionActivity(section, privacy))

    return
  }

  if (isWatchPage()) {
    const watch = getWatchState()

    watch.image ??= await fetchTitleCover()

    show(buildWatchActivity(watch, privacy))

    return
  }

  show(buildPageActivity(getPageState(), privacy))
})
