import { Assets } from 'premid'

const presence = new Presence({
  clientId: '808749649325719562',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/MangaDex/assets/logo.png',
}

let mangaId: string | null = null
let coverFileName: string | null = null

async function getCoverImage(newMangaId: string) {
  /**
   * Use MangaDex API to get the fileName of the cover to obtain the image.
   * More here : https://api.mangadex.org/docs/get-covers/
   */
  if (mangaId === newMangaId)
    return `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`
  mangaId = newMangaId
  const req = await fetch(
    `https://api.mangadex.org/manga/${mangaId}?includes%5B%5D=cover_art`,
  )
  if (!req.ok)
    return ActivityAssets.Logo
  const { relationships } = (await req.json()).data
  coverFileName = relationships.find(
    (relation: { type: string }) => relation.type === 'cover_art',
  ).attributes.fileName
  return `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`
}

const titleImageCache = new Map<string, string>()

async function getTitleImage(img: HTMLImageElement | null): Promise<string> {
  return new Promise((resolve) => {
    if (img === null)
      return ActivityAssets.Logo

    const image = titleImageCache.get(img.src)

    if (image)
      return resolve(image)

    fetch(img.src)
      .then(res => res.blob())
      .then((blob) => {
        const reader = new FileReader()

        reader.onload = function (e) {
          const dataUrl = e.target!.result!.toString()

          titleImageCache.set(img.src, dataUrl)
          resolve(dataUrl)
        }

        reader.readAsDataURL(blob)
      })
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathArr = pathname.split('/')
  const [showCover, showButtons] = await Promise.all([
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])

  switch (pathArr[1]) {
    case 'title':
      presenceData.details = `Viewing a ${
        pathArr[2] === 'random' ? 'Random' : ''
      } Manga:`
      presenceData.state = document
        .querySelector('head > title')
        ?.textContent
        ?.replace(' - MangaDex', '')
      presenceData.buttons = [{ label: 'View Manga', url: href }]
      presenceData.largeImageKey = await getTitleImage(
        document.querySelector<HTMLImageElement>('img.rounded'),
      )
      break
    case 'titles':
      presenceData.details = {
        '': 'Browsing Manga',
        'latest': 'Browsing Latest Manga',
        'feed': 'Viewing Feed',
        'recent': 'Browsing Recents Mangas',
        'follows': 'Viewing their Library',
      }[pathArr[2]!]
      presenceData.smallImageKey = Assets.Search
      break
    case 'chapter': {
      const title = document.querySelector('.text-primary')?.textContent?.trim()
      presenceData.details = `Reading ${title}`
      presenceData.state = `Page ${document
        .querySelector('head > title')
        ?.textContent
        ?.replace(` - ${title} - MangaDex`, '')}`
      presenceData.largeImageKey = await getCoverImage(
        document.querySelector<HTMLLinkElement>('span > a')?.href?.split('/')[4] ?? '',
      )
      presenceData.smallImageKey = Assets.Reading
      presenceData.buttons = [{ label: 'Read Chapter', url: href }]
      break
    }
    case 'tag':
      presenceData.details = 'Viewing a Tag'
      presenceData.state = document
        .querySelector('head > title')
        ?.textContent
        ?.replace(' - MangaDex', '')
      break
    case 'group':
    case 'user': {
      const username = document
        .querySelector('head > title')
        ?.textContent
        ?.replace(' - MangaDex', '')
      presenceData.details = `Viewing ${
        pathArr[1] === 'group' ? 'Viewing a Group' : 'User Profile'
      }`
      presenceData.state = username
      break
    }
    case 'my':
      presenceData.details = {
        history: 'Viewing History',
        lists: 'Viewing Lists',
        groups: 'Viewing Followed Groups',
      }[pathArr[2]!]
      break
    default:
      presenceData.details = {
        '': 'Viewing the Homepage',
        'settings': 'Viewing the Settings Page',
        'about': 'Viewing About Page',
        'rules': 'Viewing Rules',
        'list': 'Viewing an MDList',
        'users': 'Viewing Users',
        'groups': 'Viewing Groups',
      }[pathArr[1]!]
  }

  if (!showCover)
    presenceData.largeImageKey = ActivityAssets.Logo
  if (!showButtons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
