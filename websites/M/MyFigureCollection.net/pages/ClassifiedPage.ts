import { getButton } from '../util.js'
import { BasePage, strings } from './index.js'

export class ClassifiedPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewAd
    // presenceData.state = title // TODO: extract item name
    presenceData.buttons = [getButton(strings.buttonViewAd)]
    return false
  }
}
