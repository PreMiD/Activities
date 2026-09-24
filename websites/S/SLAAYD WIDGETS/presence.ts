const presence = new Presence({
  clientId: '1522265954686337255',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/rj0odvQ.png',
}

const siteUrl = 'https://slaayd.xyz/'

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const data: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageUrl: siteUrl,
    detailsUrl: siteUrl,
    startTimestamp: browsingTimestamp,
    buttons: [
      {
        label: 'Visit SLAAYD WIDGETS',
        url: siteUrl,
      },
    ],
  }

  if (pathname === '/') {
    data.details = 'Viewing the homepage'
    data.state = 'SLAAYD WIDGETS'
  }
  else {
    data.details = 'Browsing SLAAYD WIDGETS'
    data.state = document.title
  }

  presence.setActivity(data)
})
