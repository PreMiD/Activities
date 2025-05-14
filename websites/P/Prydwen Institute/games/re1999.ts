import { Assets } from 'premid'
import { addButton, registerSlideshowKey, slideshow, useActive } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      const characters = document.querySelectorAll('.avatar-card')
      presenceData.details = 'Browsing Tier List'
      if (registerSlideshowKey(`re1999-tier-list-${characters.length}`)) {
        for (const character of characters) {
          const link = character.querySelector('a')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: character.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${character.querySelector('.emp-name')}`,
          }
          addButton(data, { label: 'View Character', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
    case 'psychubes': {
      const { active } = useActive(document.querySelector('.psychube-simplified-view'))
      if (active) {
        presenceData.details = 'Viewing a Psychube'
        presenceData.state = active.querySelector('h2')
        presenceData.smallImageKey = active.querySelector<HTMLImageElement>('[data-main-image]')
        presenceData.smallImageText = active.querySelector('.nav-link.active')
      }
      else {
        presenceData.details = 'Browsing Psychubes'
      }
      break
    }
    case 'teams-database': {
      presenceData.details = 'Browsing Teams'
      const teams = document.querySelectorAll('.rev-team')
      if (registerSlideshowKey(`re1999-teams-${teams.length}`)) {
        for (const team of teams) {
          const name = team.querySelector('.skill-name')
          const data: PresenceData = {
            ...presenceData,
            state: name,
            smallImageKey: Assets.Question,
            smallImageText: [...team.querySelectorAll('.team-details .avatar')].map(char => char.querySelector<HTMLImageElement>('[data-main-image]')?.alt).join(', '),
          }
          slideshow.addSlide(name?.textContent ?? '', data, 5000)
        }
      }
      return true
    }
  }
}
