import { BACKGROUND_URL_REGEX, getButton, getThumbnail, getTitle, slideshow, squareImage } from '../util.js'
import { BasePage, strings } from './base.js'

export class UserPage extends BasePage {
  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewProfile
    presenceData.state = getTitle()
    presenceData.smallImageKey = await squareImage(getThumbnail())
    presenceData.buttons = [getButton(strings.buttonViewProfile)]
    return false
  }

  override async executeTab(presenceData: PresenceData, tab: string): Promise<boolean> {
    let useSlideshow = false
    await this.executeView(presenceData)
    switch (tab) {
      case 'collection': {
        useSlideshow = true
        const items = document.querySelectorAll('.content-wrapper .item-icon')
        for (const item of items) {
          const data = { ...presenceData }
          const itemLink = item.querySelector('a')
          const baseImage = item.querySelector('img')
          const image = await squareImage(baseImage)
          data.largeImageKey = await squareImage(getThumbnail())
          data.smallImageKey = image
          data.smallImageText = `${tab} - ${baseImage?.alt}`
          data.buttons?.push({ label: strings.buttonViewItem, url: itemLink })
          slideshow.addSlide(itemLink?.textContent ?? 'unknown', data, MIN_SLIDE_TIME)
        }
        break
      }
      case 'pictures': {
        useSlideshow = true
        const items = document.querySelectorAll('.content-wrapper .picture-icon')
        for (const item of items) {
          const data = { ...presenceData }
          const itemLink = item.querySelector('a')
          const image = item.querySelector('span')
          data.largeImageKey = await squareImage(getThumbnail())
          data.smallImageKey = image?.style.background.match(BACKGROUND_URL_REGEX)?.[1]
          data.buttons?.push({ label: strings.buttonViewPicture, url: itemLink })
          slideshow.addSlide(itemLink?.textContent ?? 'unknown', data, MIN_SLIDE_TIME)
        }
        break
      }
      default: {
        presenceData.smallImageText = document.querySelector('.content-tabs .selected')?.textContent ?? 'Unknown'
        break
      }
    }
    return useSlideshow
  }
}
