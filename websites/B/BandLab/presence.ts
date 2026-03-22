import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '801743263052726292',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let studioTimestamp = 0

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/BandLab/assets/logo.png',
  Paused = 'https://cdn.rcd.gg/PreMiD/websites/B/BandLab/assets/0.png',
  Playing = 'https://cdn.rcd.gg/PreMiD/websites/B/BandLab/assets/1.png',
  Search = 'https://cdn.rcd.gg/PreMiD/websites/B/BandLab/assets/2.png',
}

presence.on('UpdateData', async () => {
  const [showButtons, privacyMode, privacyModeStrict, titleArtistFormat]
    = await Promise.all([
      presence.getSetting<boolean>('showButtons'),
      presence.getSetting<boolean>('privacyMode'),
      presence.getSetting<boolean>('privacyModeStrict'),
      presence.getSetting<string>('titleArtistFormat').then(str => str || '%title% - %artist%'),
    ])

  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing',
    view: 'general.view',
    buttonViewSong: 'general.buttonViewSong',
    listening: 'general.listeningTo',
    listening_unspecified: 'general.listeningMusic',
    viewUser: 'general.viewUser',
    readingADM: 'general.readingADM',
    readingDM: 'general.readingDM',
    buttonViewPage: 'general.buttonViewPage',
    watching: 'general.watching',
    buttonWatchVideo: 'general.buttonWatchVideo',
    searchUnspecified: 'general.searchSomething',
    search: 'general.searchFor',
    searchHint: 'general.search',
  })

  function firstSrcFromSrcsetProvided(e: Element | null): string | undefined {
    return e === null ? ActivityAssets.Logo : e.getAttribute('srcset')?.split(' ')[0]
  }

  const { pathname, search, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: studioTimestamp !== 0 ? studioTimestamp : browsingTimestamp,
    type: ActivityType.Playing,
  }

  if (pathname.startsWith('/feed/')) {
    presenceData.details = strings.browse

    if (pathname.includes('trending')) {
      presenceData.state = 'Looking at what\'s trending'
    }
    else if (pathname.includes('following')) {
      presenceData.state = 'Catching up with the people they follow'
    }
    else if (pathname.includes('for-you')) {
      presenceData.state = 'The For You page'
    }

    else if (pathname.includes('video')) {
      if (search.trim() === '') {
        presenceData.state = 'Looking at popular videos'
      }

      else if (search.includes('postId')) {
        presenceData.details = strings.watching

        const videoAuthor: {
          element: Element | null
          target: string
          username: string
        } = {
          element: null,
          target: '',
          username: '',
        }

        const homeElement: Element | null = document.querySelector('post-card-header-content > div > . post-card-header-title > a')

        if (homeElement) {
          videoAuthor.element = homeElement
          videoAuthor.target = homeElement?.getAttribute('href') || ''
          videoAuthor.username = homeElement?.textContent || 'a BandLab user'
        }

        if (showButtons) {
          presenceData.buttons = [
            {
              label: strings.buttonWatchVideo,
              url: href,
            },
            {
              label: strings.viewUser,
              url: videoAuthor.target,
            },
          ]
        }

        presenceData.state = 'A video by [1]'.replace('[1]', videoAuthor.username)
      }
    }
    else if (pathname.includes('communities')) {
      presenceData.state = 'Looking for communities'
    }
  }

  if (pathname.startsWith('/library/projects/') && !pathname.includes('likes'))
    presenceData.state = 'Looking at their saved projects'

  if (pathname.startsWith('/track/')) {
    studioTimestamp = 0

    const isPublic: boolean = document.querySelector('post-private-badge') === null

    if (!isPublic && privacyMode) {
      presenceData.state = strings.listening_unspecified
    }
    else {
      const title: string = document.querySelector('. track-page-player-title-name')?.textContent?.trim() || 'A song'
      const artist: string = document.querySelector('a.track-card-subtitle-text')?.textContent?.trim() || 'someone'

      presenceData.details = strings.view
      presenceData.state = titleArtistFormat.replace('%title%', title).replace('%artist%', artist)

      presenceData.largeImageKey = firstSrcFromSrcsetProvided(document.querySelector('img.ds-cover'))
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'BandLab'

      if (isPublic && showButtons) {
        presenceData.buttons = [
          {
            label: strings.buttonViewSong,
            url: href,
          },
        ]
      }

      const bottomPlayButton: Element | null = document.querySelector('button.ds-play-button')
      if (bottomPlayButton) {
        if (bottomPlayButton.className.includes('status-paused')) {
          presenceData.smallImageKey = ActivityAssets.Paused
          presenceData.smallImageText = strings.pause
        }
        else if (bottomPlayButton.className.includes('status-playing')) {
          presenceData.details = strings.listening.replace('{0}{1}', ':  ')
          presenceData.smallImageKey = ActivityAssets.Playing
          presenceData.smallImageText = strings.play
        }
      }
    }
  }

  if (pathname.includes('/studio')) {
    presenceData.details = 'In the Studio'

    if (studioTimestamp === 0)
      studioTimestamp = Math.floor(Date.now() / 1000)

    if (privacyMode) {
      presenceData.state = 'Cooking up some heat'
    }
    else {
      const inputBox = document.getElementById('studio-project-name-input') as HTMLInputElement
      const title: string = inputBox?.value.trim() || 'New Project'
      presenceData.state = 'Working on project:  {0}'.replace('{0}', title)
    }
  }

  if (pathname.startsWith('/chat')) {
    if (privacyModeStrict) {
      presenceData.state = strings.readingADM
    }
    else if (!privacyModeStrict && document.querySelector('header.conversation-partner')) {
      const dmRecipientName: string | null | undefined = document.querySelector('. profile-tile-title > a')?.textContent
      const dmSubtitleName: string | null | undefined = document.querySelector('.profile-tile-subtitle-wrap > ng-pluralize')?.textContent || document.querySelector('.profile-tile-subtitle-wrap > a')?.textContent || 'a BandLab user'

      presenceData.details = strings.readingDM
      presenceData.state = `${dmRecipientName} (${dmSubtitleName})`

      presenceData.largeImageKey = firstSrcFromSrcsetProvided(document.querySelector('header.profile-tile-header > a > img. profile-tile-picture') || document.querySelector('a.profile-tile-header > img'))

      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'BandLab'
    }
    else {
      presenceData.state = strings.readingADM
    }
  }

  if (pathname.startsWith('/search/')) {
    presenceData.smallImageKey = ActivityAssets.Search
    presenceData.smallImageText = strings.searchHint

    if (privacyModeStrict) {
      presenceData.state = strings.searchUnspecified
    }
    else {
      presenceData.details = strings.search
      presenceData.state = new URLSearchParams(document.location.search).get('q')
    }
  }

  if (document.querySelector('.profile-card-title')) {
    presenceData.details = pathname.startsWith('/band/') ? 'Viewing band: ' : strings.viewUser
    presenceData.buttons = [
      {
        label: strings.buttonViewPage,
        url: href,
      },
    ]

    const pfp: string | undefined = firstSrcFromSrcsetProvided(document.querySelector('.profile-card-picture > a > img'))

    if (pfp !== ActivityAssets.Logo) {
      presenceData.largeImageKey = pfp
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'BandLab'
    }
    else {
      presenceData.largeImageKey = ActivityAssets.Logo
    }

    presenceData.state = `${document.querySelector('.profile-card-title')?.textContent?.trim()}${
      pathname.startsWith('/band/')
        ? ''
        : ` (${document.querySelector('.profile-card-subtitle > a')?.textContent?.trim()})`
    }`
  }

  if (presenceData.state)
    presence.setActivity(presenceData)

  else
    presence.clearActivity()
})
