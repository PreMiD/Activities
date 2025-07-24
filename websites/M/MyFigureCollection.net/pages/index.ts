import { Assets } from 'premid'
import { getStrings, getSubtitle, getTitle, presence, slideshow } from '../util.js'
import { BlogPostPage } from './BlogPostPage.js'
import { ClassifiedPage } from './ClassifiedPage.js'
import { ClubPage } from './ClubPage.js'
import { EntryPage } from './EntryPage.js'
import { ItemPage } from './ItemPage.js'
import { ListPage } from './ListPage.js'
import { PicturePage } from './PicturePage.js'
import { ShopPage } from './ShopPage.js'
import { TagPage } from './TagPage.js'
import { ThreadPage } from './ThreadPage.js'
import { UserPage } from './UserPage.js'

export interface PageInput {
  presenceData: PresenceData
  tab?: string | null
  mode: string
  id: string
}

// global strings variable for use across all pages
type StringData = Awaited<ReturnType<typeof getStrings>>
export const strings: StringData = {} as StringData

export class BasePage {
  input!: PageInput

  async execute(input: PageInput): Promise<void> {
    Object.assign(strings, await getStrings())
    this.input = input
    let useSlideshow = false
    const { mode, tab, id, presenceData } = input
    if (mode === 'browse') {
      useSlideshow = await this.executeBrowse(presenceData)
    }
    else if (tab) {
      useSlideshow = await this.executeTab(presenceData, tab)
    }
    else if (id) {
      useSlideshow = await this.executeView(presenceData, id)
    }
    else {
      presenceData.details = strings.browsing
    }
    presence.setActivity(useSlideshow ? slideshow : presenceData)
  }

  async executeBrowse(_presenceData: PresenceData): Promise<boolean> {
    return false
  }

  async executeView(_presenceData: PresenceData, _id: string): Promise<boolean> {
    return false
  }

  async executeTab(presenceData: PresenceData, _tab: string): Promise<boolean> {
    await this.executeView(presenceData, this.input.id)
    presenceData.state = getSubtitle()
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = getTitle()
    return false
  }
}

export default {
  blogpost: BlogPostPage,
  classified: ClassifiedPage,
  club: ClubPage,
  entry: EntryPage,
  item: ItemPage,
  list: ListPage,
  picture: PicturePage,
  profile: UserPage,
  shop: ShopPage,
  tag: TagPage,
  thread: ThreadPage,
  user: UserPage,
} as Record<string, typeof BasePage>
