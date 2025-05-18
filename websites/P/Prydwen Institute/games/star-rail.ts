import { applyItemList, applyTierList } from '../lists.js'
import { registerSlideshowKey, slideshow } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'tier-list': {
      applyTierList(presenceData, {
        key: 'star-rail-tier-list',
        useSelection: true,
        nameSource: 'image',
        hasLink: true,
      })
      return true
    }
    case 'memory-of-chaos': {
      presenceData.details = 'Reading About Memory of Chaos Analytics'
      break
    }
    case 'pure-fiction': {
      presenceData.details = 'Reading About Pure Fiction Analytics'
      break
    }
    case 'apocalyptic-shadow': {
      presenceData.details = 'Reading About Apocalyptic Shadow Analytics'
      break
    }
    case 'light-cones': {
      presenceData.details = 'Browsing Light Cones'
      applyItemList(presenceData, {
        key: 'star-rail-light-cones',
        nameSelector: 'h4',
        itemSelector: '.hsr-cone-box',
      })
      return true
    }
    case 'guides': {
      if (pathList[1] === 'relic-sets') {
        presenceData.details = 'Browsing Relic Sets'
        applyItemList(presenceData, {
          key: 'star-rail-light-cones',
          nameSelector: 'h4',
          itemSelector: '.hsr-relic-box',
        })
        return true
      }
      break
    }
    case 'tools': {
      presenceData.details = 'Browsing Tools'
      break
    }
    case 'character-builder': {
      presenceData.details = 'Reading About Character Builder'
      break
    }
    case 'team-builder': {
      presenceData.details = 'Building a Team'
      const activeCharacters = [...document.querySelectorAll('.character-box')]
      if (activeCharacters.length) {
        const key = activeCharacters.map(char => char.querySelector('h5')?.textContent).join('-')
        if (registerSlideshowKey(`star-rail-team-${key}`)) {
          for (const character of activeCharacters) {
            const name = character.querySelector('h5')
            const data: PresenceData = {
              ...presenceData,
              state: character.closest('.box')?.querySelector<HTMLSelectElement>('.select-role select')?.selectedOptions[0]?.textContent,
              smallImageKey: character.querySelector<HTMLImageElement>('[data-main-image]'),
              smallImageText: name,
            }
            slideshow.addSlide(name?.textContent ?? '', data, 5000)
          }
        }
        return true
      }
      break
    }
    case 'draft': {
      presenceData.details = 'Reading About Draft Tool'
      break
    }
  }
}
