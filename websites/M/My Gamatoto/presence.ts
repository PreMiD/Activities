import type ActivityStrings from './My Gamatoto.json'
import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

declare global {
  interface StringKeys {
    MyGamatoto: keyof typeof ActivityStrings
  }
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/My%20Gamatoto/assets/logo.png',
}

let oldSlideshowKey: string
function registerSlideshowKey(inputKey?: string): boolean {
  const key = inputKey ?? document.location.href
  if (oldSlideshowKey !== (key)) {
    slideshow.deleteAllSlides()
    oldSlideshowKey = key
    return true
  }
  return false
}

function sleep(seconds: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(res, seconds * 1000)
  })
}

const imageCache: Record<string, Promise<Blob | string>> = {}
function squareImage(image: HTMLImageElement): Promise<Blob | string> {
  const { src, complete } = image
  const newImage = document.createElement('img')
  newImage.crossOrigin = 'anonymous'
  newImage.src = src
  if (src in imageCache)
    return imageCache[src]!
  const render = async () => {
    while (true) {
      const { naturalHeight: height, naturalWidth: width, complete } = newImage
      if (!complete) {
        await sleep(1)
        continue
      }
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = width
      canvas.height = height
      if (width > height)
        canvas.height = width
      if (height > width)
        canvas.width = height
      if (width === height) {
        imageCache[src] = Promise.resolve(src)
        return imageCache[src]
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(
        newImage,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
      )
      const output = new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        })
      })
      imageCache[src] = output
      return output
    }
  }
  if (!complete) {
    return new Promise((resolve) => {
      newImage.onload = () => {
        resolve(render())
      }
    })
  }
  return render()
}

async function addStatSlides(card: HTMLDivElement, presenceData: PresenceData) {
  const thumbnail = card.querySelector<HTMLImageElement>('.ant-card-head-title img')
  const name = card.querySelector<HTMLHeadingElement>('.ant-card-head-title h3')?.firstChild
  const description = card.querySelector<HTMLDivElement>('.ant-card-grid > .ant-card-grid:last-child')
  const levelInput = card.querySelector('input')
  const stats: HTMLDivElement[] = []

  if ((name?.textContent?.trim() ?? '') === '')
    return

  let currentItem = levelInput?.closest('.ant-card-grid')?.nextElementSibling
  while (currentItem && currentItem?.querySelector('hr') === null) {
    stats.push(currentItem as HTMLDivElement)
    currentItem = currentItem.nextElementSibling
  }

  const data: PresenceData = cloneData(presenceData)
  data.largeImageKey = thumbnail ? await squareImage(thumbnail) : ActivityAssets.Logo
  data.state = `${name?.textContent} - LV${levelInput?.value}`
  data.smallImageKey = Assets.Question
  for (const stat of stats) {
    const statName = stat.querySelector('div')
    let statText = ''
    for (const node of stat.childNodes) {
      if (node.nodeType === document.TEXT_NODE) {
        statText += node.textContent
      }
    }
    const subData = cloneData(data)
    subData.smallImageText = `${statName?.textContent}: ${statText}`
    slideshow.addSlide(`${name?.textContent}-${statName?.textContent}`, subData, MIN_SLIDE_TIME)
  }
  data.smallImageText = description
  slideshow.addSlide(`${name?.textContent}-description`, data, MIN_SLIDE_TIME)
}

function cloneData(data: PresenceData): PresenceData {
  const newData = { ...data }
  if (data.buttons) {
    newData.buttons = [...data.buttons]
  }
  return newData
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'My Gamatoto',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)
  if (pathList[0]?.length === 2) { // remove country code
    pathList.shift()
  }

  let useSlideshow = false

  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    buttonViewCat: 'mygamatoto.buttonViewCat',
    buttonViewComparison: 'mygamatoto.buttonViewComparison',
    buttonViewEnemy: 'mygamatoto.buttonViewEnemy',
    buttonViewStage: 'mygamatoto.buttonViewStage',
    compareCat: 'mygamatoto.compareCat',
    viewCat: 'mygamatoto.viewCat',
    viewEnemy: 'mygamatoto.viewEnemy',
    viewList: 'general.viewList',
    viewStage: 'mygamatoto.viewStage',
  })

  switch (pathList[0]) {
    case 'allcats':
    case 'allenemies':
    case 'allstages': {
      presenceData.details = strings.viewList
      presenceData.state = document.querySelector('h1')
      break
    }
    case 'comparecats': {
      useSlideshow = true
      presenceData.details = strings.compareCat
      presenceData.buttons = [{ label: strings.buttonViewComparison, url: href }]
      const rows = document.querySelectorAll<HTMLTableRowElement>('.ant-table-body > table > tbody tr')
      registerSlideshowKey()
      for (const row of rows) {
        const link = row.querySelector('a')
        const image = link?.querySelector('img')
        const data = cloneData(presenceData)
        data.buttons?.push({ label: strings.buttonViewCat, url: link })
        data.state = image?.alt
        data.smallImageKey = image
        slideshow.addSlide(`${image?.alt}`, data, MIN_SLIDE_TIME)
      }
      break
    }
    case 'catinfo': {
      useSlideshow = true
      presenceData.details = strings.viewCat
      presenceData.buttons = [{ label: strings.buttonViewCat, url: href }]
      const catEvolutions = document.querySelectorAll<HTMLDivElement>('.ant-card')
      registerSlideshowKey()
      for (const evolutionCard of catEvolutions) {
        await addStatSlides(evolutionCard, presenceData)
      }
      break
    }
    case 'enemyinfo': {
      useSlideshow = true
      presenceData.details = strings.viewEnemy
      presenceData.buttons = [{ label: strings.buttonViewEnemy, url: href }]
      registerSlideshowKey()
      const card = document.querySelector<HTMLDivElement>('.ant-card')
      if (card) {
        await addStatSlides(card, presenceData)
      }
      else {
        useSlideshow = false
      }
      break
    }
    case 'stageinfo': {
      presenceData.details = strings.viewStage
      presenceData.state = document.querySelector<HTMLDivElement>('.ant-descriptions-title')
      presenceData.buttons = [{ label: strings.buttonViewStage, url: href }]
      break
    }
    default: {
      if (pathList[0]?.startsWith('best-cats') || pathList[0]?.endsWith('tier-list')) {
        presenceData.details = strings.viewList
        presenceData.state = document.querySelector('h2')
        registerSlideshowKey()
        useSlideshow = true
        const rows = document.querySelector<HTMLDivElement>('h3+.ant-table-wrapper')
          ?.querySelectorAll<HTMLTableRowElement>('.ant-table-body > table > tbody tr')
        for (const row of rows ?? []) {
          const link = row.querySelector('a')
          const image = link?.querySelector('img')
          const data = cloneData(presenceData)
          data.buttons?.push({ label: strings.buttonViewCat, url: link })
          data.smallImageText = image?.alt
          if (image) {
            data.smallImageKey = await squareImage(image)
          }
          slideshow.addSlide(`${image?.alt}`, data, MIN_SLIDE_TIME)
        }
      }
      else {
        presenceData.details = strings.browsing
      }
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
