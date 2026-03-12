const presence = new Presence({
  clientId: '758864138897850368',
})
const startTimeStamp = Math.round(Date.now())
let author: string | undefined,
  title: string | undefined,
  language: string | undefined,
  searchQuery: string | undefined,
  username: string | undefined
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Flickr/assets/logo.png',
    startTimestamp: startTimeStamp,
    smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Flickr/assets/logo.png',
    smallImageText: 'Viewing Images or videos on Flickr',
  }
  if (document.location.hostname === 'www.flickr.com') {
    if (
      document.location.pathname === '/'
      || document.location.pathname === '/new/'
    ) {
      presenceData.details = 'Viewing home page'
    }
    else if (document.location.pathname.includes('/photos/')) {
      if (
        document.location.pathname.split('/').length === 4
        || document.location.pathname.split('/').length === 5
      ) {
        username = document.location.pathname.split('/')[2]
        presenceData.details = `Viewing user: ${username}`
        if (document.location.pathname.split('/')[3]?.length !== 0) {
          presenceData.state = `Viewing their: ${
            document.location.pathname.split('/')[3]
          }`
        }
        return
      }
      title = document.querySelector('title')?.textContent ?? '';
      [, title] = title.split('|');
      [, author] = document.querySelector('title')?.textContent ?? ''
      presenceData.details = `Viewing: ${title}`
      presenceData.state = `From: ${author}`
    }
    else {
      switch (document.location.pathname) {
        case '/about': {
          presenceData.details = 'Viewing what Flickr is about'
          break
        }
        case '/jobs': {
          presenceData.details = 'Viewing job oppurtunities at Flickr'
          break
        }
        case '/services/developer': {
          presenceData.details = 'Viewing the Flickr Developer Guide'
          break
        }
        case '/help/guidelines': {
          presenceData.details = 'Viewing the Flickr Guidelines'
          break
        }
        case '/help/terms': {
          presenceData.details = 'Viewing the Flickr Terms & Conditions of Use'
          break
        }
        case '/help/privacy': {
          presenceData.details = 'Viewing the Flickr Privacy Policy'
          break
        }
        case '/help/api': {
          presenceData.details = 'Viewing the Flickr APIs Terms of Use'
          break
        }
        case '/help/cookies': {
          presenceData.details = 'Viewing the Flickr Policy on Cookies'
          break
        }
        case '/help/dpa': {
          presenceData.details = 'Viewing the Flickr Data Processing Addendum'
          break
        }
        case '/explore': {
          presenceData.details = 'Exploring cool images'
          break
        }
        case '/photos/tags': {
          presenceData.details = 'Exploring popular tags'
          break
        }
        case '/events': {
          presenceData.details = 'Viewing Flickr events'
          break
        }
        case '/commons': {
          presenceData.details = 'Viewing the Flickr Commons'
          break
        }
        default:
          if (document.location.pathname.startsWith('/help/forum/')) {
            language = document.location.pathname.split('/')[4]
            presenceData.details = `Viewing the Flickr Help Forums in: ${language}`
            if (document.location.pathname.split('/').length === 6) {
              title = document.querySelector('title')?.textContent ?? ''
              title = title.split(':')[2]
              presenceData.state = `Viewing:${title}`
            }
          }
          else if (document.location.pathname.startsWith('/search/')) {
            searchQuery = document.querySelector('title')?.textContent ?? '';
            [, searchQuery] = searchQuery.split(':');
            [searchQuery] = searchQuery?.split('|') ?? []
            presenceData.details = `Searching:${searchQuery}`
          }
          else if (document.location.pathname === '/map') {
            presenceData.state = 'Viewing Flickr\'s worldmap'
          }
      }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
