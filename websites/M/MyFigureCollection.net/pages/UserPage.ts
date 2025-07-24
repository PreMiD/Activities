import { BACKGROUND_URL_REGEX, getButton, getThumbnail, getTitle, slideshow } from '../util.js'
import { BasePage, strings } from './index.js'

export class UserPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewProfile
    presenceData.state = getTitle()
    presenceData.smallImageKey = getThumbnail()
    presenceData.buttons = [getButton(strings.buttonViewProfile)]
    return false
  }

  override async executeTab(presenceData: PresenceData, tab: string): Promise<boolean> {
    let useSlideshow = false
    await this.executeView(presenceData, this.input.id)
    switch (tab) {
      case 'collection': {
        useSlideshow = true
        const items = document.querySelectorAll('.content-wrapper .item-icon')
        for (const item of items) {
          const data = { ...presenceData }
          const itemLink = item.querySelector('a')
          const image = item.querySelector('img')
          data.largeImageKey = getThumbnail()
          data.smallImageKey = image
          data.smallImageText = `${tab} - ${image?.alt}`
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
          data.largeImageKey = getThumbnail()
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
