import { getButton, getCurrentLink, getThumbnail, getTitle, squareImage } from '../util.js'
import { BasePage, strings } from './base.js'

export class ClubPage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.browseClubs
    return false
  }

  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewClub
    presenceData.state = getTitle()
    presenceData.smallImageKey = await squareImage(getThumbnail())
    presenceData.smallImageText = getCurrentLink()
    presenceData.buttons = [getButton(strings.buttonViewClub)]
    return false
  }

  override async executeTab(presenceData: PresenceData, _tab: string): Promise<boolean> {
    await this.executeView(presenceData)
    presenceData.smallImageText = document.querySelector('.content-tabs .selected')
    return false
  }
}
