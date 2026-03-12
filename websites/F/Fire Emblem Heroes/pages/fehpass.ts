import { Assets } from 'premid'

import { truncateText } from '../util.js'

export default function applyFehPassDetails(
  presenceData: PresenceData,
  pathList: string[],
): void {
  switch (pathList[0] ?? '') {
    case '': {
      presenceData.details = 'Browsing FEH Pass'
      break
    }
    case 'faq': {
      presenceData.details = 'Reading FEH Pass FAQ'
      break
    }
    case 'talk': {
      if (pathList[1]) {
        const activeText = document.querySelector<HTMLLIElement>('.text.active')
        presenceData.details = 'Reading FEH Pass Talk'
        presenceData.state = `${
          document.querySelector<HTMLLIElement>('.chara_name.anime')?.textContent
        }: ${
          [...activeText?.classList ?? []].find(c => /\d$/.test(c))?.match(/\d+/)?.[0]
        } / ${
          [
            ...document.querySelector<HTMLLIElement>('.text:last-of-type')
              ?.classList ?? [],
          ]
            .find(c => /\d$/.test(c))
            ?.match(/\d+/)?.[0]
        }`
        presenceData.smallImageKey = Assets.Question
        presenceData.smallImageText = truncateText(activeText?.textContent ?? '')
        presenceData.buttons = [
          { label: 'View Talk', url: document.location.href },
        ]
      }
      else {
        presenceData.details = 'Browsing FEH Pass Talk'
      }
      break
    }
    default: {
      presenceData.details = 'Viewing a Resplendent Hero'
      presenceData.state = `${
        document.querySelector<HTMLParagraphElement>('.chara_name')?.textContent
      }: ${
        document.querySelector<HTMLParagraphElement>('.chara_catch')?.textContent
      }`
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '.chara_icon > img',
      )?.src
      presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
        '.mini_img > img',
      )?.src
      presenceData.smallImageText = truncateText(
        document.querySelector('.chara_wrap > p:last-child')?.textContent ?? '',
      )
      presenceData.buttons = [
        { label: 'View Hero', url: document.location.href },
      ]
    }
  }
}
