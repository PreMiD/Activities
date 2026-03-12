import { applyTierList } from '../lists.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 'nikke-tier-list',
        useSelection: true,
        nameSource: 'emp-name',
        hasLink: true,
      })
      return true
    }
  }
}
