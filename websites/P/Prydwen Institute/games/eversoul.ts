import { addButton, registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      const filter = document.querySelector('.tier-list-switcher .selected')
      presenceData.details = 'Viewing Tier List'
      presenceData.state = filter
      const characters = document.querySelectorAll('.char-card')
      if (
        registerSlideshowKey(
          `eversoul-tier-list-${filter?.textContent}-${characters.length}`,
        )
      ) {
        for (const character of characters) {
          const image
            = character.querySelector<HTMLImageElement>('[data-main-image]')
          const link = character.querySelector('a')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: image,
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${image?.alt}`,
          }
          addButton(data, { label: 'View Character', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
    case 'teams-database': {
      presenceData.details = 'Browsing Teams'
      presenceData.state = [...document.querySelectorAll('.custom-dropdown')]
        .map(selection => selection.textContent)
        .join(' - ')
      break
    }
    case 'builds': {
      presenceData.details = 'Browsing Builds'
      presenceData.state = document.querySelector('.build-switcher .selected')
      break
    }
  }
}
