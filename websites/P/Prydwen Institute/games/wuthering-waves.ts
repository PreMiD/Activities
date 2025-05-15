import { addButton, registerSlideshowKey, slideshow } from '../util.js'

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
      const selection = document.querySelector('.tier-list-switcher .selected')
      const characters = document.querySelectorAll('.avatar-card')
      presenceData.details = 'Browsing Tier List'
      presenceData.state = selection
      if (registerSlideshowKey(`wuthering-waves-tier-list-${selection?.textContent}-${characters.length}`)) {
        for (const character of characters) {
          const link = character.querySelector('a')
          const image = character.querySelector<HTMLImageElement>('[data-main-image]')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: image,
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${image?.alt}`,
          }
          addButton(data, { label: 'View Character', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
  }
}
