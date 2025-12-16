import { applyTierList } from '../lists.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 'eversoul-tier-list',
        useSelection: true,
        nameSource: 'image',
        hasLink: true,
        customAvatarSelector: '.char-card',
      })
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
