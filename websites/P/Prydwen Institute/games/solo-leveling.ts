import { Assets } from 'premid'
import { applyTierList } from '../lists.js'
import { registerSlideshowKey, slideshow } from '../util.js'

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
      applyTierList(presenceData, {
        key: 'solo-leveling-tier-list',
        useSelection: false,
        nameSource: 'emp-name',
        hasLink: true,
      })
      return true
    }
    case 'tier-list-weapons': {
      applyTierList(presenceData, {
        key: 'solo-leveling-weapon-tier-list',
        useSelection: false,
        nameSource: 'emp-name',
        hasLink: false,
      })
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
