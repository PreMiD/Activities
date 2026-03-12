import { Assets } from 'premid'
import { getStrings, getSubtitle, getTitle, presence, slideshow } from '../util.js'

export type PageInput = {
  presenceData: PresenceData
  tab?: string | null
  id?: string
  mode: string
} & Record<string, unknown>

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
    else if (mode === 'submit') {
      presenceData.details = strings.submit
    }
    else if (tab) {
      useSlideshow = await this.executeTab(presenceData, tab)
    }
    else if (id) {
      useSlideshow = await this.executeView(presenceData)
    }
    else {
      presenceData.details = strings.browsing
    }
    presence.setActivity(useSlideshow ? slideshow : presenceData)
  }

  async executeBrowse(_presenceData: PresenceData): Promise<boolean> {
    return false
  }

  async executeView(_presenceData: PresenceData): Promise<boolean> {
    return false
  }

  async executeTab(presenceData: PresenceData, _tab: string): Promise<boolean> {
    await this.executeView(presenceData)
    presenceData.state = getSubtitle()
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = getTitle()
    return false
  }
}
