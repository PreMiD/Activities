import { activateIntersectionObservers, getSection, slideshow } from '../util.js'

export default function applyMainHostDetails(
  presenceData: PresenceData,
  pathList: string[],
): void {
  switch (pathList[0] ?? '') {
    case '': {
      activateIntersectionObservers(pathList)
      switch (getSection()) {
        case '': {
          presenceData.details = 'Browsing the home page'
          break
        }
        case 'cont2': {
          presenceData.details = 'Reading FEH Lore'
          presenceData.state = document.querySelector<HTMLImageElement>(
            '#storySlide .flex-active .on',
          )?.alt
          break
        }
        case 'cont4': {
          const heroName = document.querySelector<HTMLHeadingElement>(
            '.characterSlide-summery-item.active h3',
          )?.textContent
          presenceData.details = 'Meeting the Heroes'
          presenceData.state = heroName
          presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
            '#characterSlide .flex-active-slide img',
          )?.src
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
            '.characterSlide-thumb-item.flex-active',
          )?.src
          presenceData.smallImageText = heroName
        }
      }
      break
    }
    case 'countries': {
      presenceData.details = 'Viewing game availability'
      break
    }
    case 'illustrations': {
      const images = [
        ...document.querySelectorAll<HTMLImageElement>(
          '#topics-detail-content img',
        ),
      ]
      for (const image of images) {
        const tmpData: PresenceData = Object.assign({}, presenceData)
        tmpData.details = 'Browsing illustrations'
        tmpData.largeImageKey = image.src
        slideshow.addSlide(image.getAttribute('src')!, tmpData, 5e3)
      }
      break
    }
    case 'manga': {
      if (pathList[1]) {
        presenceData.details = 'Reading A Day in the Life'
        presenceData.buttons = [
          { label: 'Read Manga', url: document.location.href },
        ]
      }
      else {
        presenceData.details = 'Browsing manga'
      }

      break
    }
    case 'system': {
      presenceData.details = 'Reading about the gameplay'
      break
    }
    case 'topics': {
      activateIntersectionObservers(pathList)
      presenceData.details = 'Browsing articles'
      if (getSection()) {
        const articleContainer = document.querySelector<HTMLDivElement>(
          `#${getSection()}`,
        )

        presenceData.state = `${
          articleContainer?.querySelector<HTMLParagraphElement>('.heading')
            ?.textContent
        } - ${
          articleContainer?.querySelector<HTMLSpanElement>('.date')?.textContent
        }`
        presenceData.largeImageKey = articleContainer?.querySelector<HTMLImageElement>(
          '.img > img',
        )?.src
        presenceData.buttons = [
          {
            label: 'Read Article',
            url: `${document.location.href}#${getSection()}`,
          },
        ]
      }
      break
    }
  }
}
