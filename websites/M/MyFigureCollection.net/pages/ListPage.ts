import { getButton, getThumbnail, getTitle, squareImage } from '../util.js'
import { BasePage, strings } from './base.js'

export class ListPage extends BasePage {
  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewList
    presenceData.state = getTitle()
    presenceData.smallImageKey = await squareImage(getThumbnail())
    presenceData.buttons = [getButton(strings.buttonViewList)]
    return false
  }
}
