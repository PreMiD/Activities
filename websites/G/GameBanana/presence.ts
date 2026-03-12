const presence = new Presence({ clientId: '958520351158050887' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/GameBanana/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const sections = [
    'mods',
    'scripts',
    'sounds',
    'sprays',
    'tools',
    'contests',
    'jams',
    'concepts',
    'projects',
    'requests',
    'tuts',
    'wips',
    'articles',
    'blogs',
    'events',
    'news',
    'polls',
    'questions',
    'threads',
    'wares',
    'apps',
    'bugs',
    'clubs',
    'games',
    'ideas',
    'models',
    'positions',
    'reviews',
    'studios',
    'statusupdates',
    'wikis',
    'updates',
    'posts',
    'support',
    'stamps',
    'flags',
    'permits',
    'generators',
    'initiatives',
  ]
  const nogamesections = [
    'App',
    'Bug',
    'Club',
    'Generator',
    'Idea',
    'Initiative',
    'Model',
    'Review',
    'StatusUpdate',
    'Support',
    'Studio',
    'Wiki',
  ]

  if (document.location.hostname === 'gamebanana.com') {
    const header = document.querySelector('#PageTitle')

    if (!header) {
      presenceData.details = 'Viewing the Homepage'
    }
    else if (header.textContent?.includes('Tango Down!')) {
      presenceData.details = 'Tango Down!'
    }
    else if (document.location.pathname === '/discussions') {
      presenceData.details = 'Browsing discussions'
    }
    else if (header.textContent?.includes(' : Discussions')) {
      presenceData.details = 'Viewing discussions for:'
      presenceData.state = header.textContent.split(' : ')[0]
    }
    else if (document.location.pathname.startsWith('/pms')) {
      if (document.location.pathname.includes('/add'))
        presenceData.details = 'Sending a PM'
      else if (document.location.pathname.includes('/pms/'))
        presenceData.details = 'Reading a PM'
      else presenceData.details = 'Checking PMs'
    }
    else if (document.location.pathname.startsWith('/games')) {
      if (document.location.pathname === '/games') {
        presenceData.details = 'Browsing games'
      }
      else if (document.location.pathname === '/games/add') {
        presenceData.details = 'Adding a game'
      }
      else if (header.textContent?.includes(' : ')) {
        presenceData.details = `Viewing ${
          header.textContent
            .toLowerCase()
            .replace('about', 'the about page')
            .split(' : ')[0]
        } for:`
        presenceData.state = document.querySelector<HTMLMetaElement>(
          'meta[property="gb:game_name"]',
        )?.content
      }
      else {
        presenceData.details = 'Browsing a game:'
        presenceData.state = document.querySelector<HTMLMetaElement>(
          'meta[property="gb:game_name"]',
        )?.content
      }
    }
    else if (document.location.pathname.includes('/add')) {
      if (
        document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
          ?.content === '/add'
      ) {
        presenceData.details = 'Adding a submission'
      }
      else {
        presenceData.details = `Adding a ${document
          .querySelector<HTMLMetaElement>(
            'meta[property="gb:model_name"]',
          )
          ?.content
          .toLowerCase()
          .replace('statusupdate', 'status update')
          .replace('wip', 'WiP')} for:`
        if (
          document.querySelector<HTMLMetaElement>(
            'meta[property="gb:game_name"]',
          )?.content
        ) {
          presenceData.state = document.querySelector<HTMLMetaElement>(
            'meta[property="gb:game_name"]',
          )?.content
        }
        else {
          presenceData.details = presenceData.details.replace(' for:', '')
        }
      }
    }
    else if (
      sections.includes(document.location.pathname.slice(1).split('/')[0]!)
    ) {
      if (document.location.pathname.includes('/games/')) {
        presenceData.details = `Browsing ${document
          .querySelector<HTMLMetaElement>('meta[property="gb:plural_title"]')
          ?.content
          .toLowerCase()
          .replace('wip', 'WiP')} for:`
        presenceData.state = document.querySelector<HTMLMetaElement>(
          'meta[property="gb:game_name"]',
        )?.content
      }
      else if (document.location.pathname.includes('/cats')) {
        if (
          nogamesections.includes(
            document.querySelector<HTMLMetaElement>(
              'meta[property="gb:model_name"]',
            )?.content ?? '',
          )
        ) {
          presenceData.details = `Browsing a ${document
            .querySelector<HTMLMetaElement>('meta[property="gb:plural_title"]')
            ?.content
            .toLowerCase()} category:`
        }
        else {
          presenceData.details = `Browsing a ${document
            .querySelector<HTMLMetaElement>('meta[property="gb:plural_title"]')
            ?.content
            .toLowerCase()} category for ${
            document.querySelector<HTMLMetaElement>(
              'meta[property="gb:game_abbreviation"]',
            )?.content
          }:`
        }
        presenceData.state = header.textContent?.split('- ')[0]
      }
      else if (
        header.textContent?.includes('- A')
        && document.location.pathname !== '/bugs'
        && document.location.pathname !== '/statusupdates'
      ) {
        if (document.location.pathname.includes('/messenger')) {
          presenceData.details = 'Sending a PM'
        }
        else if (header.textContent.includes(' : ')) {
          presenceData.state = header.textContent
            .split('- A')[0]
            ?.split(' : ')[1]
          if (document.location.pathname.includes('/edit')) {
            presenceData.details = `Editing a ${document
              .querySelector<HTMLMetaElement>(
                'meta[property="gb:model_name"]',
              )
              ?.content
              .toLowerCase()
              .replace('statusupdate', 'status update')
              .replace('wip', 'WiP')}:`
            if (
              document
                .querySelector(
                  '#Status > div:nth-child(3) > div:nth-child(1) > ul:nth-child(1) > li:nth-child(2)',
                )
                ?.className
                .includes('Selected')
            ) {
              presenceData.state = '(Private)'
            }
          }
          else if (document.location.pathname.includes('/trash')) {
            presenceData.details = `Trashing a ${document
              .querySelector<HTMLMetaElement>(
                'meta[property="gb:model_name"]',
              )
              ?.content
              .toLowerCase()
              .replace('statusupdate', 'status update')
              .replace('wip', 'WiP')}:`
          }
          else {
            presenceData.details = `Viewing ${header.textContent
              .split(' : ')[0]
              ?.toLowerCase()
              .replace('license', 'the license')
              .replace('withhold', 'the withhold page')
              .replace('team', 'the team')} for a ${document
              .querySelector<HTMLMetaElement>(
                'meta[property="gb:model_name"]',
              )
              ?.content
              .toLowerCase()
              .replace('statusupdate', 'status update')
              .replace('wip', 'WiP')}:`
          }
        }
        else {
          if (
            nogamesections.includes(
              document.querySelector<HTMLMetaElement>(
                'meta[property="gb:model_name"]',
              )?.content ?? '',
            )
          ) {
            presenceData.details = `Viewing a ${document
              .querySelector<HTMLMetaElement>(
                'meta[property="gb:model_name"]',
              )
              ?.content
              .toLowerCase()
              .replace('statusupdate', 'status update')}:`
          }
          else {
            presenceData.details = `Viewing a ${document
              .querySelector<HTMLMetaElement>(
                'meta[property="gb:model_name"]',
              )
              ?.content
              .toLowerCase()
              .replace('wip', 'WiP')} for ${
              document.querySelector<HTMLMetaElement>(
                'meta[property="gb:game_abbreviation"]',
              )?.content
            }:`
          }
          presenceData.state = header.textContent.split('- A')[0]
        }
        if (document.querySelector('#PrivateAccessNoticeModule'))
          presenceData.state = '(Private)'
      }
      else {
        presenceData.details = `Browsing ${document
          .querySelector<HTMLMetaElement>('meta[property="gb:plural_title"]')
          ?.content
          .toLowerCase()
          .replace('statusupdate', 'status update')
          .replace('wip', 'WiP')}`
      }
    }
    else if (document.location.pathname.includes('/search')) {
      presenceData.details = 'Searching for something...'
    }
    else if (document.location.pathname.includes('/members')) {
      if (
        document.location.pathname === '/members'
        || document.location.pathname === '/members/index'
        || document.location.pathname.startsWith('/members?')
      ) {
        presenceData.details = 'Browsing members'
      }
      else if (document.location.pathname.startsWith('/members/public')) {
        if (document.location.pathname.includes('/online'))
          presenceData.details = 'Browsing online members'
        else if (document.location.pathname.includes('/portfolio'))
          presenceData.details = 'Browsing member portfolios'
        else if (document.location.pathname.includes('/honorary'))
          presenceData.details = 'Browsing honorary members'
        else if (document.location.pathname.includes('/logs/points'))
          presenceData.details = 'Viewing the points log'
        else if (document.location.pathname.includes('/logs/unlocks'))
          presenceData.details = 'Viewing the unlocks log'
        else if (document.location.pathname.includes('/logs/awards'))
          presenceData.details = 'Viewing the awards log'
        else if (document.location.pathname.includes('/leaderboards/ranks'))
          presenceData.details = 'Viewing the leaderboard ranks'
        else if (
          document.location.pathname.includes('/leaderboards/subscribers')
        )
          presenceData.details = 'Viewing the subscribers leaderboard'
        else if (
          document.location.pathname.includes('/leaderboards/exemplifications')
        )
          presenceData.details = 'Viewing the exemplifications leaderboard'
        else if (document.location.pathname.includes('/leaderboards/thanked'))
          presenceData.details = 'Viewing the thanked leaderboard'
        else if (document.location.pathname.includes('/leaderboards/thankers'))
          presenceData.details = 'Viewing the thankers leaderboard'
        else if (document.location.pathname.includes('/leaderboards/donors'))
          presenceData.details = 'Viewing the donors leaderboard'
        else if (document.location.pathname.includes('/leaderboards/donees'))
          presenceData.details = 'Viewing the donees leaderboard'
        else if (
          document.location.pathname.includes('/leaderboards/submitters')
        )
          presenceData.details = 'Viewing the submitters leaderboard'
      }
      else if (document.location.pathname.includes('/settings')) {
        presenceData.details = `Changing ${
          header.textContent
            ?.toLowerCase()
            .replace('change password', 'password')
            .replace('settings', '')
            .split(' : ')[0]
        } settings`
      }
      else if (document.location.pathname.includes('/reminders')) {
        presenceData.details = 'Viewing reminders'
      }
      else if (header.textContent?.includes(' : ')) {
        presenceData.details = `Viewing ${
          header.textContent.toLowerCase().split(' : ')[0]
        } of:`
        if (document.location.pathname.includes('/submissions')) {
          if (
            sections.includes(
              document.location.pathname.split('submissions/')[1]!.split('/')[0]!,
            )
          ) {
            presenceData.details = presenceData.details
              .replace('of', 'by')
              .replace('bugs', 'bug reports')
              .replace('support by', 'support tickets for')
              .replace('wip', 'WiP')
              .replace('games', 'games added')
          }
          else if (document.location.pathname.includes('cats/')) {
            presenceData.details = presenceData.details.replace('of', 'by')
          }
        }
        presenceData.state = header.textContent.split(' : ')[1]
      }
      else {
        presenceData.details = 'Viewing profile of:'
        presenceData.state = header.textContent
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
