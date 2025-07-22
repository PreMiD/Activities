import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1396802813484597320',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/GP6ci4C.png',
}

const Fields = {
  defaultDetails: 'Mangafire.to',
  aboutState: 'Viewing about page',
  defaultState: 'Viewing other pages',
  homeState: 'Viewing home page',
  typeState: 'Viewing by type',
  filterDetails: 'Filtering Manga',
  filterState: 'Filtering Manga',
  newestState: 'Viewing new release Manga',
  updatedState: 'Viewing recently updated Manga',
  addedState: 'Viewing recently added Manga',
  readingState: 'Reading The Manga...',
}

async function getMangaCoverImage(): Promise<string | null> {
  const curPath = document.location.pathname

  // 情况 1: 当前就是 /manga/{title}
  if (/^\/manga\/[^/]+\/?$/.test(curPath)) {
    const img = document.querySelector('.poster img[itemprop="image"]') as HTMLImageElement
    return img?.src || null
  }

  // 情况 2: 当前是 /read/{title}/xxx，提取 title 并跳转抓图
  if (/^\/read\/[^/]+\//.test(curPath)) {
    const match = curPath.match(/^\/read\/([^/]+)\//)
    const mangaTitle = match?.[1]

    if (!mangaTitle)
      return null

    // 构造 /manga/{title} 页面地址
    const mangaUrl = `/manga/${mangaTitle}`

    try {
      const res = await fetch(mangaUrl)
      const html = await res.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const img = doc.querySelector('.poster img[itemprop="image"]') as HTMLImageElement

      return img?.src || null
    }
    catch (err) {
      console.error('封面获取失败', err)
      return null
    }
  }

  return null
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp,
    details: Fields.defaultDetails,
    state: Fields.defaultState,
  }

  const curURL = document.location.pathname
  if (curURL === '/') {
    presenceData.details = Fields.defaultDetails
    presenceData.state = Fields.aboutState
  }
  else if (curURL === '/home') {
    presenceData.details = Fields.defaultDetails
    presenceData.state = Fields.homeState
  }
  else if (curURL.startsWith('/type') || curURL.includes('genre')) {
    const match = curURL.match(/^\/(?:type|genre)\/([^/]+)\/?$/)
    const mangaType = match?.[1] ?? 'Unknow Type/Genre'
    presenceData.details = Fields.defaultDetails
    presenceData.state = `Viewing ${mangaType} Manga`
  }
  else if (curURL.startsWith('/filter')) {
    presenceData.details = Fields.defaultDetails
    presenceData.state = Fields.filterState
  }
  else if (curURL.startsWith('/newest')) {
    presenceData.details = Fields.defaultDetails
    presenceData.state = Fields.newestState
  }
  else if (curURL.startsWith('/updated')) {
    presenceData.details = Fields.defaultDetails
    presenceData.state = Fields.updatedState
  }
  else if (curURL.startsWith('/added')) {
    presenceData.details = Fields.defaultDetails
    presenceData.state = Fields.addedState
  }
  else if (curURL.startsWith('/manga')) {
    const infoDiv = document.querySelector('div.info')
    const status = infoDiv?.querySelector('p')?.textContent?.trim() || ''
    const title = infoDiv?.querySelector('h1[itemprop="name"]')?.textContent?.trim() || ''
    const authorAnchors = document.querySelectorAll('a[itemprop="author"]')
    const authors = Array.from(authorAnchors).map(a => a.textContent?.trim())
    const logoUrl = await getMangaCoverImage()
    presenceData.largeImageKey = logoUrl
    presenceData.details = title
    presenceData.state = `${status} ${authors ? `· ${authors}` : ''}`
  }
  else if (curURL.startsWith('/read')) {
    presenceData.smallImageKey = Assets.Reading
    const titleAnchor = document.querySelector('.head > a')
    const mangaTitle = titleAnchor?.textContent?.trim() || ''
    const logoUrl = await getMangaCoverImage()
    presenceData.largeImageKey = logoUrl
    presenceData.details = mangaTitle
    presenceData.state = Fields.readingState
  }
  presence.setActivity(presenceData)
})
