import { BACKGROUND_URL_REGEX, getButton, getCurrentLink, getTitle, slideshow, squareImage } from '../util.js'
import { BasePage, strings } from './base.js'

export class PicturePage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewList
    presenceData.state = getCurrentLink()
    const pictures = document.querySelectorAll('.results .picture-icon')
    for (const picture of pictures) {
      const data = { ...presenceData }
      const link = picture.querySelector('a')?.href ?? document.location.href
      data.smallImageKey = picture.querySelector('span')?.style.background.match(BACKGROUND_URL_REGEX)?.[1]
      data.buttons = [{ label: strings.buttonViewPicture, url: link }]
      slideshow.addSlide(link, data, MIN_SLIDE_TIME)
    }
    return true
  }

  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewPicture
    presenceData.state = getTitle()?.textContent ?? this.input.id
    presenceData.smallImageKey = await squareImage(document.querySelector<HTMLImageElement>('.the-picture img'))
    presenceData.smallImageText = strings.byAuthor.replace(
      '{author}',
      document.querySelector('.object-meta .user-anchor')?.textContent ?? 'Unknown',
    )
    presenceData.buttons = [getButton(strings.buttonViewPicture)]
    const relatedItem = document.querySelector('.tbx-target-ITEMS .stamp')
    if (relatedItem) {
      presenceData.state += ` - ${relatedItem.textContent}`
      presenceData.buttons.push({ label: strings.viewItem, url: relatedItem.querySelector('a') })
    }
    return false
  }
}
