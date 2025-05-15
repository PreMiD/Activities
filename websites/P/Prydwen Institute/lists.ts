import { addButton, registerSlideshowKey, slideshow } from './util.js'

interface TierListOptions {
  key: string
  useSelection: boolean
  /**
   * `image`, `header`, `emp-name`, or a custom selector
   */
  nameSource: 'image' | 'emp-name' | string
  hasLink: boolean
  customLinkLabel?: string
  customAvatarSelector?: string
  customSelectionSelector?: string
}

export function applyTierList(
  presenceData: PresenceData,
  options: TierListOptions,
): void {
  let selection = null
  presenceData.details = 'Browsing Tier List'

  if (options.useSelection) {
    selection = document.querySelector(
      options.customSelectionSelector ?? '.tier-list-switcher .selected',
    )
  }
  const items = document.querySelectorAll(
    options.customAvatarSelector ?? '.avatar-card',
  )
  if (selection) {
    presenceData.state = selection
  }
  let key = options.key
  if (selection) {
    key += `-${selection.textContent}`
  }
  key += `-${items.length}`
  if (registerSlideshowKey(key)) {
    for (const character of items) {
      const link = character.querySelector('a')
      const name = character.querySelector(
        options.nameSource === 'emp-name' ? '.emp-name' : options.nameSource,
      )
      const image = character.querySelector<HTMLImageElement>('[data-main-image]')
      const data: PresenceData = {
        ...presenceData,
        smallImageKey: image,
        smallImageText: `${character.closest('.custom-tier, .tier')?.querySelector('.tier-rating')?.textContent} - ${options.nameSource === 'image' ? image?.alt : name?.textContent}`,
      }
      if (options.hasLink) {
        addButton(data, {
          label: options.customLinkLabel ?? 'View Character',
          url: link,
        })
      }
      slideshow.addSlide(
        (options.hasLink ? link?.href : name?.textContent) ?? '',
        data,
        5000,
      )
    }
  }
}

interface ItemOptions {
  key: string
  nameSelector: string
  itemSelector: string
}

export function applyItemList(
  presenceData: PresenceData,
  options: ItemOptions,
) {
  const items = document.querySelectorAll(options.itemSelector)
  if (registerSlideshowKey(`${options.key}-${items.length}`)) {
    for (const item of items) {
      const name = item.querySelector(options.nameSelector)
      const data: PresenceData = {
        ...presenceData,
        smallImageKey: item.querySelector<HTMLImageElement>('[data-main-image]'),
        smallImageText: name,
      }
      slideshow.addSlide(
        name?.textContent ?? '',
        data,
        5000,
      )
    }
  }
}
