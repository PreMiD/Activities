const presence = new Presence({
  clientId: '904304152048439296',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tenor/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'In home page'
  }
  else if (document.location.pathname.includes('/view/')) {
    presenceData.details = 'Viewing a gif:'
    presenceData.state = document.querySelector('h1')?.textContent
  }
  else if (document.location.pathname.includes('/search/')) {
    presenceData.details = 'Searching a GIF:'
    presenceData.state = document.querySelector('h1')?.textContent
  }
  else if (document.location.pathname.includes('/users/')) {
    presenceData.details = 'Viewing user profile:'
    presenceData.state = document.querySelector('.partnername')?.textContent
    presenceData.buttons = [
      {
        label: 'View User',
        url: document.URL,
      },
    ]
  }
  else {
    switch (document.location.pathname) {
      case '/reactions':
        presenceData.details = 'Viewing reaction GIFs'
        break
      case '/gif-maker':
        presenceData.details = 'Uploading a GIF'
        break
      case '/explore':
        presenceData.details = 'Exploring GIFs'
        break
      case '/mac':
        presenceData.details = 'Viewing Tenor for MAC'
        break
      case '/contentpartners':
        presenceData.details = 'Viewing partner list'
        break
      case '/gifapi':
        presenceData.details = 'Viewing API'
        break
      case '/gifapi/documentation':
        presenceData.details = 'Reading API docs'
        break
      case '/developer/keyregistration':
        presenceData.details = 'Registering a new api key'
        break
      case '/developer/dashboard':
        presenceData.details = 'Viewing developer dashboard'
        break
      default:
        presenceData.details = 'Browsing on the web'
        break
    }
  }
  presence.setActivity(presenceData)
})
