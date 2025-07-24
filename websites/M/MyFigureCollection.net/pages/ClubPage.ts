import { getButton, getCurrentLink, getThumbnail, getTitle } from '../util.js'
import { BasePage, strings } from './index.js'

export class ClubPage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.browseClubs
    return false
  }

  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewClub
    presenceData.state = getTitle()
    presenceData.smallImageKey = getThumbnail()
    presenceData.smallImageText = getCurrentLink()
    presenceData.buttons = [getButton(strings.buttonViewClub)]
    return false
  }
}
