import {
  addButton,
  registerSlideshowKey,
  slideshow,
  useActive,
} from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'operators': {
      const { active } = useActive(document.querySelector(
        '.operator-simplified-view',
      ))
      if (active) {
        presenceData.details = 'Viewing an Operator'
        presenceData.state = `${active.querySelector('.name')?.textContent} - ${active.querySelector('.nav-link.active')?.textContent}`
        presenceData.smallImageKey = active.querySelector('img')
        presenceData.smallImageText = [
          ...(active.querySelector('.details')?.children ?? []),
        ]
          .map(child => child.textContent)
          .join(' ')
      }
      else {
        presenceData.details = 'Browsing Operators'
      }
      break
    }
    case 'ships': {
      const { active } = useActive(document.querySelector(
        '.operator-simplified-view',
      ))
      if (active) {
        presenceData.details = 'Viewing a Ship'
        presenceData.state = `${active.querySelector('.name')?.textContent} - ${active.querySelector('.nav-link.active')?.textContent}`
        presenceData.smallImageKey = active.querySelector('img')
        presenceData.smallImageText = [
          ...(active.querySelector('.details')?.children ?? []),
        ]
          .map(child => child.textContent)
          .join(' ')
      }
      else {
        presenceData.details = 'Browsing Ships'
      }
      break
    }
    case 'tier-list': {
      const category = document.querySelector('.tier-list-switcher .selected')
      presenceData.details = 'Viewing Tier List'
      presenceData.state = category
      const characters
        = document.querySelectorAll<HTMLDivElement>('.tier .avatar-card')
      if (
        registerSlideshowKey(
          `counter-side-tier-list-${category?.textContent}-${characters.length}`,
        )
      ) {
        for (const character of characters) {
          const image = character.querySelector<HTMLImageElement>(
            'img[data-main-image]',
          )
          const characterPage = character.querySelector('a')
          const rating = character
            .closest('.tier')
            ?.querySelector('.tier-rating')
          const data = {
            ...presenceData,
            smallImageKey: image,
            smallImageText: `${rating?.textContent} - ${image?.alt}`,
          }
          addButton(data, {
            label: 'View Character',
            url: character.querySelector('a'),
          })
          slideshow.addSlide(characterPage?.href ?? '', data, 5000)
        }
      }
      return true
    }
  }
}
