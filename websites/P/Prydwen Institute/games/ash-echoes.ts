import { applyTierList } from '../lists.js'
import {
  addButton,
  registerSlideshowKey,
  slideshow,
  useActive,
} from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 'ash-echoes-tier-list',
        useSelection: true,
        nameSource: 'emp-name',
        hasLink: true,
      })
      return true
    }
    case 'memory-traces': {
      const { active } = useActive(
        document.querySelector('.ash-traces-container'),
      )
      if (active) {
        presenceData.details = 'Viewing a Memory Trace'
        presenceData.state = `${active.querySelector('.name')?.textContent} - ${active.querySelector('.nav-link.active')?.textContent}`
      }
      else {
        presenceData.details = 'Browsing Memory Traces'
      }
      break
    }
    case 'tea-time': {
      presenceData.details = 'Browsing Character\'s Drink Preferences'

      const characters
        = document.querySelector('.tea-time-container')?.children ?? []
      if (registerSlideshowKey(`ash-echoes-tea-time-${characters.length}`)) {
        for (const character of characters) {
          const characterContainer = character.querySelector('.avatar-card')
          const drinkRows = character.querySelectorAll(
            '.tea-time .tea-time-row:not(.header)',
          )
          const link = characterContainer?.querySelector('a')

          for (const drinkRow of drinkRows) {
            const data: PresenceData = {
              ...presenceData,
              state: characterContainer?.querySelector('.emp-name'),
              smallImageKey:
                characterContainer?.querySelector<HTMLImageElement>(
                  '[data-main-image]',
                ),
              smallImageText: drinkRow.children[2],
            }
            addButton(data, { label: 'View Character', url: link ?? '' })
            slideshow.addSlide(link?.href ?? '', data, 5000)
          }
        }
      }
      return true
    }
  }
}
