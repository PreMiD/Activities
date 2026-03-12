const presence = new Presence({
  clientId: '1018191690210754693',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/e-z/assets/logo.png',
  }
  const username = document.querySelector('p[id=premid-username]')?.textContent
  const uid = document.querySelector('p[id=premid-uid]')?.textContent
  const { pathname, href, hostname } = document.location

  switch (hostname) {
    case 'e-z.host':
      if (username && uid) {
        presenceData.details = `Username: ${username} | ${uid}`
        presenceData.buttons = [
          {
            label: 'User Page',
            url: `https://e-z.host/u/${username}`,
          },
        ]
      }
      else {
        presenceData.details = 'Not logged in'
      }

      switch (pathname) {
        case '/':
          presenceData.state = 'Viewing the home page'
          break

        case '/faq':
          presenceData.state = 'Viewing frequently asked questions'
          break

        case '/features':
          presenceData.state = 'Viewing e-z.host\'s features'
          break

        case '/reseller':
          presenceData.state = 'Viewing info about e-z.host\'s reseller'
          break

        case '/oliver':
          presenceData.state = 'Looking at pictures of Oliver'
          break

        case '/dash':
          presenceData.state = 'Viewing the dashboard'
          break

        case '/dash/domains':
          presenceData.state = 'Exploring the domains'
          break

        case '/dash/settings':
          presenceData.state = 'Changing their settings'
          break

        case '/dash/gallery':
          presenceData.state = 'Viewing their gallery'
          break

        case '/dash/leaderboard':
          presenceData.state = 'Viewing the overall leaderboard'
          break

        case '/dash/leaderboard/daily':
          presenceData.state = 'Viewing the daily leaderboard'
          break

        case '/dash/leaderboard/weekly':
          presenceData.state = 'Viewing the weekly leaderboard'
          break

        case '/dash/upload':
          presenceData.state = 'Uploading a file'
          break

        case '/dash/shorten':
          presenceData.state = 'Shortening a url'
          break

        case '/dash/pastes':
          presenceData.state = 'Creating a paste'
          break

        case '/dash/editor':
          presenceData.state = 'Editing their bio page'
          break

        case '/dash/account':
          presenceData.state = 'Viewing their account page'
          break
      }
      if (!presenceData.state) {
        if (pathname.includes('/u/')) {
          presenceData.state = `Viewing ${
            document.querySelector('#premid-pageusername')?.textContent
          }'s user page`
        }
        else {
          presenceData.state = 'Page not found'
        }
      }
      break

    case 'e-z.bio':
      if (pathname === '/') {
        presenceData.details = 'e-z.bio front page'
      }
      else {
        presenceData.details = `Viewing ${pathname.replace(
          '/',
          '',
        )}'s bio page`
        presenceData.buttons = [
          {
            label: 'View Page',
            url: href.split('?')[0] ?? '',
          },
        ]
      }
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
