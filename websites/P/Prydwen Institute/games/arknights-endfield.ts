import { registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      presenceData.details = 'Viewing Tier List'
      break
    }
    case 'weapons': {
      const weapons = document.querySelectorAll<HTMLDivElement>(
        '.endfield-weapon-box.box',
      )

      presenceData.details = 'Browsing Weapons'
      if (
        registerSlideshowKey(`arknights-endfield-weapons-${weapons.length}`)
      ) {
        for (const weapon of weapons) {
          const weaponName = weapon.querySelector('h4')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey:
              weapon.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: weaponName,
          }
          slideshow.addSlide(weaponName?.textContent ?? '', data, 5000)
        }
      }
      return true
    }
    case 'gear': {
      presenceData.details = 'Browsing Gear'
      break
    }
  }
}
