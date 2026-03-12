const presence = new Presence({
  clientId: '1310452380915077170',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
let data

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LessWrong/assets/0.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname === '/') {
    presenceData.details = 'Browsing LessWrong'
    presenceData.state = 'at Homepage'
  }
  else if (document.location.pathname.startsWith('/posts/')) {
    data = document.location.pathname.split('/')
    const postTitle = document.querySelector('.PostsPageTitle-link')?.textContent
      || document.querySelector('.PostsPage-secondSplashPageHeader')
        ?.textContent
        || 'Unknown Post'
    presenceData.details = `Reading ${data[1]}`
    presenceData.state = postTitle

    presenceData.buttons = [
      {
        label: 'View Post',
        url: new URL(document.location.pathname, document.location.origin).href,
      },
    ]
  }
  else if (document.location.pathname.startsWith('/users/')) {
    data = document.location.pathname.split('/')

    presenceData.details = 'Viewing User'
    presenceData.state = `${
      document.querySelector('.UsersProfile-usernameTitle')?.textContent
      || 'Loading User'
    }'s profile`

    presenceData.buttons = [
      {
        label: 'View Profile',
        url: new URL(document.location.pathname, document.location.origin).href,
      },
    ]
  }
  else {
    presenceData.details = 'Browsing LessWrong'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
