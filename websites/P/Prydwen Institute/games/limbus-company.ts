import { addButton, registerSlideshowKey, slideshow, useActive } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'identities': {
      if (pathList[1]) {
        presenceData.details = 'Viewing an Identity'
        presenceData.state = `${document.querySelector('h1')?.textContent} - ${document.querySelector('.single-tab.active')?.textContent}`
        presenceData.smallImageKey
          = document.querySelector<HTMLImageElement>(
            '.character-header .gatsby-image-wrapper [data-main-image]',
          )
        presenceData.smallImageText = document.querySelector('h2')
        addButton(presenceData, {
          label: 'View Identity',
          url: document.location.href,
        })
      }
      else {
        presenceData.details = 'Browsing Identities'
      }
      break
    }
    case 'ego': {
      const { active } = useActive(document.querySelector('.ego-simplified-view'))
      if (active) {
        presenceData.details = 'Viewing an EGO'
        presenceData.state = active.querySelector('h2.name')
        presenceData.smallImageKey = active.querySelector<HTMLImageElement>('[data-main-image]')
        presenceData.smallImageText = active.querySelector('.nav-item button[selected=true]')
      }
      else {
        presenceData.details = 'Browsing EGOs'
      }
      break
    }
    case 'tier-list': {
      const selection = document.querySelector('.tier-list-switcher .selected')
      const characters = document.querySelectorAll('.avatar-card')
      presenceData.details = 'Browsing Tier List'
      presenceData.state = selection
      if (registerSlideshowKey(`limbus-company-tier-list-${selection?.textContent}-${characters.length}`)) {
        for (const character of characters) {
          const link = character.querySelector('a')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: character.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${character.querySelector('.name')?.textContent}`,
          }
          addButton(data, { label: 'View Identity', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
    case 'team-database': {
      presenceData.details = 'Browsing Teams'
      break
    }
    case 'team-builder': {
      presenceData.details = 'Building a Team'
      const activeCharacters = [...document.querySelectorAll('.character-box')]
      if (activeCharacters.length) {
        const key = activeCharacters.map(char => char.querySelector('h5')?.textContent).join('-')
        if (registerSlideshowKey(`limbus-company-team-build-${key}`)) {
          for (const character of activeCharacters) {
            const name = character.querySelector('h5')
            const data: PresenceData = {
              ...presenceData,
              smallImageKey: character.querySelector<HTMLImageElement>('[data-main-image]'),
              smallImageText: name,
            }
            slideshow.addSlide(name?.textContent ?? '', data, 5000)
          }
        }
        return true
      }
      break
    }
  }
}
