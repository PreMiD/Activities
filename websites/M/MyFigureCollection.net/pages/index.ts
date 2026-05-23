import type { BasePage } from './base.js'
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
