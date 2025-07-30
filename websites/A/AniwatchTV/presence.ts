import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1399965482609541172',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.postimg.cc/VkWpvxpL/favicon-1-1.png', 
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Watching,
  }

  const { href, pathname, search } = document.location

  switch (true) {
    case pathname === '/':
      presenceData.details = 'Browsing AniwatchTV homepage'
      presenceData.smallImageKey = Assets.Search
      break

    case pathname.startsWith('/search'):
      presenceData.details = `Searching: ${search.split('=')[1]?.replace(/\+/g, ' ')}`
      presenceData.smallImageKey = Assets.Search
      break

    case pathname.includes('/watch/'): {
      const title = document
        .querySelector<HTMLAnchorElement>('#ani_detail .anis-watch-detail .anisc-detail h2 a')
        ?.textContent?.trim()

      const episode = document
        .querySelector('.server-notice b')
        ?.textContent
        ?.trim()
        ?.match(/\d+/)?.[0]

      const cover = document.querySelector<HTMLImageElement>('#ani_detail .film-poster img')?.src

      presenceData.details = title ?? 'Hidden anime...'
      presenceData.state = episode ? `Watching ep. ${episode}` : 'Watching episodes!'
      presenceData.largeImageKey = cover ?? ActivityAssets.Logo
      presenceData.smallImageKey = ActivityAssets.Logo

      presenceData.buttons = [
        {
          label: 'Watch on AniwatchTV',
          url: href,
        },
      ]

      const video = document.querySelector('video') as HTMLVideoElement | null
      if (video && !Number.isNaN(video.duration)) {
        presenceData.startTimestamp =
          Date.now() - Math.floor(video.currentTime * 1000)
        presenceData.endTimestamp =
          Date.now() + Math.floor((video.duration - video.currentTime) * 1000)
      }

      break
    }

    default:
      presenceData.details = 'Browsing AniwatchTV...'
      presenceData.smallImageKey = Assets.Search
      break
  }

  presence.setActivity(presenceData)
})
