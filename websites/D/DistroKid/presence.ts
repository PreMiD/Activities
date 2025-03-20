const presence = new Presence({
  clientId: '1261851627003056139',
})
const pages: { [key: string]: [string, number] } = {
  '/mymusic/': ['Uploaded tracks', 0],
  '/account/': ['Account Details', 0],
  '/stats/': ['Daily Streaming Stats', 0],
  '/bank/': ['Bank Details', 0],
  '/new/': ['Uploading a new track', 1],
  '/dashboard/album/': ['Browsing a track', 2],
  '/dashboard/album/edit/': ['Editing a track', 2],
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DistroKid/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Viewing the homepage'
      break
    }
    case pathname.includes('/help'): {
      presenceData.details = 'Viewing support pages'
      break
    }
    case !!pages[pathname]:
    case !!pages[pathname.slice(0, -1)]: {
      presenceData.details = 'Browsing on page'
      presenceData.state = pages[pathname]?.[0] ?? pages[pathname.slice(0, -1)]?.[0]
      break
    }
    default: {
      presenceData.details = document.querySelector('.albumTitleBig > span:nth-child(1)')
        ?.textContent
        ?? document.querySelector('.songTitlePreview')?.textContent
        ?? ''
      if (presenceData.details)
        presenceData.state = 'Browsing a page:'
      else presenceData.details = 'Browsing...'
    }
  }

  presence.setActivity(presenceData)
})
