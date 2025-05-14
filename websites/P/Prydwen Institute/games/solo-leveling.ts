import { Assets } from 'premid'
import { addButton, registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'weapons': {
      presenceData.details = 'Browsing Weapons'
      const weapons = document.querySelectorAll('.solo-weapon-box')
      if (registerSlideshowKey(`solo-leveling-weapons-${weapons.length}`)) {
        for (const weapon of weapons) {
          const name = weapon.querySelector('h4')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey:
              weapon.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: name,
          }
          slideshow.addSlide(name?.textContent ?? '', data, 5000)
        }
      }
      return true
    }
    case 'tier-list': {
      const characters = document.querySelectorAll('.avatar-card')
      presenceData.details = 'Browsing Tier List'
      if (
        registerSlideshowKey(`solo-leveling-tier-list-${characters.length}`)
      ) {
        for (const character of characters) {
          const link = character.querySelector('a')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey:
              character.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${character.querySelector('.emp-name')}`,
          }
          addButton(data, { label: 'View Character', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
    case 'tier-list-weapons': {
      const weapons = document.querySelectorAll('.avatar-card')
      presenceData.details = 'Browsing Weapon Tier List'
      if (
        registerSlideshowKey(`solo-leveling-weapon-tier-list-${weapons.length}`)
      ) {
        for (const character of weapons) {
          const name = character.querySelector('.emp-name')?.textContent ?? ''
          const data: PresenceData = {
            ...presenceData,
            smallImageKey:
              character.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${name}`,
          }
          slideshow.addSlide(name, data, 5000)
        }
      }
      return true
    }
    case 'team-database': {
      presenceData.details = 'Browsing Teams'
      const teams = document.querySelectorAll('.solo-team')
      if (registerSlideshowKey(`solo-leveling-teams-${teams.length}`)) {
        for (const team of teams) {
          const mainName = `${team.querySelector('.skill-name')?.textContent} - ${team.querySelector('.skill-type strong')?.textContent}`
          const subTeams = team.querySelectorAll('.solo-team-custom')
          for (const sub of subTeams) {
            const subName = sub.previousElementSibling?.textContent
            const data: PresenceData = {
              ...presenceData,
              state: `${mainName} - ${subName}`,
              smallImageKey: Assets.Question,
              smallImageText: [...sub.querySelectorAll('.single-char')]
                .map(
                  char =>
                    char.querySelector<HTMLImageElement>('[data-main-image]')
                      ?.alt,
                )
                .join(', '),
            }
            slideshow.addSlide(`${mainName}-${subName}`, data, 5000)
          }
        }
      }
      return true
    }
  }
}
