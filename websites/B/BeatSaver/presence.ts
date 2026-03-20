const presence = new Presence({
  clientId: '837997079208525835',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum OtherAssets {
  '360DegreeEasy' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/0.png',
  '360DegreeExpert' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/1.png',
  '360DegreeExpertPlus' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/2.png',
  '360DegreeHard' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/3.png',
  '360DegreeNormal' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/4.png',
  '360Degree' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/5.png',
  '90DegreeEasy' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/6.png',
  '90DegreeExpert' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/7.png',
  '90DegreeExpertPlus' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/8.png',
  '90DegreeHard' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/9.png',
  '90DegreeNormal' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/10.png',
  'LawlessEasy' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/11.png',
  'LawlessExpert' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/12.png',
  'LawlessExpertPlus' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/13.png',
  'LawlessHard' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/14.png',
  'LawlessNormal' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/15.png',
  'LightshowEasy' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/16.png',
  'LightshowExpert' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/17.png',
  'LightshowExpertPlus' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/18.png',
  'LightshowHard' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/19.png',
  'LightshowNormal' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/20.png',
  'LegacyEasy' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/21.png',
  'LegacyExpert' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/22.png',
  'LegacyExpertPlus' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/23.png',
  'LegacyHard' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/24.png',
  'LegacyNormal' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/25.png',
  'NoArrowsEasy' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/26.png',
  'NoArrowsExpert' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/27.png',
  'NoArrowsExpertPlus' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/28.png',
  'NoArrowsHard' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/29.png',
  'NoArrowsNormal' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/30.png',
  'OneSaberEasy' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/31.png',
  'OneSaberExpert' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/32.png',
  'OneSaberExpertPlus' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/33.png',
  'OneSaberHard' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/34.png',
  'OneSaberNormal' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/35.png',
  'StandardEasy' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/36.png',
  'StandardExpert' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/37.png',
  'StandardExpertPlus' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/38.png',
  'StandardHard' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/39.png',
  'StandardNormal' = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/40.png',
}

presence.on('UpdateData', async () => {
  const [time, buttons, cover] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('cover'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.href.includes('/?q=')) {
    presenceData.details = 'Searching Beatmaps'
    presenceData.state = (
      document.querySelector('input.form-control') as HTMLInputElement
    ).value
  }
  else if (document.location.pathname.includes('/maps/')) {
    if (document.querySelector('a[class~=\'active\']')) {
      presenceData.smallImageKey = OtherAssets[
        `${
          document
            .querySelector<HTMLImageElement>('a[class~=\'active\'] img')
            ?.title
            .split(' ')[1]
        }${document
          .querySelector<HTMLImageElement>('a[class~=\'active\'] img')
          ?.title
          .split(' ')[0]
          ?.replace('+', 'Plus')}` as keyof typeof OtherAssets
      ]
      presenceData.smallImageText = `${
        (
          document
            .querySelector('a[class~=\'active\']')!.childNodes.item(0) as HTMLImageElement
        ).alt
      } ${
        document.querySelector('a[class~=\'active\']')?.childNodes.item(1).textContent
      }`
      if (cover) {
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
          '[alt=\'Cover Image\']',
        )?.src
      }

      if (
        document.querySelector(
          '.list-group-item.d-flex.justify-content-between:nth-child(2) > span',
        )
        && document.querySelector(
          '.list-group-item.d-flex.justify-content-between:nth-child(2) > span',
        )?.textContent === 'Bot'
      ) {
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/B/BeatSaver/assets/41.png'
        presenceData.smallImageText = 'Made using AI'
      }

      presenceData.details = document.querySelector(
        '.card-header.d-flex',
      )?.childNodes[0]?.textContent
      if (presenceData.details === '')
        presenceData.details = '<NO NAME>'

      presenceData.state = `Uploaded by ${
        document.querySelector(
          '.list-group-item.d-flex.justify-content-between a',
        )?.textContent
      }`
      presenceData.buttons = [
        {
          label: 'View Page',
          url: document.location.href,
        },
        {
          label: 'View Uploader\'s Profile',
          url: `https://beatsaver.com${document
            .querySelector('.list-group-item.d-flex.justify-content-between a')
            ?.getAttribute('href')}`,
        },
      ]
    }
  }
  else if (document.location.pathname.includes('/profile')) {
    presenceData.details = 'Viewing Profile'
    presenceData.state = document.querySelector('h4')?.textContent
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: document.location.href,
      },
    ]
  }
  else if (document.location.pathname.includes('/playlists/')) {
    presenceData.details = 'Viewing Playlist'
    presenceData.state = document.querySelector('.ms-4')?.textContent
    presenceData.buttons = [
      {
        label: 'View Playlist',
        url: document.location.href,
      },
    ]
    if (cover) {
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('img[alt=\'Cover\']')?.src
    }
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'Browsing Beatmaps'
    if (
      document.querySelector('.filter-dropdown > span')
      && document.querySelector('.filter-dropdown > span')?.textContent
      !== 'Filters'
    ) {
      presenceData.state = `Filters: ${
        document.querySelector('.filter-dropdown > span')?.textContent
      }`
    }
  }

  switch (document.location.pathname) {
    case '/mappers':
      presenceData.details = 'Browsing Mappers'
      break
    case '/alerts':
      presenceData.details = `Viewing ${
        document.querySelector('.active span')?.textContent
      } Alerts`
      break
    case '/policy/dmca':
      presenceData.details = 'Viewing DMCA Policy'
      break
    case '/upload':
      presenceData.details = 'Uploading...'
      break
    case '/profile':
      presenceData.details = 'Viewing Their Own Profile'
      delete presenceData.state
      delete presenceData.buttons
      break
  }

  if (!time)
    delete presenceData.startTimestamp

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
