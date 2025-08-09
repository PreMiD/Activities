import { getButton, getThumbnail, getTitle, squareImage } from '../util.js'
import { BasePage, strings } from './base.js'

export class BlogPostPage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.browseArticles
    return false
  }

  override async executeView(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.readingAnArticle
    presenceData.state = getTitle()
    presenceData.smallImageKey = await squareImage(getThumbnail())
    presenceData.buttons = [getButton(strings.buttonReadArticle)]
    return false
  }
}
