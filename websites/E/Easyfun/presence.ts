const presence = new Presence({
  clientId: '1408054441252491326'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://geographical-lime-9pydlktowb.edgeone.app/263cef731b755103d3a010a8941458d7%20(1).png'
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const match = pathname.match(/\/cloud-games\/([a-z0-9-]+)\.html/i)
  let gameName = null

  if (match && match[1]) {
    gameName = match[1]
      .replace(/(-cloud.*|\.html)$/i, '')
      .split('-')
      .map(word =>
        /^\d+$/.test(word)
          ? word
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ')
  }

  const gameIcon = document.querySelector('img[alt$="-icon"]')?.getAttribute('src')

  const presenceData: PresenceData = {
    largeImageKey: gameIcon ?? undefined,
    smallImageKey: ActivityAssets.Logo,
    details: gameName ? `Playing ${gameName}` : 'Exploring EasyFun',
    state: gameName ? 'Cloud Gaming' : 'Browsing on site',
    startTimestamp: browsingTimestamp,
    buttons: gameName ? [{ label: 'Play now', url: href }] : undefined
  }

  presence.setActivity(presenceData)
})
