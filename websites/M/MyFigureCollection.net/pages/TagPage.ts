import { getTitle } from '../util.js'
import { BasePage, strings } from './base.js'

export class TagPage extends BasePage {
  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.browseTag
    presenceData.state = getTitle()
    return false
  }
}
