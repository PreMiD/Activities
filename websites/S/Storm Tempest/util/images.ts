import { queryAttr } from './dom.js'

/** Returns `value` as an absolute https URL (upgrading http), or undefined when missing, invalid or the site's generic share card at `/og/`. */
export function usableImage(
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
export function getArtwork(video: HTMLVideoElement | undefined): string | undefined {
  const candidates = [
    video?.poster,
    queryAttr(['meta[property="og:image"]'], 'content'),
    queryAttr(['meta[name="twitter:image"]'], 'content'),
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
export function getReaderCover(): string | undefined {
  return usableImage(
    document
      .querySelector('[class*="aspect-[5/7]"] img, [class*="aspect-[2/3]"] img')
      ?.getAttribute('src'),
    document.location.href,
  )
}

export const coverCache = new Map<string, Promise<string | undefined>>()

/** Picks the share image from a fetched page. */
export function shareImageOf(doc: Document, href: string): string | undefined {
  return usableImage(
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    href,
  )
}

/** Picks the first photo in a fetched teacher page, such as the teacher's avatar. */
export function teacherPhotoOf(doc: Document, href: string): string | undefined {
  return usableImage(
    (
      doc.querySelector('main img[src^="https"]')
      ?? doc.querySelector('img[src^="https"]')
    )?.getAttribute('src'),
    href,
  )
}

/** Fetches `href` once, picks an image from it with `pick`, and remembers the result. */
export function fetchCover(
  href: string,
  pick: (doc: Document, href: string) => string | undefined = shareImageOf,
): Promise<string | undefined> {
  const cached = coverCache.get(href)

  if (cached) {
    return cached
  }

  const base = new URL(href, document.location.href).href
  const request = fetch(href, { credentials: 'same-origin' })
    .then(response => (response.ok ? response.text() : ''))
    .then(html =>
      pick(new DOMParser().parseFromString(html, 'text/html'), base),
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

export const teacherPhotos = new Map<string, string>()

export const teacherRequests = new Map<string, Promise<string | undefined>>()

/** Finds the teacher's photo from one seen earlier, the site's API, or the teacher's page. */
export async function fetchTeacherPhoto(teacher: { source: string, id: string }): Promise<string | undefined> {
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
export function fetchTitleCover(): Promise<string | undefined> {
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
