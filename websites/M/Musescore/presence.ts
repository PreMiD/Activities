import { Assets } from 'premid'

const presence = new Presence({
  clientId: '629473655218241557',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})

function getTime(timegone: string[], timetotal: string[]): number[] {
  return [
    Number.parseInt(timegone[0]!) + Number.parseInt(timegone[1]!) * 60,
    Number.parseInt(timetotal[0]!) + Number.parseInt(timetotal[1]!) * 60,
  ]
}

function getTimeLeft(Time: string[]): number[] {
  const parsedAudioDuration = getTime(
    Time[0]!.split(':').reverse(),
    Time[1]!.split(':').reverse(),
  )
  return [parsedAudioDuration[0]!, parsedAudioDuration[1]!]
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Musescore/assets/logo.png',
  }

  // ALL ON THE .ORG website
  if (document.location.pathname.endsWith('/forum')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'the forums.'
  }
  if (document.location.pathname.endsWith('/download')) {
    presenceData.details = 'Looking how to'
    presenceData.state = 'download Musescore.'
  }
  if (document.location.pathname.includes('/handbook')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'the handbook.'
  }
  if (document.location.pathname.endsWith('/plugins')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'plugins.'
  }
  if (document.location.pathname.endsWith('/services')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'services.'
  }
  if (
    document.location.pathname.includes('/tutorials')
    || document.location.pathname.includes('/howto')
  ) {
    presenceData.details = 'Looking at'
    presenceData.state = 'tutorials.'
  }
  if (document.location.pathname.endsWith('/faq')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'the FAQ.'
  }
  if (document.location.pathname.endsWith('/tracker')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'recent content.'
  }
  // Main stuff
  if (document.location.pathname.includes('/dashboard')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'their dashboard.'
  }
  if (document.location.pathname.startsWith('/piano-tutorial')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'piano tutorials.'
  }
  if (document.location.pathname.startsWith('/community')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'communities.'
  }
  if (document.location.pathname.includes('/sheetmusic')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'sheetmusic.'
  }
  if (document.location.pathname.startsWith('/upload')) {
    presenceData.details = 'Uploading'
    presenceData.state = 'their music.'
  }
  if (document.location.pathname.startsWith('/hub')) {
    presenceData.details = 'Looking at'
    presenceData.state = `${
      document.location.pathname.split('/')[2]
    } sheetmusic.`
  }
  if (document.location.pathname.endsWith('/my-scores')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'their sheetmusic.'
  }
  if (document.location.pathname.startsWith('/upgrade')) {
    presenceData.details = 'Considering'
    presenceData.state = 'upgrading to pro.'
  }
  if (document.location.pathname.startsWith('/checkout')) {
    presenceData.details = 'Checking something'
    presenceData.state = 'out.'
  }
  if (document.location.pathname.endsWith('/group/create')) {
    presenceData.details = 'Creating a'
    presenceData.state = 'new group.'
  }
  if (document.location.pathname.endsWith('/community-guidelines')) {
    presenceData.details = 'Browsing the'
    presenceData.state = 'community guidelines.'
  }
  if (
    document.location.pathname.endsWith('/press')
    || document.location.pathname.endsWith('/news')
  ) {
    presenceData.details = 'Browsing the'
    presenceData.state = 'press.'
  }
  if (document.location.pathname.endsWith('/jobs')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'job opportunities.'
  }
  if (document.location.pathname.endsWith('/about')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'the about section.'
  }
  if (document.location.pathname.startsWith('/hc')) {
    presenceData.details = 'Looking at'
    presenceData.state = 'the help center.'
  }
  if (document.location.pathname.startsWith('/contact')) {
    presenceData.details = 'Contacting'
    presenceData.state = 'Musescore.'
  }
  // This is here since some profiles dont have user.
  if (
    document.querySelector(
      'body > div.page.js-user-profile-page > div.content-header > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
    )
  ) {
    presenceData.details = 'Browing'
    presenceData.state = `${
      document.querySelector(
        'body > div.page.js-user-profile-page > div.content-header > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
      )?.textContent
    }'s profile`
  }

  // MUSIC PLAYING / PAUSING
  if (
    document.querySelector(
      '#jmuse-container > div.viewer > div.viewerWrapper > div',
    )
  ) {
    if (
      `${document
        .querySelector(
          '#jmuse-container > div:nth-child(1) > div > div > div > div._1DDmo.undefined > div:nth-child(1) > div > div > div.oY3Aa > button',
        )
        ?.getAttribute('state')}` === 'default'
    ) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.details = 'Looking at'
      presenceData.state = document.querySelector(
        'body > div.page.page-score > div.container > div.row > main > article > div > div.score-right > h1',
      )?.textContent
      presenceData.smallImageText = (await strings).pause
    }
    else if (
      `${document
        .querySelector(
          '#jmuse-container > div:nth-child(1) > div > div > div > div._1DDmo.undefined > div:nth-child(1) > div > div > div.oY3Aa > button',
        )
        ?.getAttribute('state')}` === 'primary'
    ) {
      const time = getTimeLeft([
        document
          .querySelector(
            '#jmuse-container > div:nth-child(1) > div > div > div > div._1DDmo.undefined > div:nth-child(1) > div > div > div._3vWaq > span',
          )!
          .textContent!
          .split('/')[0]!,
        document
          .querySelector(
            '#jmuse-container > div:nth-child(1) > div > div > div > div._1DDmo.undefined > div:nth-child(1) > div > div > div._3vWaq > span',
          )!
          .textContent!
          .split('/')[1]!,
      ]);
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(time[0]!, time[1]!)
      presenceData.smallImageKey = Assets.Play
      presenceData.details = 'Listening to'
      presenceData.state = document.querySelector(
        'body > div.page.page-score > div.container > div.row > main > article > div > div.score-right > h1',
      )?.textContent
      presenceData.smallImageText = (await strings).play
    }
  }

  if (document.location.pathname.includes('/user')) {
    if (document.location.pathname.includes('/edit')) {
      presenceData.details = 'Editing'
      presenceData.state = 'their account.'
    }
    if (document.location.pathname.includes('settings/profile')) {
      presenceData.details = 'Editing'
      presenceData.state = 'their profile.'
    }
    if (document.location.pathname.includes('subscription')) {
      presenceData.details = 'Viewing a'
      presenceData.state = 'subscription.'
    }
    if (document.location.pathname.includes('billing')) {
      presenceData.details = 'Viewing their'
      presenceData.state = 'billing history.'
    }
    if (document.location.pathname.includes('gifts')) {
      presenceData.details = 'Viewing their'
      presenceData.state = 'gifts.'
    }
    if (document.location.pathname.includes('notifications')) {
      presenceData.details = 'Viewing their'
      presenceData.state = 'notifications.'
    }
    if (document.location.pathname.includes('/message')) {
      presenceData.details = 'Looking at'
      presenceData.state = 'messages.'
    }
    if (document.location.pathname.includes('/followers')) {
      presenceData.details = 'Looking at'
      presenceData.state = `${
        document.querySelector(
          'body > div.page.js-user-profile-page > div.content-header > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
        )?.textContent
      }'s followers.`
    }
    if (document.location.pathname.includes('/following')) {
      presenceData.details = 'Looking who'
      presenceData.state = `${
        document.querySelector(
          'body > div.page.js-user-profile-page > div.content-header > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
        )?.textContent
      } is following.`
    }
    if (document.location.pathname.includes('/invite')) {
      presenceData.details = 'Inviting'
      presenceData.state = 'some friends.'
    }
    if (
      document.querySelector(
        'body > div.page.js-user-profile-page > div.content-header.collapsed > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
      )
    ) {
      presenceData.details = 'Browing'
      presenceData.state = `${
        document.querySelector(
          'body > div.page.js-user-profile-page > div.content-header.collapsed > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
        )?.textContent
      }'s profile`
    }
  }
  else if (
    document.querySelector(
      'body > div.page.js-user-profile-page > div.content-header > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
    )
  ) {
    if (document.location.pathname.includes('/sheetmusic')) {
      presenceData.details = 'Looking at'
      presenceData.state = `${
        document.querySelector(
          'body > div.page.js-user-profile-page > div.content-header > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
        )?.textContent
      }'s sheetmusic.`
    }
    if (document.location.pathname.includes('/favorites')) {
      presenceData.details = 'Looking at'
      presenceData.state = `${
        document.querySelector(
          'body > div.page.js-user-profile-page > div.content-header > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
        )?.textContent
      }'s favorites.`
    }
    if (document.location.pathname.includes('/sets')) {
      presenceData.details = 'Looking at'
      presenceData.state = `${
        document.querySelector(
          'body > div.page.js-user-profile-page > div.content-header > div.banner-header.group-header > div > div.info-wrapper.group-info-wrapper.user-info-wrapper > div > h1 > a',
        )?.textContent
      }'s sets.`
    }
  }
  presence.setActivity(presenceData)
})
