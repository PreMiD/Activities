import { getButton, getCurrentLink, getThumbnail, getTitle, squareImage } from '../util.js'
import { BasePage, strings } from './base.js'

export class ShopPage extends BasePage {
  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewShop
    presenceData.state = getTitle()
    presenceData.smallImageKey = await squareImage(getThumbnail())
    presenceData.smallImageText = getCurrentLink()
    presenceData.buttons = [getButton(strings.buttonViewShop)]
    return false
  }
}
