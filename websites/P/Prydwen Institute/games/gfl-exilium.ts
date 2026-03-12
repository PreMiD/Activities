import { applyItemList, applyTierList } from '../lists.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'weapons': {
      presenceData.details = 'Browsing Weapons'
      applyItemList(presenceData, {
        key: 'gfl-exilium-weapons',
        nameSelector: 'h4',
        itemSelector: '.gfl-weapon-box',
      })
      return true
    }
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 'gfl-exilium-tier-list',
        useSelection: true,
        nameSource: 'emp-name',
        hasLink: true,
      })
      return true
    }
  }
}
