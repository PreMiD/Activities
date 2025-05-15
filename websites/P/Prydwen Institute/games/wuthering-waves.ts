import { applyTierList } from '../lists.js'
import { registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'echoes': {
      presenceData.details = 'Browsing Echoes'
      const filter = document.querySelector('.echoes-filter .selected')
      presenceData.state = filter
      const echoes = document.querySelectorAll('.ww-echo-box')
      if (registerSlideshowKey(`wuthering-waves-echoes-${filter?.textContent}-${echoes.length}`)) {
        for (const echo of echoes) {
          const name = echo.querySelector('h4')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: echo.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: name,
          }
          slideshow.addSlide(name?.textContent ?? '', data, 5000)
        }
      }
      return true
    }
    case 'weapons': {
      const selection = document.querySelector('.weapon-filter .selected')
      presenceData.details = 'Browsing Weapons'
      presenceData.state = selection
      const weapons = document.querySelectorAll('.ww-weapon-box')
      if (registerSlideshowKey(`wuthering-waves-weapons-${selection?.textContent}-${weapons.length}`)) {
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
        key: 'wuthering-waves-tier-list',
        nameSource: 'image',
        useSelection: true,
        hasLink: true,
      })
      return true
    }
  }
}
