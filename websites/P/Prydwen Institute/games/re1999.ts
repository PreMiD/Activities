import { Assets } from 'premid'
import { applyTierList } from '../lists.js'
import { filterScripts, registerSlideshowKey, slideshow, useActive } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 're1999-tier-list',
        useSelection: false,
        nameSource: 'emp-name',
        hasLink: true,
      })
      return true
    }
    case 'psychubes': {
      const { active } = useActive(document.querySelector('.psychube-simplified-view'))
      if (active) {
        presenceData.details = 'Viewing a Psychube'
        presenceData.state = filterScripts(active.querySelector('h2'))
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
