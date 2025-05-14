import {
  addButton,
  registerSlideshowKey,
  slideshow,
  useActive,
} from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      presenceData.details = 'Viewing Tier List'

      const title
        = document.querySelector('.tier-list-header .title span')?.textContent
          ?? ''
      const characters
        = document.querySelectorAll<HTMLDivElement>('.avatar-card')
      if (
        registerSlideshowKey(
          `ash-echoes-tier-list-${title}-${characters.length}`,
        )
      ) {
        for (const character of characters) {
          const link = character.querySelector('a')
          const data: PresenceData = {
            ...presenceData,
            state: title,
            smallImageKey:
              character.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${character.querySelector('.emp-name')?.textContent}`,
          }
          addButton(data, { label: 'View Character', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
    case 'memory-traces': {
      const { active } = useActive(
        document.querySelector('ash-traces-container'),
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
