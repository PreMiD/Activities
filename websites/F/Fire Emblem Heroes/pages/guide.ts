import { slideshow, truncateText } from '../util.js'

export default function applyGuideDetails(
  presenceData: PresenceData,
  pathList: string[],
): void {
  switch (pathList[0] ?? '') {
    case '': {
      presenceData.details = 'Browsing the Guide'
      break
    }
    case 'category': {
      if (pathList[1] === 'character') {
        presenceData.details = 'Browsing the Guide: Character List'
        presenceData.state = document.querySelector<HTMLSelectElement>(
          '.select_character',
        )?.selectedOptions[0]?.textContent
      }
      else if (pathList[1] === 'comeback') {
        switch (pathList[2] ?? '') {
          case '': {
            presenceData.details = 'Browsing the Guide: Returner Tips'
            break
          }
          case 'elementary':
          case 'intermediate':
          case 'advanced': {
            presenceData.details = 'Browsing the Guide: Advanced Training Tips'
            presenceData.details = `Browsing the Guide: ${pathList[2]?.[0]?.toUpperCase()}${pathList[2]?.slice(
              1,
            )} Training Tips`
            break
          }
          case 'weapon': {
            presenceData.details = 'Browsing the Guide: List of Weapons'
            presenceData.state = document.querySelector<HTMLSelectElement>(
              '.select_weapon',
            )?.selectedOptions[0]?.textContent
            break
          }
        }
      }
      break
    }
    default: {
      const characterImage = document.querySelector<HTMLImageElement>(
        '.sec_gif > img',
      )?.src
      const characterDescriptions = [...document.querySelectorAll('dl dt')].map(
        dt => ({
          text: dt.textContent,
          image: dt.nextElementSibling?.querySelector('img')?.src,
        }),
      )
      presenceData.details = `Reading about ${
        document.querySelector<HTMLHeadingElement>('.sec_charaname')?.textContent
      }: ${
        document.querySelector<HTMLParagraphElement>('.sec_charanick')?.textContent
      }`
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '.slick-slide.slick-current img',
      )?.src
      presenceData.smallImageKey = characterImage
      presenceData.buttons = [
        { label: 'View Character', url: document.location.href },
      ]
      slideshow.addSlide(characterImage!, presenceData, 5e3)
      for (const description of characterDescriptions) {
        const tmpData: PresenceData = Object.assign({}, presenceData)
        tmpData.smallImageText = truncateText(description.text ?? '')
        tmpData.smallImageKey = description.image
        slideshow.addSlide(description.image!, tmpData, 5e3)
      }
    }
  }
}
