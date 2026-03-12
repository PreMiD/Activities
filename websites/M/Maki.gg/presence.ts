const presence = new Presence({
  clientId: '563434444321587202',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  // Default data
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Maki.gg/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'On Homepage'
    if (
      document.location.href.substring(
        document.location.host.length + document.location.protocol.length + 2,
      ) === '/#features'
    ) {
      presenceData.state = 'Looking at Makis features'
    }
  }
  else {
    presenceData.buttons = [
      {
        label: 'Invite',
        url: 'https://maki.gg/invite',
      },
    ]
    if (document.location.pathname === '/dashboard') {
      // Server selection
      presenceData.details = 'On Dashboard'
      presenceData.state = 'Selecting a server'
    }
    else if (
      document.location.pathname.includes('/dashboard/')
      && document.location.pathname.split('/').length === 3
    ) {
      // Module settings
      presenceData.details = `${
        document.querySelector(
          '#user-profile > div > div > div > div.relative > div.profile-img-container.d-flex.align-items-center.justify-content-between > div.profile-title.ml-3 > h1',
        )?.textContent
      }'s Dashboard`
      presenceData.state = 'Selecting a module'
    }
    else if (
      document.location.pathname.includes('/dashboard/')
      && document.location.pathname.split('/').length > 3
    ) {
      // Specfic dashboard tab
      let state
      switch (document.location.pathname.split('/')[3]) {
        // Modulues
        case 'levels':
          state = 'Editing leveling settings'
          break
        case 'economy':
          state = 'Editing economy settings'
          break
        case 'welcome':
          state = 'Editing welcoming settings'
          break
        case 'moderation':
          state = 'Editing moderation settings'
          break
        case 'logs':
          state = 'Editing logging settings'
          break
        case 'statistics':
          state = 'Looking at the servers statistics'
          break
        case 'repeatingmessages':
          state = 'Editing repeating messages'
          break
        case 'customcommands':
          state = 'level'
          break
        case 'embeds':
          state = 'Creating an embed'
          break
        case 'miscellaneous':
          state = 'Editing miscellaneous settings'
          break
          // Settings
        case 'settings':
          state = 'Editing the main settings'
          break
          // Permissions
        case 'permissions':
          state = 'Editing permission grants'
          break
          // Activity
        case 'activity':
          state = 'Looking at recent server activities'
          break
          // Unkown tab
        default:
          state = 'Being on an unkown dashboard tab'
          break
      }

      presenceData.details = `${
        document.querySelector(
          '#user-profile > div > div > div > div.relative > div.profile-img-container.d-flex.align-items-center.justify-content-between > div.profile-title.ml-3 > h1',
        )?.textContent
      }'s Dashboard`
      presenceData.state = state
    }
    else if (document.location.pathname.includes('/statistics/')) {
      presenceData.details = `Analyzing ${
        document.querySelector(
          'body > div.app-content.content > div.content-wrapper > div.content-body > div:nth-child(1) > div > div > div > div.media.mb-2 > div > h3',
        )?.textContent
      }`
      presenceData.state = 'With Makis statistics'
    }
    else if (document.location.pathname.includes('/backgrounds/')) {
      presenceData.details = 'Browsing through'
      presenceData.state = window.getComputedStyle(document.querySelector('#profile')!).display
        === 'block'
        ? 'Profile backgrounds'
        : 'Rank backgrounds'
    }
    else if (document.location.pathname.includes('/premium')) {
      presenceData.details = 'Taking a look at the amazing features of'
      presenceData.state = 'Maki premium'
    }
    else {
      switch (document.location.pathname) {
        case '/commands': {
          presenceData.details = 'Reading'
          presenceData.state = 'Commands page'

          break
        }
        case '/status': {
          presenceData.details = 'Reading'
          presenceData.state = 'Status page'

          break
        }
        case '/profile': {
          presenceData.details = `Looking at the profile of ${
            document.querySelector(
              'body > div.app-content.content > div.content-wrapper > div.content-body > section > div > div.col-md-7.col-lg-8.col-xl-9.col-12 > div > div > div > div.d-flex.justify-content-between.flex-column.col-xl-6.col-21 > div.d-flex.justify-content-start > div > div.mb-1 > h4',
            )?.textContent
          }`
          presenceData.state = `Level ${
            document.querySelector(
              'body > div.app-content.content > div.content-wrapper > div.content-body > section > div > div.col-md-7.col-lg-8.col-xl-9.col-12 > div > div > div > div.d-flex.justify-content-between.flex-column.col-xl-6.col-21 > div.d-flex.align-items-center.mt-2 > div.d-flex.align-items-center.mr-2 > div.ml-1 > h5',
            )?.textContent
          } | `
          + `Xp ${
            document.querySelector(
              'body > div.app-content.content > div.content-wrapper > div.content-body > section > div > div.col-md-7.col-lg-8.col-xl-9.col-12 > div > div > div > div.d-flex.justify-content-between.flex-column.col-xl-6.col-21 > div.d-flex.align-items-center.mt-2 > div:nth-child(2) > div.ml-1 > h5',
            )?.textContent
          }`

          break
        }
        case '/verify': {
          presenceData.details = 'In the process to'
          presenceData.state = 'Verify'

          break
        }
        default:
          if (document.location.pathname.includes('/leaderboard')) {
            // Global leaderboard
            if (document.location.pathname === '/leaderboard') {
              presenceData.details = 'Looking at the'
              presenceData.state = 'Global leaderboard'
            }
            else {
              presenceData.details = 'Looking at'
              presenceData.state = `${
                document.querySelector(
                  'body > div.app-content.content > div.content-wrapper > div.content-body > section > div > div:nth-child(1) > div > div > div > div.col-12.col-sm-9.col-md-6.col-lg-5 > div.card-title',
                )?.textContent
              }'s leaderboard`
            }
          }
          else if (document.location.pathname.includes('/knowledge')) {
            // Main knowledge page
            if (document.location.pathname === '/knowledge') {
              presenceData.details = 'Browsing through the'
              presenceData.state = 'Knowledge page'
            }
            else {
              presenceData.details = 'Reading a knowledge page:'
              presenceData.state = document.querySelector(
                '#knowledge-base-question > div > div.col-lg-9.col-md-7.col-12 > div > div > div > h1',
              )?.textContent
            }
          }
          else if (document.location.pathname === '/terms') {
            presenceData.details = 'Reading'
            presenceData.state = 'The boring terms of service'
          }
          else if (document.location.pathname === '/team') {
            presenceData.details = 'Looking at the'
            presenceData.state = 'Team'
          }
      }
    }
  }

  presence.setActivity(presenceData)
})
