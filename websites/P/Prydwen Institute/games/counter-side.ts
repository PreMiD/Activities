import {
  addButton,
  registerSlideshowKey,
  slideshow,
  usePathCache,
} from '../util.js'

interface ActiveOperatorData {
  active: HTMLDivElement | null
}

function useActive(): ActiveOperatorData {
  return usePathCache<ActiveOperatorData>((data) => {
    const observer = new MutationObserver((changes) => {
      for (const change of changes) {
        switch (change.type) {
          case 'attributes': {
            if (change.attributeName === 'aria-expanded') {
              const target = change.target as HTMLElement
              if (target.getAttribute('aria-expanded') === 'true') {
                data.active = target.closest('.single-operator')
                return
              }
              data.active = null
            }
            break
          }
          case 'childList': {
            // searching or changing filters
            data.active = null
            return
          }
        }
      }
    })
    const operatorContainer = document.querySelector(
      '.operator-simplified-view',
    )
    if (!operatorContainer) {
      return null
    }
    observer.observe(operatorContainer, {
      subtree: true,
      childList: true,
      attributes: true,
    })
    return () => observer.disconnect()
  })
}

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'operators': {
      const { active } = useActive()
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
      const { active } = useActive()
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
