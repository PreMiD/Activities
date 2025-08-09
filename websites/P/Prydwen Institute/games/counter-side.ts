import { applyTierList } from '../lists.js'
import { useActive } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'operators': {
      const { active } = useActive(document.querySelector(
        '.operator-simplified-view',
      ))
      if (active) {
        presenceData.details = 'Viewing an Operator'
        presenceData.state = `${active.querySelector('.name')?.textContent} - ${active.querySelector('.nav-link.active')?.textContent}`
        presenceData.smallImageKey = active.querySelector<HTMLImageElement>('[data-main-image]')
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
        presenceData.smallImageKey = active.querySelector<HTMLImageElement>('[data-main-image]')
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
      applyTierList(presenceData, {
        key: 'counter-side-tier-list',
        useSelection: true,
        nameSource: 'image',
        hasLink: true,
      })
      return true
    }
  }
}
