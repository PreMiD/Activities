import { applyItemList, applyTierList } from '../lists.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'echoes': {
      const filter = document.querySelector('.echoes-filter .selected')
      presenceData.details = 'Browsing Echoes'
      presenceData.state = filter
      applyItemList(presenceData, {
        key: `wuthering-waves-echoes-${filter?.textContent}`,
        nameSelector: 'h4',
        itemSelector: '.ww-echo-box',
      })
      return true
    }
    case 'weapons': {
      presenceData.details = 'Browsing Weapons'
      const selection = document.querySelector('.weapon-filter .selected')
      presenceData.state = selection
      applyItemList(presenceData, {
        key: `wuthering-waves-weapons-${selection?.textContent}`,
        nameSelector: 'h4',
        itemSelector: '.ww-weapon-box',
      })
      return true
    }
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 'wuthering-waves-tier-list',
        nameSource: 'image',
        useSelection: true,
        hasLink: true,
      })
      return true
    }
  }
}
