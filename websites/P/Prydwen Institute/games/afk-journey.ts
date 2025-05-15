import { applyTierList } from '../lists.js'
import { addButton, registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      const title
        = document.querySelector('.tier-list-header .title span')?.textContent
          ?? ''
      presenceData.details = 'Viewing Tier List'
      presenceData.state = title
      if (title.includes('Dream Realm Only')) {
        const characters = document.querySelectorAll<HTMLDivElement>('.tier-list-row')
        if (registerSlideshowKey(`afk-journey-tier-list-dream-realm-${characters.length}`)) {
          for (const character of characters) {
            const image = character.querySelector<HTMLImageElement>('[data-main-image]')
            const name = character.querySelector('.emp-name')
            const comparisons = character.querySelectorAll('.column.dream')
            const link = character.querySelector<HTMLAnchorElement>('.character a')
            for (const comparison of comparisons) {
              const data: PresenceData = {
                ...presenceData,
                smallImageKey: image,
                smallImageText: `${comparison.textContent} - ${name?.textContent}`,
              }
              addButton(data, { label: 'View Character', url: link })
              slideshow.addSlide(`${link?.href} - ${comparison.textContent}`, data, 5000)
            }
          }
        }
      }
      else {
        applyTierList(presenceData, {
          key: 'afk-journey-tier-list',
          useSelection: false,
          nameSource: 'emp-name',
          hasLink: true,
        })
      }
      return true
    }
    case 'team-builder': {
      presenceData.details = 'Reading About Team Builder'
      break
    }
  }
}
