import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1550648464084566136',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Y9mrSga.png',
}

function getElement(query: string): string | undefined {
  return document.querySelector(query)?.textContent?.trim() ?? undefined
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

async function getStrings() {
  return presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    live: 'general.live',
    viewHome: 'general.viewHome',
    browse: 'general.browsing',
    watchingLive: 'general.watchingLive',
    watchingVid: 'general.watchingVid',
    searchingFor: 'general.searchFor',
    searchingSomething: 'general.searchSomething',
    watchStream: 'general.buttonWatchStream',
    watchVideo: 'general.buttonWatchVideo',
  })
}

let strings: Awaited<ReturnType<typeof getStrings>>

const openedTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const [
    privacy,
    streamState,
    vidState,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<string>('streamState'),
    presence.getSetting<string>('vidState'),
  ])

  if (!strings)
    strings = await getStrings()

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: strings.browse,
    type: ActivityType.Watching,
    startTimestamp: openedTimestamp,
  }

  if (pathname === '/') {
    presenceData.details = strings.viewHome
  }
  else if (pathname.startsWith('/search')) {
    presenceData.details = strings.searchingSomething
  }
  else if (pathname.startsWith('/material/play')) {
    const title = getElement('.video-header h2')
    const author = getElement('.author-name a')
    const video = document.querySelector('video')

    if (title) {
      if (privacy) {
        presenceData.details = strings.watchingVid
      }
      else {
        presenceData.details = title
        presenceData.buttons = [
          { label: strings.watchVideo, url: document.URL },
        ]

        if (author)
          presenceData.state = vidState.replace('%uploader%', author)

        if (video?.duration) {
          const timeText = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`
          presenceData.state = author
            ? `${vidState.replace('%uploader%', author)} - ${timeText}`
            : timeText
        }
      }

      if (video) {
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
        presenceData.smallImageText = video.paused ? strings.pause : strings.play
      }
    }
    else {
      presenceData.details = strings.watchingVid
    }
  }
  else {
    const title = getElement('#J_roomTitle p')
    const streamer = getElement('.host-name')

    if (title && streamer) {
      if (privacy) {
        presenceData.details = strings.watchingLive
      }
      else {
        presenceData.details = title
        presenceData.state = streamState.replace('%streamer%', streamer)
        presenceData.buttons = [
          { label: strings.watchStream, url: document.URL },
        ]
      }
      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = strings.live
    }
    else {
      presenceData.details = strings.browse
    }
  }

  presence.setActivity(presenceData)
})
