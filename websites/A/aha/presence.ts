import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/aha/assets/logo.png',
}
function getVideoStatus(presenceData: PresenceData, video: HTMLVideoElement) {
  if (video.paused) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'paused'
    delete presenceData.startTimestamp
  }
  else {
    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'playing'
  }
  return presenceData
}
function setPresenceStatus(presenceData: PresenceData) {
  const currentPresenceData = getVideoStatus(
    presenceData,
    document.querySelector<HTMLVideoElement>('video')!,
  )
  currentPresenceData.details = 'Watching'
  currentPresenceData.state = document.querySelector(
    'div.player-title > span.player-label-title',
  )?.textContent
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'aha',
  }
  const { pathname } = document.location

  switch (true) {
    case pathname === '/': {
      presenceData.details = 'Viewing home page'
      break
    }
    case pathname === '/movies': {
      presenceData.details = 'Browsing movies'
      break
    }
    case pathname === '/shows': {
      presenceData.details = 'Browsing shows'
      break
    }
    case pathname === '/my-aha': {
      presenceData.details = 'Viewing watch list'
      break
    }
    case pathname.startsWith('/movie'): {
      presenceData.details = `Viewing ${
        document.querySelector('h1.title')?.textContent
      }`
      break
    }
    case pathname.startsWith('/player/movie'):
      setPresenceStatus(presenceData)
      break
    case pathname.startsWith('/webepisode')
      || pathname.startsWith('/webseries'): {
      presenceData.details = `Viewing ${
        document.querySelector('h1.title')?.textContent
      }`
      break
    }
    case pathname.startsWith('/player/webepisode')
      || pathname.startsWith('/player/webseries'): {
      const currentPresenceData = getVideoStatus(
        presenceData,
        document.querySelector<HTMLVideoElement>('video')!,
      )
      const title = document.querySelector(
        'div.player-title > span.player-label-title',
      )?.textContent
      const subtitle = document.querySelector(
        'div.player-title > span.player-label-title__subtitle',
      )?.textContent
      currentPresenceData.details = 'Watching'

      currentPresenceData.state = subtitle ? `${title} | ${subtitle}` : title
      break
    }
    case pathname.includes('/account'):
      presenceData.details = 'Viewing account details'
      break
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
