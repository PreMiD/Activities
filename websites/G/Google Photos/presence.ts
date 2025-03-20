const presence = new Presence({
  clientId: '925204937225416704',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Photos/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  if (path === '' || path === '/') {
    presenceData.details = 'Browsing photos'
  }
  else if (path.startsWith('/memory')) {
    presenceData.details = 'Playing back a memory:';
    [presenceData.state] = document.title.split(/-/, 1)
  }
  else if (path.includes('/photo')) {
    presenceData.details = 'Viewing a photo'
  }
  else if (path.startsWith('/search')) {
    presenceData.details = 'Searching for:';
    [presenceData.state] = document.title.split(/-/, 1)
  }
  else if (path === '/albums') {
    presenceData.details = 'Browsing albums'
  }
  else if (path.startsWith('/album')) {
    presenceData.details = 'Viewing an album'
    if (await presence.getSetting<boolean>('albumname'))
      [presenceData.state] = document.title.split(/-/, 1)
  }
  else if (path.startsWith('/archive')) {
    presenceData.details = 'Viewing the archive'
  }
  presence.setActivity(presenceData)
})
