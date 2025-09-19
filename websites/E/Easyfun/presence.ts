const presence = new Presence({
  clientId: '1408054441252491326',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.postimg.cc/jjppBgff/ODF-1-1.png',
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const match = pathname.match(/\/cloud-games\/[a-z0-9-]+\.html/i)
  let gameName: string | null = null

if (match) {
  const rawName = pathname.split('/').pop()?.replace(/-cloud.*|\.html$/i, '') ?? ''
  gameName = rawName
    .split('-')
    .map(word =>
      /^\d+$/.test(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' '), // ✅ trailing comma
}

const gameIcon: string = document.querySelector('img[data-nimg="1"]')?.getAttribute('src') ?? ActivityAssets.Logo

  const presenceData: PresenceData = {
    largeImageKey: gameIcon,
    smallImageKey: ActivityAssets.Logo,
    details: gameName ? `Playing ${gameName}` : 'Exploring EasyFun',
    state: gameName ? 'Cloud Gaming' : 'Browsing on site',
    startTimestamp: browsingTimestamp,
    buttons: gameName ? [{ label: 'Play Now', url: href }] : undefined,
  }

  presence.setActivity(presenceData)
})
