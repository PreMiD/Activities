import { addButton, registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'characters-stats': {
      const characters = [...document.querySelectorAll<HTMLDivElement>('tr')]
      const statHeaders = [...(characters.splice(0, 1)[0]?.children ?? [])]
        .slice(1)
        .map(cell => cell.textContent)

      presenceData.details = 'Browsing Character Stats'
      if (
        registerSlideshowKey(`arknights-endfield-stats-${characters.length}`)
      ) {
        for (const character of characters) {
          const link = character.querySelector('a')
          const data: PresenceData = {
            ...presenceData,
            state: character.querySelector('.char'),
            smallImageKey:
              character.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: [...character.querySelectorAll('.stat')]
              .map((stat, index) => `${stat.textContent} ${statHeaders[index]}`)
              .join(', '),
          }
          addButton(data, { label: 'View Character', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
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
