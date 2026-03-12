const presence = new Presence({
  clientId: '1017593958546821160',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenseData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MusicBrainz%20Picard/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { hostname, pathname } = window.location
  switch (hostname) {
    case 'picard.musicbrainz.org': {
      presenseData.details = 'Browsing...'
      switch (pathname.split('/')[1]) {
        case '': {
          presenseData.state = 'Home page'
          break
        }
        case 'docs': {
          presenseData.details = 'Browsing documentation'
          presenseData.state = document.querySelector('h1')?.textContent
          break
        }
        default: {
          presenseData.state = document.title.match(
            /(.*?)( - MusicBrainz Picard$|$)/,
          )?.[1]
        }
      }
      break
    }
    case 'picard-docs.musicbrainz.org': {
      presenseData.details = 'Browsing documentation...'
      if (pathname.match(/^(?:\/v[\d.]+)?\/[a-z]{2}\/(.*)/)?.[1] === 'index.html') {
        presenseData.state = 'Home page'
      }
      else {
        const header = document.querySelector('h1')
        presenseData.state = header?.textContent?.substring(0, header.textContent.length - 1)
      }
      break
    }
  }
  presence.setActivity(presenseData)
})
