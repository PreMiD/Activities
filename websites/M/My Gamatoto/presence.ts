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
function registerSlideshowKey(key = ''): boolean {
  if (oldSlideshowKey !== key || document.location.href) {
    slideshow.deleteAllSlides()
    oldSlideshowKey = key
    return true
  }
  return false
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
    viewCat: 'mygamatoto.viewCat',
  })

  switch (pathList[0]) {
    case 'catinfo': {
      presenceData.details = strings.viewCat
      presenceData.buttons = [{ label: strings.buttonViewCat, url: href }]
      const catEvolutions = document.querySelectorAll<HTMLDivElement>('.ant-card')
      if (registerSlideshowKey()) {
        for (const evolutionCard of catEvolutions) {
          const thumbnail = evolutionCard.querySelector<HTMLImageElement>('.ant-card-head-title img')
          const name = evolutionCard.querySelector<HTMLHeadingElement>('.ant-card-head-title h3')
          const description = evolutionCard.querySelector<HTMLDivElement>('.ant-card-grid > .ant-card-grid:last-child')
          const levelInput = evolutionCard.querySelector('input')
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
      }
      useSlideshow = true
      break
    }
    default: {
      presenceData.details = strings.browsing
    }
  }

  presence.setActivity(useSlideshow ? slideshow : presenceData)
})
