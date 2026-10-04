export const playerSelector = '#seriePlayer, #main-player iframe'

export interface PageInfo {
  valid: boolean
  title: string
  kind: 'film' | 'series' | 'browse'
  season: string
  episode: string
  language: string
  cover: string
  url: string
  section: string
  key: string
}

export function readPage(doc: Document): PageInfo {
  const url = new URL(doc.location.href)
  const data = doc.querySelector<HTMLElement>('#serie-data, #film-data')
  const config = doc.querySelector<HTMLElement>('#serie-config')
  const heading = doc.querySelector('#s-title')?.cloneNode(true) as HTMLElement | undefined
  heading?.querySelectorAll('.tag, .release_date').forEach(node => node.remove())
  const rawTitle = (data?.dataset.title || heading?.textContent || '').replace(/\s+/g, ' ').trim()
  const series = Boolean(doc.querySelector('#serie-data, #serie-config, #seriePlayer'))
  const season = series ? rawTitle.match(/\s*(?:[-–:]\s*)?Saison\s+(\d+)\s*$/i)?.[1] || '' : ''
  const title = season ? rawTitle.replace(/\s*(?:[-–:]\s*)?Saison\s+\d+\s*$/i, '').trim() : rawTitle
  const selected = doc.querySelector<HTMLElement>('.episode-row.active')?.dataset.ep?.match(/^(vf|vostfr|vo)-(\d+)$/i)
  const episodeCandidate = config?.dataset.currentEpisode || selected?.[2] || ''
  const episode = /^\d+$/.test(episodeCandidate) ? episodeCandidate : ''
  const language = (config?.dataset.currentType || selected?.[1] || '').toUpperCase()
  const branded = /french[\s-]*stream/i.test(doc.title)
    || /french[\s-]*stream/i.test(doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '')
    || /french[\s-]*stream/i.test(doc.querySelector('header, .header')?.textContent || '')
  // Domain overrides are intentionally allowed: PreMiD performs URL matching.
  // Require both branding and the site's DLE content structure on every host.
  const valid = branded && Boolean(doc.querySelector('#dle-content'))
  const kind = title && data ? (series ? 'series' : 'film') : 'browse'
  const image = data?.dataset.affiche || doc.querySelector<HTMLImageElement>('.fposter img, .dvd-thumbnail')?.src || ''
  let cover = ''
  try {
    const imageUrl = new URL(image, url)
    if (image && imageUrl.protocol === 'https:')
      cover = imageUrl.href
  }
  catch { /* A missing image must not prevent a presence update. */ }
  const cleanUrl = new URL(url.pathname, url.origin)
  const newsId = data?.dataset.newsid || url.searchParams.get('newsid')
  if (newsId && /^\d+$/.test(newsId))
    cleanUrl.searchParams.set('newsid', newsId)
  let section = 'browse'
  if (url.searchParams.get('do') === 'search')
    section = 'search'
  else if (url.searchParams.get('do') === 'xfsearch' || url.pathname.startsWith('/xfsearch/'))
    section = 'category'
  else if (/^\/films\/?$/.test(url.pathname))
    section = 'films'
  else if (/^\/(?:series|s-tv)\/?$/.test(url.pathname))
    section = 'series'
  else if (/^\/(?:films|series|s-tv)\//.test(url.pathname))
    section = 'category'
  else if (url.pathname === '/' || (url.pathname === '/index.php' && !url.search))
    section = 'home'
  return {
    valid,
    title,
    kind,
    season,
    episode,
    language,
    cover,
    section,
    url: cleanUrl.href,
    key: [cleanUrl.href, rawTitle, episode, language].join('|'),
  }
}
