const presence = new Presence({
  clientId: '833644176967991346',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const leaderboardImages: Record<string, string> = {
  '360DegreeEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/0.png',
  '360DegreeExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/1.png',
  '360DegreeExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/2.png',
  '360DegreeHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/3.png',
  '360DegreeNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/4.png',
  '360Degree': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/5.png',
  '90DegreeEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/6.png',
  '90DegreeExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/7.png',
  '90DegreeExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/8.png',
  '90DegreeHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/9.png',
  '90DegreeNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/10.png',
  '90Degree': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/11.png',
  'LawlessEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/12.png',
  'LawlessExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/13.png',
  'LawlessExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/14.png',
  'LawlessHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/15.png',
  'LawlessNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/16.png',
  'Lawless': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/17.png',
  'LightshowEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/18.png',
  'LightshowExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/19.png',
  'LightshowExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/20.png',
  'LightshowHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/21.png',
  'LightshowNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/22.png',
  'Lightshow': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/23.png',
  'LegacyEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/24.png',
  'LegacyExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/25.png',
  'LegacyExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/26.png',
  'LegacyHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/27.png',
  'LegacyNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/28.png',
  'Legacy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/29.png',
  'NoArrowsEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/30.png',
  'NoArrowsExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/31.png',
  'NoArrowsExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/32.png',
  'NoArrowsHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/33.png',
  'NoArrowsNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/34.png',
  'NoArrows': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/35.png',
  'OneSaberEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/36.png',
  'OneSaberExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/37.png',
  'OneSaberExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/38.png',
  'OneSaberHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/39.png',
  'OneSaberNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/40.png',
  'OneSaber': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/41.png',
  'StandardEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/42.png',
  'StandardExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/43.png',
  'StandardExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/44.png',
  'StandardHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/45.png',
  'StandardNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/46.png',
  'Standard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/47.png',
  'HorizontalEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/48.png',
  'HorizontalHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/49.png',
  'HorizontalExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/50.png',
  'HorizontalNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/51.png',
  'HorizontalExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/52.png',
  'Horizontal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/53.png',
  'VerticalHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/54.png',
  'VerticalEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/55.png',
  'VerticalExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/56.png',
  'VerticalExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/57.png',
  'VerticalNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/58.png',
  'Vertical': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/59.png',
  'InvertedExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/60.png',
  'InvertedEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/61.png',
  'InvertedExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/62.png',
  'InvertedNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/63.png',
  'InvertedHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/64.png',
  'Inverted': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/65.png',
  'InverseHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/66.png',
  'InverseExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/67.png',
  'InverseEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/68.png',
  'InverseExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/69.png',
  'InverseNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/70.png',
  'Inverse': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/71.png',
  'RhythmGameStandardEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/72.png',
  'RhythmGameStandardNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/73.png',
  'RhythmGameStandardHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/74.png',
  'RhythmGameStandardExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/75.png',
  'RhythmGameStandardExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/76.png',
  'RhythmGameStandard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/77.png',
  'Standard-PinkPlay_ControllableEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/78.png',
  'Standard-PinkPlay_ControllableNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/79.png',
  'Standard-PinkPlay_ControllableHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/80.png',
  'Standard-PinkPlay_ControllableExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/81.png',
  'Standard-PinkPlay_ControllableExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/82.png',
  'Standard-PinkPlay_Controllable': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/83.png',
  'OneSaber-PinkPlay_ControllableEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/84.png',
  'OneSaber-PinkPlay_ControllableNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/85.png',
  'OneSaber-PinkPlay_ControllableHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/86.png',
  'OneSaber-PinkPlay_ControllableExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/87.png',
  'OneSaber-PinkPlay_ControllableExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/88.png',
  'OneSaber-PinkPlay_Controllable': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/89.png',
  'Lawless-PinkPlay_ControllableEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/90.png',
  'Lawless-PinkPlay_ControllableNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/91.png',
  'Lawless-PinkPlay_ControllableHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/92.png',
  'Lawless-PinkPlay_ControllableExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/93.png',
  'Lawless-PinkPlay_ControllableExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/94.png',
  'Lawless-PinkPlay_Controllable': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/95.png',
  'Easy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/96.png',
  'Expert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/97.png',
  'ExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/98.png',
  'Hard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/99.png',
  'Normal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/100.png',
  'UnknownEasy': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/101.png',
  'UnknownExpert': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/102.png',
  'UnknownExpertPlus': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/103.png',
  'UnknownHard': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/104.png',
  'UnknownNormal': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/105.png',
  'Unknown': 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/106.png',
}

function simplifyKey(key: string): string {
  let result = key
  result = result.replace('Solo', '')
  if (
    (result.includes('-PinkPlay_Controllable')
      && !result.match(/(?:Standard|OneSaber|Lawless)-PinkPlay_Controllable/))
    || result.match(/(Horizontal|Vertical|Inverted|Inverse)/)
  ) {
    result = result.replace('-PinkPlay_Controllable', '')
  }
  if (result.startsWith('Generated'))
    result = result.replace('Generated', '')
  if (result.match(/(Horizontal|Vertical|Inverted|Inverse)/)) {
    let previous = ''
    while (previous !== result) {
      previous = result
      result = result.replace(/Lawless|OneSaber|NoArrows|Standard|Legacy/, '')
    }
  }
  return result
}

presence.on('UpdateData', async () => {
  const [time, privacy, buttons, cover, mapSmallImages] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<number>('mapSmallImages'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Score%20Saber/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.querySelector('.is-visible')) {
    presenceData.details = 'Searching'
    presenceData.state = (
      document.querySelector('.search-box')?.children.item(1) as HTMLInputElement
    )?.value
  }
  else if (document.location.pathname.includes('/rankings')) {
    presenceData.details = 'Browsing Rankings'
    if (
      document.querySelector<HTMLInputElement>('.ss-input input')?.value !== ''
    ) {
      presenceData.state = `Search: ${
        document.querySelector<HTMLInputElement>('.ss-input input')?.value
      }`
    }
    else if (document.querySelector('.chip')) {
      let filters = ''
      for (const element of document.querySelectorAll('.chip'))
        filters += `${element?.textContent?.slice(0, -2)},`

      presenceData.state = `${filters.slice(0, -1)}`
    }
  }
  else if (document.location.pathname.includes('/leaderboard')) {
    if (document.location.pathname.includes('/leaderboards')) {
      presenceData.details = 'Browsing Leaderboards'
      if (
        document.querySelector<HTMLInputElement>('.ss-input input')?.value !== ''
      ) {
        presenceData.state = `Search: ${
          document.querySelector<HTMLInputElement>('.ss-input input')?.value
        }`
      }
    }
    else if (document.location.pathname.includes('/leaderboard/')) {
      presenceData.details = 'Viewing Leaderboard'
      presenceData.state = document.querySelector(
        'div.title.is-5.mb-0 > a',
      )?.textContent
      presenceData.smallImageKey = leaderboardImages[
        simplifyKey(
          `${
            mapSmallImages === 0 || mapSmallImages === 1
              ? document.querySelector('.content .content>b:last-of-type')
                ?.textContent
              : ''
          }${
            mapSmallImages === 0 || mapSmallImages === 2
              ? document
                .querySelector<HTMLDivElement>('.tag')
                ?.title
                .replace('+', 'Plus')
              : ''
          }`,
        )
      ]
      ?? leaderboardImages[
        `Unknown${
          mapSmallImages === 0 || mapSmallImages === 2
            ? document
              .querySelector<HTMLDivElement>('.tag')
              ?.title
              .replace('+', 'Plus')
            : ''
        }`
      ]
      presenceData.smallImageText = `${
        mapSmallImages === 0 || mapSmallImages === 1
          ? document
            .querySelector('.content .content>b:last-of-type')
            ?.textContent
            ?.replace('Solo', '')
          : ''
      } ${
        mapSmallImages === 0 || mapSmallImages === 2
          ? document.querySelector<HTMLDivElement>('.tag')?.title
          : ''
      }`
      if (presenceData.smallImageText === '')
        delete presenceData.smallImageText
      presenceData.buttons = [
        {
          label: 'View Page',
          url: document.location.href,
        },
      ]
      if (cover) {
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.map-cover')?.src
      }
    }
    else {
      presenceData.details = 'Viewing Leaderboard'
    }
  }
  else if (document.location.pathname.includes('/ranking/requests')) {
    presenceData.details = 'Browsing Rank Requests'
    presenceData.state = `${document.querySelector('.title')?.textContent} ${
      document.querySelector('p.heading')?.textContent
    }`
  }
  else if (document.location.pathname.includes('/ranking/request')) {
    presenceData.details = 'Viewing Rank Request'
    presenceData.state = document.querySelector(
      '.media-content > .title',
    )?.textContent
    presenceData.smallImageKey = leaderboardImages[
      document
        .querySelector<HTMLDivElement>('.card-content .tag')
        ?.title
        ?.replace('+', 'Plus') ?? ''
    ]
    presenceData.smallImageText = document.querySelector('.selected > span')?.textContent
    if (cover) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.map-cover')?.src
    }
    presenceData.buttons = [
      {
        label: 'View Page',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('/u/')) {
    presenceData.details = 'Viewing User'
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.country')?.src
    presenceData.smallImageText = document.querySelector<HTMLImageElement>('.country')?.title
    presenceData.buttons = [
      {
        label: 'View Page',
        url: document.location.href,
      },
    ]
    if (document.querySelector('.player-link > span')) {
      presenceData.state = `${
        document.querySelector<HTMLImageElement>('.country')?.alt
      } ${document.querySelector('.player-link > span')?.textContent} (${
        document.querySelector('.pp')?.textContent
      })`
    }
    else {
      presenceData.state = `${
        document.querySelector<HTMLImageElement>('.country')?.alt
      } ${document.querySelector('.player > span')?.textContent} (${
        document.querySelector('.pp')?.textContent
      })`
    }
    if (cover) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '.profile-picture img',
      )?.src
    }
  }
  else if (document.location.pathname.includes('/legal/privacy')) {
    presenceData.details = 'Viewing Privacy Policy'
  }
  else if (document.location.pathname.includes('/team')) {
    presenceData.details = 'Viewing ScoreSaber Team'
  }
  else if (document.location.pathname.startsWith('/scores')) {
    presenceData.details = 'Viewing Score Feed'
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Viewing Homepage'
  }

  if (!time)
    delete presenceData.startTimestamp

  if (!buttons)
    delete presenceData.buttons

  if (privacy) {
    delete presenceData.state
    delete presenceData.buttons
  }

  if (presenceData.details && presenceData.largeImageKey)
    presence.setActivity(presenceData)
})
