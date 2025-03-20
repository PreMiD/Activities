import { slideshow, squareImage } from '../util.js'

export default async function applyCYLDetails(
  presenceData: PresenceData,
  pathList: string[],
): Promise<void> {
  const campaignTitle = document.querySelector<HTMLDivElement>('.campaigns-title')?.textContent
    ?? document.title.match(/(?<=-\s).+?(?=$|\s-)/)?.[0]
    ?? document.title
  presenceData.buttons = [
    { label: 'View Campaign', url: document.location.href },
  ]
  switch (pathList[0] ?? '') {
    case '': {
      presenceData.details = `Viewing ${campaignTitle}`
      break
    }
    case 'about': {
      presenceData.details = `Reading about ${campaignTitle}`
      break
    }
    case 'mypage': {
      presenceData.details = `Viewing ${campaignTitle}`
      presenceData.state = 'Viewing their votes'
      break
    }
    case 'random': {
      presenceData.details = `Voting for ${campaignTitle}`
      presenceData.state = 'Choosing a random character'
      break
    }
    case 'result':
    case 'result-detail':
    case 'result_detail':
    case 'results': {
      if (
        new URLSearchParams(document.location.search).get('overall')
          || pathList[0]?.includes('detail')
          || (pathList[0] === 'result' && pathList[1])
      ) {
        presenceData.details = `Viewing ${campaignTitle} results`
      }
      else {
        // Note to future maintainers: The pages for each event look the same, but seem to keep changing
        // the class names for the elements between events.
        // I've tried to make this as future-proof as possible, but if it breaks, this is probably why.
        const winnerData = await Promise.all(
          [
            ...document.querySelectorAll<HTMLDivElement>(
              '.result-special-character [class*=result-special-character-wrap]',
            ),
            ...document.querySelectorAll<HTMLDivElement>('.HeroItem.-golden'),
            ...document.querySelectorAll<HTMLDivElement>(
              '.result-stand-heroes .hero',
            ),
          ].map<Promise<PresenceData>>(async (winner) => {
            let mainImage = (
              winner.querySelector<HTMLImageElement>('.result-stand > img')
              ?? winner.querySelector<HTMLImageElement>('.hero-image')
              ?? winner.querySelector<HTMLImageElement>('.HeroItem__Image')
              ?? winner.querySelector<HTMLImageElement>('p > img')
            )?.src
            if (!mainImage) {
              mainImage = getComputedStyle(
                winner.querySelector<HTMLParagraphElement>(
                  '[class*=result-stand]',
                )!,
              )?.backgroundImage.match(/url\(["']?(.+?)["']?\)/)?.[1]
            }
            let rankImage = (
              winner.querySelector<HTMLImageElement>('.star > img')
              ?? winner.querySelector<HTMLImageElement>('.icon-rank')
              ?? winner.querySelector<HTMLImageElement>('.HeroItem__Rank')
            )?.src
            if (!rankImage) {
              rankImage = getComputedStyle(
                winner,
                '::after',
              ).backgroundImage.match(/url\(['"]?(.+?)['"]?\)/)?.[1]
            }
            return {
              ...presenceData,
              details: `Viewing winners of ${campaignTitle}`,
              state: `${
                winner.querySelector(
                  '.hero-result-hero-name, .hero-name, .HeroItem__Name',
                )?.textContent
              } - ${
                winner.querySelector(
                  '.hero-result-series-name, .series-name, .HeroItem__SeriesName',
                )?.textContent
              }`,
              largeImageKey: await squareImage(mainImage!),
              smallImageKey: rankImage,
              smallImageText: `${
                winner.querySelector(
                  '.hero-result-vote-count, .HeroItem__VoteCount, .vote-count',
                )?.textContent
              } votes`,
              buttons: [{ label: 'View Results', url: document.location.href }],
            }
          }),
        )
        for (const [i, winnerDatum] of winnerData.entries())
          slideshow.addSlide(`${i}`, winnerDatum, 5e3)
      }
      break
    }
    case 'series': {
      presenceData.details = `Voting for ${campaignTitle}`
      if (pathList[1]) {
        if (pathList[pathList.length - 1] === 'heroes') {
          const seriesTitle = document.title.split(':')[1]?.trim()
          presenceData.state = seriesTitle
            ? `Selecting a character from ${seriesTitle}`
            : 'Selecting a character from a series'
          presenceData.buttons = [
            { label: 'View Series', url: document.location.href },
          ]
        }
        else {
          const characterName = document.querySelector<HTMLParagraphElement>(
            '.hero-vote-name',
          )?.textContent
          presenceData.state = characterName
            ? `Voting for ${characterName}`
            : 'Voting for a character'
          presenceData.buttons = [
            { label: 'Vote Character', url: document.location.href },
          ]
        }
      }
      else {
        presenceData.state = 'Selecting a series'
      }
      break
    }
  }
}
