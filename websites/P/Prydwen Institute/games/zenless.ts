import { addButton, registerSlideshowKey, slideshow, useActive } from '../util.js'

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'characters': {
      // adjust terminology
      if (pathList[1]) {
        presenceData.details = 'Viewing an Agent'
        presenceData.buttons = [{ label: 'View Agent', url: document.location.href }]
      }
      else {
        presenceData.details = 'Browsing Agents'
      }
      break
    }
    case 'tier-list': {
      const characters = document.querySelectorAll('.avatar-card')
      presenceData.details = 'Browsing Tier List'
      if (registerSlideshowKey(`zenless-list-${characters.length}`)) {
        for (const character of characters) {
          const link = character.querySelector('a')
          const image = character.querySelector<HTMLImageElement>('[data-main-image]')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: image,
            smallImageText: `${character.closest('.custom-tier')?.querySelector('.tier-rating')?.textContent} - ${image?.alt}`,
          }
          addButton(data, { label: 'View Agent', url: link })
          slideshow.addSlide(link?.href ?? '', data, 5000)
        }
      }
      return true
    }
    case 'shiyu-defense': {
      presenceData.details = 'Reading About Shiyu Defense Analytics'
      break
    }
    case 'deadly-assault': {
      presenceData.details = 'Reading About Deadly Assault Analytics'
      break
    }
    case 'bangboo': {
      const { active } = useActive(document.querySelector('.bangboo-simplified-view'))
      if (active) {
        presenceData.details = 'Viewing a Bangboo'
        presenceData.state = active.querySelector('.name')
        presenceData.smallImageKey = active.querySelector<HTMLImageElement>('[data-main-image]')
        presenceData.smallImageText = active.querySelector('.nav-link.active')
      }
      else {
        presenceData.details = 'Browsing Bangboo'
      }
      break
    }
    case 'w-engines': {
      presenceData.details = 'Browsing W-Engines'
      const engines = document.querySelectorAll('.zzz-engine')
      if (registerSlideshowKey(`zenless-w-engines-${engines.length}`)) {
        for (const engine of engines) {
          const name = engine.querySelector('h5')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: engine.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: name,
          }
          slideshow.addSlide(name?.textContent ?? '', data, 5000)
        }
      }
      return true
    }
    case 'disk-drives': {
      presenceData.details = 'Browsing Drive Disks'
      const engines = document.querySelectorAll('.zzz-disk-set')
      if (registerSlideshowKey(`zenless-w-engines-${engines.length}`)) {
        for (const engine of engines) {
          const name = engine.querySelector('h5')
          const data: PresenceData = {
            ...presenceData,
            smallImageKey: engine.querySelector<HTMLImageElement>('[data-main-image]'),
            smallImageText: name,
          }
          slideshow.addSlide(name?.textContent ?? '', data, 5000)
        }
      }
      return true
    }
  }
}
