import { Assets } from 'premid'

const presence = new Presence({
  clientId: '917417055458852865',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/ArtStation/assets/logo.png',
  Inbox = 'https://cdn.rcd.gg/PreMiD/websites/A/ArtStation/assets/0.png',
  User = 'https://cdn.rcd.gg/PreMiD/websites/A/ArtStation/assets/1.png',
  Artwork = 'https://cdn.rcd.gg/PreMiD/websites/A/ArtStation/assets/2.png',
  Searchjob = 'https://cdn.rcd.gg/PreMiD/websites/A/ArtStation/assets/3.png',
  Editprofile = 'https://cdn.rcd.gg/PreMiD/websites/A/ArtStation/assets/4.png',
  Portfolio = 'https://cdn.rcd.gg/PreMiD/websites/A/ArtStation/assets/5.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const shortTitle = document.title.split(/-(.+)/)[1]
  const [image, artwork, button, time] = await Promise.all([
    presence.getSetting<boolean>('image'),
    presence.getSetting<number>('artwork'),
    presence.getSetting<boolean>('button'),
    presence.getSetting<boolean>('time'),
  ])

  if (document.location.pathname.startsWith('/messages')) {
    presenceData.details = 'Checking inbox'
    presenceData.smallImageKey = ActivityAssets.Inbox
    presenceData.smallImageText = 'Checking inbox'
  }
  else if (
    document.querySelector<HTMLDivElement>(
      'body > div.wrapper > div.wrapper-main > div > div > div.user-profile',
    )
  ) {
    presenceData.details = 'Viewing an artist\'s profile'
    presenceData.state = shortTitle
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
      'div.user-profile > user-header > div > div > div.avatar > img',
    )?.src
    presenceData.smallImageKey = ActivityAssets.User
    presenceData.smallImageText = 'Viewing profile'
    presenceData.buttons = [{ label: 'View Artist', url: document.URL }]
  }
  else if (document.location.pathname.startsWith('/artwork')) {
    presenceData.details = 'Viewing an artwork'
    presenceData.state = shortTitle
    if (artwork === 1) {
      presenceData.largeImageKey = document
        .querySelector<HTMLImageElement>(
          'div.d-none.d-md-flex.align-items-start > a > img',
        )
        ?.src
        .replace('medium', 'large')
    }
    else if (artwork === 2) {
      // Meta tags can't be used due to how the page is loaded
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        'div.asset-image > picture > img',
      )?.src
    }
    else {
      presenceData.smallImageKey = ActivityAssets.Artwork
      presenceData.smallImageText = 'Viewing artwork'
    }
    presenceData.buttons = [
      { label: 'View Artwork', url: document.location.href },
      {
        label: 'View Artist',
        url: document.querySelector<HTMLAnchorElement>(
          'div.d-none.d-md-flex.align-items-start > a',
        )!.href,
      },
    ]
  }
  else if (document.location.pathname.startsWith('/marketplace')) {
    presenceData.details = 'Surfing the marketplace'
  }
  else if (document.location.pathname.startsWith('/studios')) {
    presenceData.details = 'Visiting studios'
  }
  else if (document.location.href.includes('/jobs')) {
    presenceData.details = 'Viewing jobs'
    presenceData.state = document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content')
    presenceData.smallImageKey = ActivityAssets.Searchjob
    presenceData.smallImageText = 'Viewing jobs'
  }
  else if (document.location.pathname.startsWith('/blogs')) {
    if (document.location.pathname === '/blogs') {
      presenceData.details = 'Reading blogs'
    }
    else {
      presenceData.details = 'Reading a blog'
      presenceData.state = shortTitle
    }
  }
  else if (document.location.pathname.startsWith('/contests')) {
    if (document.location.pathname === '/contests') {
      presenceData.details = 'Looking for challenges'
    }
    else {
      presenceData.details = 'Viewing a challenge'
      presenceData.state = shortTitle
    }
  }
  else if (document.location.pathname === '/podcast') {
    presenceData.details = 'Finding a podcast'
  }
  else if (document.location.pathname === '/guides') {
    presenceData.details = 'Looking for guides'
  }
  else if (document.location.pathname.startsWith('/learning')) {
    presenceData.details = 'Learning'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Learning'
    if (
      document.location.href.includes('/courses')
      || document.location.href.includes('/playlists')
    ) {
      presenceData.details = 'Viewing a course:'
      presenceData.state = document.querySelector('h1[class=\'h3 mb0\']')?.textContent
      const playlist = document.querySelector<HTMLImageElement>(
        'li > a[class~="is-active"] > img',
      )
      if (playlist)
        presenceData.largeImageKey = playlist.src

      delete presenceData.startTimestamp
      const paused = document.querySelector(
        'button.vjs-play-control.vjs-control.vjs-button.vjs-paused',
      )
      if (!paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          presence.timestampFromFormat(
            document
              .querySelector('div.vjs-duration-display')
              ?.textContent
              ?.slice(14) ?? '',
          ),
          presence.timestampFromFormat(
            document
              .querySelector('div.vjs-current-time-display')
              ?.textContent
              ?.slice(13) ?? '',
          ),
        )
      }
      presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = paused ? 'Paused' : 'Playing'
      presenceData.buttons = [{ label: 'View Course', url: document.URL }]
    }
    else if (document.location.href.includes('/series')) {
      presenceData.details = 'Viewing a series'
      presenceData.largeImageKey = document
        .querySelector<HTMLDivElement>('div.series-page-header')
        ?.style
        ?.backgroundImage
        ?.split('url')[1]
        ?.replace('("', '')
        ?.replace('")', '')
      presenceData.state = shortTitle
      presenceData.buttons = [{ label: 'View Series', url: document.URL }]
    }
    else if (document.location.href.includes('/instructors')) {
      presenceData.details = 'Viewing an instructor'
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        'div.instructor-page.ng-star-inserted > div.container > div > div > img',
      )?.src
      presenceData.state = shortTitle
      presenceData.buttons = [{ label: 'View Instructor', url: document.URL }]
    }
  }
  else if (document.location.href.includes('settings')) {
    presenceData.details = 'Changing settings'
  }
  else if (document.location.href.includes('profile/edit')) {
    presenceData.details = 'Editing profile'
    presenceData.smallImageKey = ActivityAssets.Editprofile
    presenceData.smallImageText = 'Editing profile'
  }
  else if (document.location.href.includes('project/new')) {
    presenceData.details = 'Uploading an artwork'
    presenceData.smallImageKey = Assets.Uploading
    presenceData.smallImageText = 'Uploading artwork'
  }
  else if (document.location.hostname === 'magazine.artstation.com') {
    presenceData.details = 'Reading magazines'
    presenceData.state = shortTitle
  }
  else if (document.location.hostname === 'www.artstation.com') {
    presenceData.details = 'Exploring artworks'
    presenceData.smallImageKey = ActivityAssets.Artwork
    presenceData.smallImageText = 'Exploring artworks'
  }
  else {
    presenceData.details = 'Viewing a portfolio'
    presenceData.state = document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content')
    presenceData.largeImageKey = document
      .querySelector('head > meta[name=image]')
      ?.getAttribute('content')
    presenceData.smallImageKey = ActivityAssets.Portfolio
    presenceData.smallImageText = 'Viewing portfolio'
  }
  if (!image) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/ArtStation/assets/logo.png'
  }
  if (!button)
    delete presenceData.buttons
  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  presence.setActivity(presenceData)
})
