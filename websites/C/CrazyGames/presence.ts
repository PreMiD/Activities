import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1348290237381611601',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cloud.falco.fun/s/G9ojdWxsnSRWyeZ/download/logo-v2.png',
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    browsing: 'general.browsing',
    buttonViewGame: 'general.buttonViewGame',
  })

  const presenceData: PresenceData = {
    name: 'CrazyGames',
    type: ActivityType.Playing,
    details: strings.browsing,
    startTimestamp: browsingTimestamp,
    largeImageKey: ActivityAssets.Logo,
  }

  const englishUrl = document.querySelector('link[hreflang=en]')?.getAttribute('href')

  if (englishUrl) {
    const pathname = new URL(englishUrl).pathname

    if (pathname.startsWith('/game/')) {
      const name = document.querySelector('meta[name=apple-mobile-web-app-title]')?.getAttribute('content')
      const thumbnail = document.querySelector('meta[property="og:image"')?.getAttribute('content')

      if (name) {
        presenceData.details = name
        presenceData.buttons = [
          {
            label: strings.buttonViewGame,
            url: document.location.href,
          },
        ]

        if (thumbnail) {
          const squareThumbnailUrl = thumbnail.replaceAll('16x9', '1x1')
          const squareThumbnailResponse = await fetch(new URL('?width=1', squareThumbnailUrl))
          const mobileThumbnailAvailable = squareThumbnailResponse.ok

          const thumbnailUrl = mobileThumbnailAvailable
            ? new URL('?width=512&', squareThumbnailUrl)
            : new URL('?width=512&height=512&fit=crop', thumbnail)
          presenceData.largeImageKey = thumbnailUrl.toString()
          presenceData.smallImageKey = ActivityAssets.Logo
          presenceData.smallImageText = 'CrazyGames'
        }
      }
    }
  }

  presence.setActivity(presenceData)
})
