import { applyTierList } from '../lists.js'
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
        presenceData.smallImageText = active.querySelector('.nav-link.active')
      }
      else {
        presenceData.details = 'Browsing EGOs'
      }
      break
    }
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 'limbus-company-tier-list',
        useSelection: true,
        nameSource: '.name',
        hasLink: true,
        customLinkLabel: 'View Identity',
      })
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
