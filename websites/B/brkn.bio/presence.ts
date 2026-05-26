const presence = new Presence({
  clientId: '1473095469973635122',
})

const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'logo',
    startTimestamp,
  }

  const path = window.location.pathname
  const isProfilePage = path.length > 1 && !path.includes('/settings')

  if (!isProfilePage) {
    presence.setActivity()
    return
  }

  const ogTitle = document.querySelector<HTMLMetaElement>(
    'meta[property="og:title"]',
  )

  const rawTitle = String(ogTitle?.content || '')
  const username = rawTitle.includes(' | ')
    ? (rawTitle.split(' | ')[0] ?? '').trim()
    : path.replace('/', '')

  const avatarEl = document.querySelector<HTMLImageElement>(
    'img[alt$=" avatar"]',
  )
  const avatarUrl = avatarEl ? avatarEl.src : null

  const showButton = await presence.getSetting<boolean>('showButton')
  const showTime = await presence.getSetting<boolean>('showTime')

  presenceData.details = username

  if (avatarUrl) {
    presenceData.largeImageKey = avatarUrl
  }

  if (showTime) {
    presenceData.startTimestamp = startTimestamp
  }
  else {
    delete presenceData.startTimestamp
  }

  if (showButton) {
    presenceData.buttons = [
      {
        label: 'Ver perfil',
        url: `https://www.brkn.bio${path}`,
      },
    ]
  }

  presence.setActivity(presenceData)
})
