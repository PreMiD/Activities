const presence = new Presence({
  clientId: '645051733961211934',
})

let elapsed: number, oldURL: string

presence.on('UpdateData', async () => {
  if (window.location.href !== oldURL) {
    oldURL = window.location.href
    elapsed = Math.floor(Date.now() / 1000)
  }

  const { title } = document
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WIRED/assets/logo.png',
    startTimestamp: elapsed,
  }

  if (
    document.location.pathname.includes('/gallery/')
    || document.location.pathname.includes('/story/')
  ) {
    presenceData.details = 'Reading: '
    presenceData.state = title.replace(' | WIRED', '')
  }
  else if (document.location.pathname.includes('/video/watch/')) {
    presenceData.details = 'Watching: '
    presenceData.state = title.replace(' | WIRED Video | CNE', '')
  }
  else {
    presenceData.details = 'Browsing: '
    presenceData.state = title.replace(' | WIRED', '')
  }

  presence.setActivity(presenceData)
})
