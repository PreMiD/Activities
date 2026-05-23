import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1417881802193764492',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SPWN/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    playing: 'general.playing',
    paused: 'general.paused',
    watchingLive: 'general.watchingLive',
    buttonViewPage: 'general.buttonViewPage',
    viewAPage: 'general.viewAPage',
  })

  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Play,
  }
  const { pathname } = document.location

  if (pathname.startsWith('/_')) {
    // internal site (e.g. firebase auth)
    presence.clearActivity()
    return
  }

  const video = document.querySelector<HTMLVideoElement>('video')

  const eventId = /\/events\/([^/]+)/.exec(document.location.pathname)?.[1]
  if (eventId) {
    if (pathname.endsWith('/streaming')) {
      presenceData.details = strings.watchingLive

      if (privacy === false) {
        const title = document.querySelector<HTMLParagraphElement>('#Streaming > div:nth-of-type(3) > p')?.textContent
        if (title) {
          presenceData.state = title
          presenceData.largeImageText = title
        }

        const poster = getPoster()
        if (poster) {
          presenceData.largeImageKey = poster
        }
      }
    }
    else {
      if (privacy === false) {
        const title = document.querySelector<HTMLHeadingElement>('h2')?.textContent
        if (title) {
          presenceData.state = title
          presenceData.largeImageText = title
        }

        const coverArt = getCoverArt()
        if (coverArt) {
          presenceData.largeImageKey = coverArt
        }
      }

      if (pathname.endsWith('/ticket')) {
        presenceData.details = 'Buying ticket'
      }
      else {
        presenceData.details = strings.viewAPage
      }
    }

    if (privacy === false && buttons) {
      presenceData.buttons = [
        {
          label: strings.buttonViewPage,
          url: `https://spwn.jp/events/${eventId}`,
        },
      ]
    }
  }
  else if (pathname.startsWith('/account/ticket')) {
    // '/account/ticket/vod' is vod tickets page, not a ticket page
    const eventId = /\/account\/ticket\/(?!vod)([^/]+)/.exec(document.location.pathname)?.[1]
    if (eventId) {
      presenceData.details = 'Checking my ticket'

      if (privacy === false) {
        const title = document.querySelector<HTMLParagraphElement>('.title')?.textContent
        if (title) {
          presenceData.state = title
          presenceData.largeImageText = title
        }

        const coverArt = getCoverArt()
        if (coverArt) {
          presenceData.largeImageKey = coverArt
        }
      }
    }
    else {
      presenceData.details = 'Checking my tickets'
    }
  }
  else {
    switch (pathname) {
      case '/':
        presenceData.details = 'Browsing home page'
        break
      case '/settlement':
        presenceData.details = 'Buying ticket'
        break
      default:
        presenceData.details = `Browsing ${pathname.split('/')[1]?.replace('-', ' ')} page`
        break
    }
  }

  if (video) {
    presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video.paused
      ? strings.paused
      : strings.playing

    if (video?.paused === false && privacy === false) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
  }

  presence.setActivity(presenceData)
})

function getCoverArt(): string | undefined {
  return Array.from(document.querySelectorAll<HTMLImageElement>('img')).find(img => img.src.startsWith('https://public-web.spwn.jp/events/'))?.src
}

function getPoster(): string | undefined {
  return Array.from(document.querySelectorAll<HTMLVideoElement>('video')).find(video => video.poster.startsWith('https://public-web.spwn.jp/events/'))?.poster
}
