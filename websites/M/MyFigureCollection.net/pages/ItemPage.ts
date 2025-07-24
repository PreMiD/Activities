import { getButton, getCurrentLink, getSubtitle, getTitle, slideshow, squareImage } from '../util.js'
import { BasePage, strings } from './base.js'

export class ItemPage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.browseItems
    presenceData.state = getCurrentLink()
    return false
  }

  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewItem
    presenceData.state = getTitle()
    presenceData.smallImageKey = await squareImage(document.querySelector<HTMLImageElement>('.main img'))
    presenceData.buttons = [getButton(strings.buttonViewItem)]

    const dataFields = document.querySelectorAll('.object .data-field')
    for (const field of dataFields) {
      const heading = field.querySelector('.data-label')?.textContent ?? 'Unknown'
      const value = field.querySelector('.data-value')
      const elements = [...value?.querySelectorAll('.item-entries') ?? []]
      const data = { ...presenceData }
      if (elements.length) {
        data.smallImageText = `${heading} - ${value?.textContent}`
      }
      else {
        data.smallImageText = `${heading} - ${elements.join(', ')}`
      }
      slideshow.addSlide(heading, data, MIN_SLIDE_TIME)
    }
    return false
  }

  override async executeTab(presenceData: PresenceData, _tab: string): Promise<boolean> {
    presenceData.details = strings.viewItemComments
    presenceData.state = getSubtitle()
    presenceData.buttons = [getButton(strings.buttonViewItem)]
    return true
  }
}
