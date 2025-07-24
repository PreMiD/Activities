import { getButton, getThumbnail, getTitle } from '../util.js'
import { BasePage, strings } from './index.js'

export class BlogPostPage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.browseArticles
    return false
  }

  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.readingAnArticle
    presenceData.state = getTitle()
    presenceData.smallImageKey = getThumbnail()
    presenceData.buttons = [getButton(strings.buttonReadArticle)]
    return false
  }
}
