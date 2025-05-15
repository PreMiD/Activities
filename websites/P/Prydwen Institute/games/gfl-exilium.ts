import { applyTierList } from '../lists.js'
import { registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'weapons': {
      presenceData.details = 'Browsing Weapons'
      const weapons = document.querySelectorAll('.gfl-weapon-box')
      if (registerSlideshowKey(`gfl-exilium-weapons-${weapons.length}`)) {
        for (const weapon of weapons) {
          const name = weapon.querySelector('h4')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: weapon.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: name,
          }
          slideshow.addSlide(name?.textContent ?? '', data, 5000)
        }
      }
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
