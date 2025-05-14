import { addButton, registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      const selection = document.querySelector('.tier-list-switcher .selected')
      const characters = document.querySelectorAll('.avatar-card')
      presenceData.details = 'Browsing Tier List'
      presenceData.state = selection
      if (registerSlideshowKey(`nikke-tier-list-${selection?.textContent}-${characters.length}`)) {
        for (const character of characters) {
          const link = character.querySelector('a')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: character.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${character.querySelector('.emp-name')}`,
          }
          addButton(data, { label: 'View Character', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
  }
}
