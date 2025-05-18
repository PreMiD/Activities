import { Assets } from 'premid'
import { applyItemList, applyTierList } from '../lists.js'
import { addButton, registerSlideshowKey, slideshow, useActive } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      presenceData.details = 'Browsing Tier List'
      if (document.querySelector('.pyramid-variant.selected')) {
        // default view
        applyTierList(presenceData, {
          key: 'etheria-restart-tier-list-default',
          useSelection: true,
          nameSource: 'image',
          hasLink: true,
          customSelectionSelector: '.tier-list-switcher:not(.type) .selected',
        })
      }
      else {
        // table view
        presenceData.state = 'Table View'
        const characters = document.querySelectorAll('.tier-list-row')
        if (registerSlideshowKey(`etheria-restart-tier-list-table-${characters.length}`)) {
          for (const character of characters) {
            const image = character.querySelector<HTMLImageElement>('.character [data-main-image]')
            const link = character.querySelector<HTMLAnchorElement>('.character a')
            const rows = character.querySelectorAll('[class=column]')
            const name = character.querySelector('.character .inline-name')
            for (const row of rows) {
              const data: PresenceData = {
                ...presenceData,
                smallImageKey: image,
                smallImageText: `${row.textContent} - ${name?.textContent}`,
              }
              addButton(data, { label: 'View Character', url: link })
              slideshow.addSlide(`${link?.href}-${row.textContent}`, data, 5000)
            }
          }
        }
      }
      return true
    }
    case 'characters-builds': {
      const { active } = useActive(document.querySelector('.builds-container'))
      if (active) {
        presenceData.details = 'Viewing a Character Build'
        presenceData.state = active.querySelector('.name')
        presenceData.smallImageKey = active.querySelector<HTMLImageElement>('[data-main-image]')
        addButton(presenceData, { label: 'View Character', url: active.querySelector('a') })
      }
      else {
        presenceData.details = 'Browsing Character Builds'
      }
      break
    }
    case 'teams-database': {
      presenceData.details = 'Browsing Teams'

      const search = document.querySelector('input')
      const [mainFilter, subFilter] = document.querySelectorAll('.teams-filter .selected')
      if (registerSlideshowKey(`etheria-restart-teams-${mainFilter?.textContent}-${subFilter?.textContent}-${search?.value}`)) {
        const teams = document.querySelectorAll('.etheria-team')
        for (const team of teams) {
          const header = team.querySelector('.team-header .skill-name')?.textContent
          presenceData.state = `${mainFilter?.textContent} - ${subFilter?.textContent} - ${header}`
          const data: PresenceData = { ...presenceData, smallImageKey: Assets.Question, smallImageText: [...team.querySelectorAll('.emp-name')].map(node => node.textContent).join(', '),
          }
          slideshow.addSlide(header ?? '', data, 5000)
        }
      }
      return true
    }
    case 'shells': {
      presenceData.details = 'Browsing Shells'
      applyItemList(presenceData, {
        key: 'etheria-restart-shells',
        nameSelector: 'h4',
        itemSelector: '.single-shell',
      })
      return true
    }
    case 'matrix-effects': {
      presenceData.details = 'Browsing Matrix Effects'
      break
    }
  }
}
