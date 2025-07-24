import { getButton, getCurrentLink, getTitle } from '../util.js'
import { BasePage, strings } from './base.js'

export class EntryPage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.browseEntries
    presenceData.state = getCurrentLink()
    return false
  }

  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewEntry
    presenceData.state = getTitle()
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.entry-picture')
    presenceData.smallImageText = document.querySelector('.entry-data .data-value')
    presenceData.buttons = [getButton(strings.buttonViewEntry)]
    return false
  }
}
