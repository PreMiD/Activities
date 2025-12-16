import { applyItemList } from '../lists.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      presenceData.details = 'Viewing Tier List'
      break
    }
    case 'weapons': {
      presenceData.details = 'Browsing Weapons'
      applyItemList(presenceData, {
        key: 'arknights-endfield-weapons',
        nameSelector: 'h4',
        itemSelector: '.endfield-weapon-box.box',
      })
      return true
    }
    case 'gear': {
      presenceData.details = 'Browsing Gear'
      break
    }
  }
}
