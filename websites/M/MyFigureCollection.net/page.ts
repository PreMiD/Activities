import { Assets } from 'premid'
import { BACKGROUND_URL_REGEX, getButton, getCurrentLink, getStrings, getSubtitle, getThumbnail, getTitle, presence, slideshow } from './util.js'

export interface PageInput {
  presenceData: PresenceData
  tab?: string | null
  mode: string
  id: string
}

// global strings variable for use across all pages
let strings!: Awaited<ReturnType<typeof getStrings>>

class BasePage {
  input!: PageInput

  async execute(input: PageInput): Promise<void> {
    strings = await getStrings()
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

class BlogPostPage extends BasePage {
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

class UserPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewProfile
    presenceData.state = getTitle()
    presenceData.smallImageKey = getThumbnail()
    presenceData.buttons = [getButton(strings.buttonViewProfile)]
    return false
  }

  override async executeTab(presenceData: PresenceData, tab: string): Promise<boolean> {
    let useSlideshow = false
    await this.executeView(presenceData, this.input.id)
    switch (tab) {
      case 'collection': {
        useSlideshow = true
        const items = document.querySelectorAll('.content-wrapper .item-icon')
        for (const item of items) {
          const data = { ...presenceData }
          const itemLink = item.querySelector('a')
          const image = item.querySelector('img')
          data.largeImageKey = getThumbnail()
          data.smallImageKey = image
          data.smallImageText = `${tab} - ${image?.alt}`
          data.buttons?.push({ label: strings.buttonViewItem, url: itemLink })
          slideshow.addSlide(itemLink?.textContent ?? 'unknown', data, MIN_SLIDE_TIME)
        }
        break
      }
      case 'pictures': {
        useSlideshow = true
        const items = document.querySelectorAll('.content-wrapper .picture-icon')
        for (const item of items) {
          const data = { ...presenceData }
          const itemLink = item.querySelector('a')
          const image = item.querySelector('span')
          data.largeImageKey = getThumbnail()
          data.smallImageKey = image?.style.background.match(BACKGROUND_URL_REGEX)?.[1]
          data.buttons?.push({ label: strings.buttonViewPicture, url: itemLink })
          slideshow.addSlide(itemLink?.textContent ?? 'unknown', data, MIN_SLIDE_TIME)
        }
        break
      }
      default: {
        presenceData.smallImageText = document.querySelector('.content-tabs .selected')?.textContent ?? 'Unknown'
        break
      }
    }
    return useSlideshow
  }
}

class ClassifiedPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewAd
    // presenceData.state = title // TODO: extract item name
    presenceData.buttons = [getButton(strings.buttonViewAd)]
    return false
  }
}

class ClubPage extends BasePage {
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

class EntryPage extends BasePage {
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

class ItemPage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.browseItems
    presenceData.state = getCurrentLink()
    return false
  }

  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewItemComments
    presenceData.state = getSubtitle()
    presenceData.buttons = [getButton(strings.buttonViewItem)]
    return false
  }

  override async executeTab(presenceData: PresenceData, _tab: string): Promise<boolean> {
    presenceData.details = strings.viewItem
    presenceData.state = getTitle()
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.main img')
    presenceData.buttons = [getButton(strings.buttonViewItem)]

    const dataFields = document.querySelectorAll('.object .data-field')
    for (const field of dataFields) {
      const heading = field.querySelector('.data-label')?.textContent ?? 'Unknown'
      const value = field.querySelector('.data-value')
      const elements = [...value?.querySelectorAll('.item-entries') ?? []]
      const data = { ...presenceData }
      if (elements.length) {
        data.smallImageText = `${heading} - ${value?.textContent}`
      }
      else {
        data.smallImageText = `${heading} - ${elements.join(', ')}`
      }
      slideshow.addSlide(heading, data, MIN_SLIDE_TIME)
    }
    return true
  }
}

class ListPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewList
    presenceData.state = getTitle()
    presenceData.smallImageKey = getThumbnail()
    presenceData.buttons = [getButton(strings.buttonViewList)]
    return false
  }
}

class PicturePage extends BasePage {
  override async executeBrowse(presenceData: PresenceData): Promise<boolean> {
    presenceData.details = strings.viewList
    presenceData.state = getCurrentLink()
    const pictures = document.querySelectorAll('.results .picture-icon')
    for (const picture of pictures) {
      const data = { ...presenceData }
      const link = picture.querySelector('a')?.href ?? document.location.href
      data.smallImageKey = picture.querySelector('span')?.style.background.match(BACKGROUND_URL_REGEX)?.[1]
      data.buttons = [{ label: strings.buttonViewPicture, url: link }]
      slideshow.addSlide(link, data, MIN_SLIDE_TIME)
    }
    return true
  }

  override async executeView(presenceData: PresenceData, id: string): Promise<boolean> {
    presenceData.details = strings.viewPicture
    presenceData.state = `#${id}`
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.the-picture img')
    presenceData.smallImageText = strings.byAuthor.replace(
      '{author}',
      document.querySelector('.object-meta .user-anchor')?.textContent ?? 'Unknown',
    )
    presenceData.buttons = [getButton(strings.buttonViewPicture)]
    const relatedItem = document.querySelector('.tbx-target-ITEMS .stamp')
    if (relatedItem) {
      presenceData.state += ` - ${relatedItem.textContent}`
      presenceData.buttons.push({ label: strings.viewItem, url: relatedItem.querySelector('a') })
    }
    return false
  }
}

class ShopPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewShop
    presenceData.state = getTitle()
    presenceData.smallImageKey = getThumbnail()
    presenceData.smallImageText = getCurrentLink()
    presenceData.buttons = [getButton(strings.buttonViewShop)]
    return false
  }
}

class TagPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.browseTag
    presenceData.state = getTitle()
    return false
  }
}

class ThreadPage extends BasePage {
  override async executeView(presenceData: PresenceData, _id: string): Promise<boolean> {
    presenceData.details = strings.viewThread
    presenceData.state = getTitle()
    presenceData.buttons = [getButton(strings.buttonViewPage)]
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
