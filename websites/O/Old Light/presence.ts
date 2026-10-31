const presence = new Presence({
  clientId: '1566160406680965120',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/XxEisPT.png',
}

function galaxyName(slug: string): string {
  return decodeURIComponent(slug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    buttons: [
      {
        label: 'Play Old Light',
        url: 'https://oldlight.io/play?utm_source=discord-presence&utm_medium=premid',
      },
    ],
  }

  const galaxy = pathname.match(/^\/game\/galaxy\/([^/]+)/)?.[1]
  if (galaxy)
    presenceData.details = `Galaxy ${galaxyName(galaxy)}`
  else if (pathname.startsWith('/guide'))
    presenceData.details = 'Reading the guide'
  else if (pathname.startsWith('/blog'))
    presenceData.details = 'Reading the blog'
  else if (/^\/galaxy\/[^/]+\/map/.test(pathname))
    presenceData.details = 'Viewing the galaxy map'
  else if (pathname.startsWith('/leaderboard'))
    presenceData.details = 'Viewing the leaderboard'
  else
    presenceData.details = 'Browsing the website'

  presence.setActivity(presenceData)
})
