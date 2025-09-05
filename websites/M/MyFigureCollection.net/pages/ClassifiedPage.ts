import { getButton, getTitle } from '../util.js'
import { BasePage, strings } from './base.js'

export class ClassifiedPage extends BasePage {
  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewAd
    presenceData.state = document.querySelector('.classified-data .data-value .stamp-data') ?? getTitle()
    presenceData.buttons = [getButton(strings.buttonViewAd)]
    return false
  }
}
