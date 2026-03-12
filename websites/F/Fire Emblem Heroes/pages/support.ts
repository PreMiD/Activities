import { slideshow } from '../util.js'

export default function applySupportDetails(
  presenceData: PresenceData,
  pathList: string[],
): void {
  switch (pathList[0]) {
    case 'mjolnir': {
      switch (pathList[1] ?? '') {
        case '': {
          presenceData.details = 'Reading about Mjölnir\'s Strike'
          break
        }
        case 'archives': {
          presenceData.details = 'Viewing Mjölnir\'s Strike archives'
          break
        }
        case 'terms': {
          presenceData.details = `Viewing Mjölnir's Strike: ${
            document.querySelector<HTMLDivElement>('.subtitle-section-white')
              ?.textContent
          }`
          presenceData.state = `Askr: ${
            document.querySelector('.battle-left .battle-score')?.textContent
          } vs. Strike: ${
            document.querySelector('.battle-right .battle-score')?.textContent
          }`
          presenceData.buttons = [
            { label: 'View Situation', url: document.location.href },
          ]
          break
        }
      }
      break
    }
    case 'voting_gauntlet': {
      switch (pathList[1]) {
        case 'howtoplay': {
          presenceData.details = 'Reading about Voting Gauntlet'
          break
        }
        case 'archives': {
          presenceData.details = 'Viewing Voting Gauntlet archives'
          break
        }
        case 'tournaments': {
          presenceData.details = `Viewing Gauntlet: ${
            document.querySelector<HTMLSpanElement>('h4 > span')?.textContent
          }`
          presenceData.buttons = [
            { label: 'View Gauntlet', url: document.location.href },
          ]
          const roundSections = [
            ...document.querySelectorAll('.body-section-tournament'),
          ].filter(section => !!section.querySelector('h2'))
          for (let i = roundSections.length - 1; i >= 0; i--) {
            for (const [j, battle] of [
              ...(roundSections[i]?.querySelectorAll<HTMLDivElement>(
                '.tournaments-battle',
              ) ?? []),
            ].entries()) {
              const nameElements = [
                ...battle.querySelectorAll<HTMLParagraphElement>('.name'),
              ]
              const names = nameElements.map(name => name.textContent)
              const scores = nameElements.map(
                name => name.nextElementSibling?.textContent,
              )
              const winningImage = getComputedStyle(
                battle.querySelector<HTMLDivElement>('.tournaments-art-win')!
                  .parentElement!,
              )?.backgroundImage.match(/url\(['"]?(.+?)["']?\)/)?.[1]
              const tmpData: PresenceData = Object.assign({}, presenceData)
              tmpData.state = `Round ${roundSections.length - i}: ${
                names[0]
              } vs. ${names[1]}`
              tmpData.smallImageKey = winningImage
              tmpData.smallImageText = `${scores[0]} vs. ${scores[1]}`
              slideshow.addSlide(`round${i}battle${j}`, tmpData, 5e3)
            }
          }
          break
        }
      }
      break
    }
  }
}
