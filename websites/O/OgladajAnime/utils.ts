import type { PictureCache, SeasonResponse } from './types.js'
import { ActivityAssets } from './constants.js'

const cache: PictureCache[] = []

function cacheExpired(date: Date): boolean {
  if (date === null)
    return true

  return ((new Date().getTime() - date.getTime()) / 1000 / 60) < 5
}

export async function getProfilePicture(id: string): Promise<string | undefined> {
  const index = cache.findIndex((val, _, __) => val.id === id)
  const _val = cache[index]
  if (index === -1) {
    const _new: PictureCache = { id, url: await internal_getPFP(id), date: new Date() }
    cache.push(_new)
    return _new.url
  }
  else if (_val !== undefined && cacheExpired(_val.date)) {
    const url = await internal_getPFP(id)
    _val.url = url
    _val.date = new Date()
    return url
  }
  else {
    return cache[index]?.url
  }
}

async function internal_getPFP(id: string) {
  let url = `https://cdn.ogladajanime.pl/images/user/${id}.webp?${new Date().getTime()}`
  try {
    const res = await fetch(new URL(url))
    if (res.status === 404)
      url = ActivityAssets.DefaultProfilePicture
  }
  catch {
    url = ActivityAssets.DefaultProfilePicture
  }
  return url
}

export function getUserID(): number {
  const dropdowns = document.querySelectorAll('a[class="dropdown-item"]')
  dropdowns.forEach((elem, _, __) => {
    const href = elem.getAttribute('href')
    if (href != null && href.startsWith('/profile/'))
      return Number.parseInt(href.replace('/profile/', ''))
  })
  return 0
}

export function determineSeason(preferAltName: boolean): SeasonResponse {
  const anime = document.querySelector('#anime_name_id')
  const name = anime?.textContent ?? 'N/A'
  const alternativeName = anime?.parentElement?.querySelector(
    'i[class="text-muted text-trim"]',
  )?.textContent ?? 'N/A'
  const listItems = document.querySelector('div[class="col-12 col-sm-6 col-lg-5"]')?.childNodes
  let altNames: string[] = []
  if (listItems) {
    for (let index = 0; index < listItems.length; index++) {
      const element = listItems[index]
      if (element?.textContent?.startsWith('Synonimy: ')) {
        const list = element.textContent?.replace('Synonimy: ', '')
        const names = list.split(', ')
        if (names && names.length > 0) {
          altNames = names
          break
        }
      }
    }
  }

  return multiTestForSeason(preferAltName ? [alternativeName, ...altNames, name] : [name, alternativeName, ...altNames])
}

function multiTestForSeason(names: string[]): SeasonResponse {
  for (let index = 0; index < names.length; index++) {
    const name = names[index]
    const res = testForSeason(name)
    if (res && res.found)
      return res
  }
  return { found: false, name: 'N/A', season: -1 }
}

function testForSeason(name: string | undefined): SeasonResponse {
  if (name) {
    name = name.trim()
    // False error, there is an "or" in the regex that wont allow for 2 groups of the same name to appear
    // eslint-disable-next-line regexp/strict
    const regex = /(?<season>\d+)(?:st|nd|rd|th) Season|Season (?<season>\d+)| (?<!Part )(?<season>\d+)$/
    const m = name.match(regex)
    if (m && m.length > 0) {
      const season = Number.parseInt(m.groups?.season ?? '-1')
      const string = m[0]
      const newName = name.replace(string, '')
      if (season !== -1) {
        return {
          found: true,
          name: newName,
          season,
        }
      }
    }
  }
  return { found: false, name: 'N/A', season: -1 }
}

export function append(text: string, append: string | undefined | null, separator: string = ': '): string {
  if (append?.trim()?.replace(' ', ''))
    return `${text}${separator}${append}`
  else
    return text
}

export function getAnimeIcon(id: number | string): string {
  return `https://cdn.ogladajanime.pl/images/anime_new/${id}/2.webp`
}
