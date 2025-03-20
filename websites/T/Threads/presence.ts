const presence = new Presence({
  clientId: '1237798561739968513',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
function capitalize(text: string): string {
  return text
    .replace(/[[{(_)}\]]/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
}

presence.on('UpdateData', async () => {
  const [privacy, time] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('time'),
  ])
  const { pathname, href, search } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Threads/assets/logo.png',
  }

  presenceData.details = 'Browsing...'

  if (pathname.match('/following')) {
    presenceData.state = 'Following feed'
  }
  else if (pathname.match('/saved')) {
    presenceData.state = 'Saved threads'
  }
  else if (pathname.match('/liked')) {
    presenceData.state = 'Liked threads'
  }
  else if (pathname.match('/login') || pathname.match('/nonconsent')) {
    presenceData.details = 'Logging in'
  }
  else if (pathname.match('/search') && !privacy) {
    presenceData.details = 'Searching for:'
    presenceData.state = new URLSearchParams(search).get('q')

    if (!presenceData.state)
      presenceData.details = 'Search'
  }
  else if (pathname.startsWith('/@')) {
    presenceData.state = pathname.split('/')[1]

    if (!privacy) {
      presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
        `img[alt*="${presenceData.state?.split('@')[1]}"]`,
      )?.src

      presenceData.smallImageText = presenceData.state?.split('@')[1]
    }

    if (pathname.split('/')[2] === 'post') {
      presenceData.details = 'Viewing a thread'

      if (!privacy) {
        presenceData.buttons = [
          {
            label: 'View Thread',
            url: href,
          },
        ]
      }
    }
    else {
      presenceData.details = 'Viewing a profile'

      if (!privacy) {
        presenceData.buttons = [
          {
            label: 'View Profile',
            url: href,
          },
        ]
      }
    }
  }
  else if (pathname.split('/')[1]) {
    presenceData.details = capitalize(pathname.split('/')[1]!)
    presenceData.state = capitalize(pathname.split('/')[2] || '')
  }
  else {
    presenceData.state = 'For You feed'
  }

  if (privacy)
    delete presenceData.state

  if (time)
    presenceData.startTimestamp = browsingTimestamp

  presence.setActivity(presenceData)
})
