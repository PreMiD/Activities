import { applyItemList, applyTierList } from '../lists.js'
import { useActive } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'characters': {
      // adjust terminology
      if (pathList[1]) {
        presenceData.details = 'Viewing an Agent'
        presenceData.buttons = [{ label: 'View Agent', url: document.location.href }]
      }
      else {
        presenceData.details = 'Browsing Agents'
      }
      break
    }
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 'zenless-tier-list',
        useSelection: false,
        nameSource: 'image',
        hasLink: true,
        customLinkLabel: 'View Agent',
      })
      return true
    }
    case 'shiyu-defense': {
      presenceData.details = 'Reading About Shiyu Defense Analytics'
      break
    }
    case 'deadly-assault': {
      presenceData.details = 'Reading About Deadly Assault Analytics'
      break
    }
    case 'bangboo': {
      const { active } = useActive(document.querySelector('.bangboo-simplified-view'))
      if (active) {
        presenceData.details = 'Viewing a Bangboo'
        presenceData.state = active.querySelector('.name')
        presenceData.smallImageKey = active.querySelector<HTMLImageElement>('[data-main-image]')
        presenceData.smallImageText = active.querySelector('.nav-link.active')
      }
      else {
        presenceData.details = 'Browsing Bangboo'
      }
      break
    }
    case 'w-engines': {
      presenceData.details = 'Browsing W-Engines'
      applyItemList(presenceData, {
        key: 'zenless-w-enginess',
        nameSelector: 'h5',
        itemSelector: '.zzz-engine',
      })
      return true
    }
    case 'disk-drives': {
      presenceData.details = 'Browsing Drive Disks'
      applyItemList(presenceData, {
        key: 'zenless-w-engines',
        nameSelector: 'h5',
        itemSelector: '.zzz-disk-set',
      })
      return true
    }
  }
}
