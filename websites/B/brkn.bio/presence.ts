const presence = new Presence({
  clientId: '1473095469973635122',
})

const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/brkn.bio/assets/logo.png',
    startTimestamp,
  }

  const path = window.location.pathname
  const isProfilePage = path.length > 1 && !path.includes('/settings')

  if (!isProfilePage) {
    presence.clearActivity()
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

  const [showButton, showTime] = await Promise.all([
    presence.getSetting<boolean>('showButton'),
    presence.getSetting<boolean>('showTime'),
  ])

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
        label: 'Ver Perfil',
        url: `https://www.brkn.bio${path}`,
      },
    ]
  }

  presence.setActivity(presenceData)
})
