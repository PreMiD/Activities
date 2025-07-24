import { getButton, getCurrentLink, getThumbnail, getTitle } from '../util.js'
import { BasePage, strings } from './index.js'

export class ShopPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewShop
    presenceData.state = getTitle()
    presenceData.smallImageKey = getThumbnail()
    presenceData.smallImageText = getCurrentLink()
    presenceData.buttons = [getButton(strings.buttonViewShop)]
    return false
  }
}
