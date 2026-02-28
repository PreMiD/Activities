const presence = new Presence({
  clientId: '1408054441252491326',
})

let lastUrl = document.location.href
let startTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Vc51Wzs.png',
}

function getGameIcon(): string | null {
  const iconEl
    = document.querySelector<HTMLImageElement>('img[data-nimg="1"][width="60"][height="60"]')
      || document.querySelector<HTMLImageElement>('img[data-nimg="1"][width="128"][height="128"]')
      || document.querySelector<HTMLImageElement>('img.size-25')
      || document.querySelector<HTMLImageElement>('img[data-nimg="1"]')

  return iconEl?.src || null
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const isGamePage = pathname.includes('/cloud-games/')

  if (href !== lastUrl) {
    lastUrl = href
    startTimestamp = Math.floor(Date.now() / 1000)
  }

  let gameName: string | null = null
  let gameIcon: string | null = null

  if (isGamePage) {
    const rawName = pathname.split('/').pop()?.replace(/-cloud.*|\.html$/i, '') ?? ''
    gameName = rawName
      .split('-')
      .map(word =>
        /^\d+$/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(' ')

    gameIcon = getGameIcon()
  }

  const presenceData: PresenceData = {
    largeImageKey: gameIcon || ActivityAssets.Logo,
    details: isGamePage && gameName ? `Playing ${gameName}` : 'Exploring EasyFun',
    state: isGamePage ? 'Cloud Gaming' : 'Browsing on site',
    startTimestamp,
  }

  if (isGamePage) {
    presenceData.buttons = [{ label: 'Play Now', url: href }]
    presenceData.smallImageKey = ActivityAssets.Logo
  }

  presence.setActivity(presenceData)
})
