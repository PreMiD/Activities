import type { ReadState } from '../config/types.js'
import { ActivityType } from 'premid'
import { ActivityAssets, browsingTimestamp } from '../config/constants.js'
import { buildButtons, smallImageFor } from '../util/activity.js'
import { latinDigits, prettify, queryText, safeDecode, textOf } from '../util/dom.js'
import { getArtwork, getReaderCover } from '../util/images.js'
import { getAnimeTitle } from './watch.js'

/** Parses `/<app>/<kind>/<source>/<slug>/<chapter>` for the manga, novel and book readers. */
export function parseReadPath():
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
export function getReaderPage(): { page: number, pages: number } | undefined {
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
export function readerHeading(): { title?: string, label?: string } {
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
export function extractChapter(value: string | undefined): string | undefined {
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
export function getChapterLabel(): string | undefined {
  const { title, label } = readerHeading()

  return label && label.length <= 40 && label !== title ? label : undefined
}

/** Finds the current chapter number from the reader heading, the page title or elements. */
export function getChapter(): string | undefined {
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

/** Reads a "3 of 10" style count from `text` as a party size, or undefined when it is empty or inconsistent. */
export function parseCount(
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
export function getChapterPosition(): { partySize: number, maxPartySize: number } | undefined {
  return parseCount(textOf(document.querySelector('header span.truncate + span')))
}

/** Collects the kind, title, provider, chapter, page and cover of the current reader page. */
export function getReadState(path: { app: string, source: string, slug: string }): ReadState {
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
export function readingProgress(): number | undefined {
  const root = document.scrollingElement ?? document.documentElement
  const total = root.scrollHeight - window.innerHeight

  if (total < window.innerHeight * 0.5) {
    return undefined
  }

  return Math.min(100, Math.max(0, Math.round((root.scrollTop / total) * 100)))
}

/** Builds the presence shown while reading a manga, novel or book chapter, with its page as party size. */
export function buildReadActivity(read: ReadState, privacy: boolean): PresenceData {
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
      : buildButtons({ label: `Open ${read.kind}`, url: read.url }),
  }
}
