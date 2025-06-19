import type ActivityStrings from './My Gamatoto.json'
import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()

declare global {
  interface StringKeys {
    iFixIt: keyof typeof ActivityStrings
  }
}

enum ActivityAssets {
  Logo = 'https://i.imgur.com/gC6wsFh.png',
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

function addStatSlides(card: HTMLDivElement, presenceData: PresenceData) {
  const thumbnail = card.querySelector<HTMLImageElement>('.ant-card-head-title img')
  const name = card.querySelector<HTMLHeadingElement>('.ant-card-head-title h3')
  const description = card.querySelector<HTMLDivElement>('.ant-card-grid > .ant-card-grid:last-child')
  const levelInput = card.querySelector('input')
  const stats: HTMLDivElement[] = []

  let currentItem = levelInput?.closest('.ant-card-grid')?.nextElementSibling
  while (currentItem && currentItem?.querySelector('hr') === null) {
    stats.push(currentItem as HTMLDivElement)
    currentItem = currentItem.nextElementSibling
  }

  const data: PresenceData = structuredClone(presenceData)
  data.largeImageKey = thumbnail
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
    const subData = structuredClone(data)
    subData.smallImageText = `${statName?.textContent}: ${statText}`
    slideshow.addSlide(`${name?.textContent}-${statName?.textContent}`, subData, MIN_SLIDE_TIME)
  }
  data.smallImageText = description
  slideshow.addSlide(`${name?.textContent}-description`, data, MIN_SLIDE_TIME)
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
    compareCat: 'mygamatoto.compareCat',
    viewCat: 'mygamatoto.viewCat',
    viewEnemy: 'mygamatoto.viewEnemy',
    viewList: 'general.viewList',
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
        const data = structuredClone(presenceData)
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
        addStatSlides(evolutionCard, presenceData)
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
        addStatSlides(card, presenceData)
      }
      else {
        useSlideshow = false
      }
      break
    }
    default: {
      if (pathList[0]?.startsWith('best-cats') || pathList[0]?.endsWith('tier-list')) {
        presenceData.details = strings.viewList
        presenceData.state = document.querySelector('h2')
        registerSlideshowKey()
        const rows = document.querySelector<HTMLDivElement>('h3+.ant-table-wrapper')
          ?.querySelectorAll<HTMLTableRowElement>('.ant-table-body > table > tbody tr')
        for (const row of rows ?? []) {
          const link = row.querySelector('a')
          const image = link?.querySelector('img')
          const data = structuredClone(presenceData)
          data.buttons?.push({ label: strings.buttonViewCat, url: link })
          data.state = image?.alt
          data.smallImageKey = image
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
