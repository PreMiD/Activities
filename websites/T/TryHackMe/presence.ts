const presence = new Presence({
  clientId: '656826806061498368', // The client ID of the Application created at https://discordapp.com/developers/applications
  // Enable use and detection of media key presses
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TryHackMe/assets/logo.png',
}
const browsingTimestamp = Math.floor(Date.now() / 1000)

let customData = false

presence.on('UpdateData', async () => {
  customData = false
  presenceData.startTimestamp = browsingTimestamp

  if (document.location.pathname === '/dashboard') {
    presenceData.details = 'Viewing the Dashboard!'
  }
  else if (document.location.pathname === '/profile') {
    presenceData.details = 'Viewing their profile!'
  }
  else if (document.location.pathname.startsWith('/room')) {
    const title = document.querySelector<HTMLElement>('#title')

    if (title) {
      customData = true

      presence.setActivity({
        details: 'Completing room:',
        state: title.textContent,
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/TryHackMe/assets/logo.png',
        startTimestamp: browsingTimestamp,
      })
    }
    else {
      presenceData.details = 'Looking at rooms!'
    }
  }
  else if (
    document.location.pathname === '/upload'
    || document.location.pathname === '/manage-rooms'
    || document.location.pathname.startsWith('/room/manage')
    || document.location.pathname === '/assign-tasks'
    || document.location.pathname === '/your-material'
  ) {
    presenceData.details = 'Managing a room!'
    presenceData.state = `Page: ${document.location.pathname}`
    // presenceData.startTimestamp = browsingTimestamp;
  }
  else if (document.location.pathname === '/leaderboards') {
    presenceData.details = 'Checking the leaderboards!'
  }
  else {
    presenceData.details = 'Breaking stuff!'
  }

  if (!customData)
    presence.setActivity(presenceData)
})
