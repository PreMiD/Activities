import { getButton, getThumbnail, getTitle } from '../util.js'
import { BasePage, strings } from './index.js'

export class ListPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewList
    presenceData.state = getTitle()
    presenceData.smallImageKey = getThumbnail()
    presenceData.buttons = [getButton(strings.buttonViewList)]
    return false
  }
}
