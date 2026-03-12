import { getButton, getTitle } from '../util.js'
import { BasePage, strings } from './base.js'

export class ThreadPage extends BasePage {
  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewThread
    presenceData.state = getTitle()
    presenceData.buttons = [getButton(strings.buttonViewPage)]
    return false
  }
}
