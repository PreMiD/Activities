import { ActivityType } from 'premid'
import {
  batch,
  browsingTimestamp,
  getIconImage,
  presence,
  registerSlideshowKey,
  slideshow,
} from './util.js'

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Font%20Awesome/assets/logo.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Playing,
    name: 'Font Awesome',
  }
  const { pathname, href, search } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  let usesSlideshow = false

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = 'Browsing Home Page'
      break
    }
    case 'docs': {
      presenceData.details = 'Reading Documentation'
      if (pathList[1]) {
        presenceData.state = document.querySelector('.section+h1')
        presenceData.buttons = [{ label: 'Read Docs', url: href }]
      }
      break
    }
    case 'icons': {
      if (pathList[1] === 'categories') {
        if (pathList[2]) {
          const header = document.querySelector('h2')!
          presenceData.details = 'Viewing Icon Category'
          presenceData.state = header
          presenceData.smallImageKey = await getIconImage(
            header.querySelector('i')!,
          )
          presenceData.smallImageText = header
          presenceData.buttons = [{ label: 'View Category', url: href }]
        }
        else {
          presenceData.details = 'Browsing Categories'
        }
      }
      else if (pathList[1]) {
        presenceData.details = 'Viewing Icon'
        presenceData.state = document.querySelector(
          '.icon-detail h1+button,#icon-landing h1+button',
        )?.childNodes[1]
        presenceData.smallImageKey = await getIconImage(
          document.querySelector('.icon-details-preview-rendering i')!,
          getComputedStyle(document.querySelector('.icon-details-preview.card')!)
            .backgroundColor,
        )
        const family = document.querySelector<HTMLSelectElement>('#icon_family')
        if (family)
          presenceData.smallImageText = family.value

        presenceData.buttons = [{ label: 'View Icon', url: href }]
      }
      else {
        presenceData.details = 'Browsing Icons'
      }
      break
    }
    case 'search': {
      const searchQuery = new URLSearchParams(search).get('q')
      presenceData.details = 'Searching Icons'
      if (searchQuery) {
        presenceData.state = searchQuery
        const iconCards = [
          ...document.querySelectorAll('#icons-results > article'),
        ]
        if (iconCards.length) {
          const key = `search-${searchQuery}-${iconCards[0]?.id}`
          registerSlideshowKey(key)
          usesSlideshow = true
          const batchData = await batch(key, iconCards, async (card) => {
            const tempData: PresenceData = {
              ...presenceData,
              smallImageKey: await getIconImage(card.querySelector('i')!),
              smallImageText: card.id,
            }
            return tempData
          })
          for (const data of batchData)
            slideshow.addSlide(data.smallImageText as string, data, 5000)
        }
      }
      break
    }
    case 'start': {
      presenceData.details = 'Getting Started'
      break
    }
    case 'support': {
      presenceData.details = 'Browsing Support'
      break
    }
    case 'plans': {
      if (pathList[1]) {
        presenceData.details = 'Viewing Plan'
        presenceData.state = document.querySelector('h3')
      }
      else {
        presenceData.details = 'Browsing Plans'
      }
      break
    }
    case 'sessions': {
      presenceData.details = 'Signing In'
      break
    }
  }

  if (usesSlideshow)
    presence.setActivity(slideshow)
  else if (!presenceData.details)
    presence.clearActivity()
  else presence.setActivity(presenceData)
})
