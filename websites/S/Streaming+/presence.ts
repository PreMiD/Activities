import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1359510663159877642',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let data: Metadata | undefined

presence.on('UpdateData', async () => {
  const strings = await presence.getStrings({
    playing: 'general.playing',
    paused: 'general.paused',
    watchingLive: 'general.watchingLive',
    waitingLive: 'general.waitingLive',
    waitingLiveThe: 'general.waitingLiveThe',
    waitingVid: 'general.waitingVid',
    waitingVidThe: 'general.waitingVidThe',
    buttonWatchStream: 'general.buttonWatchStream',
    buttonViewPage: 'general.buttonViewPage',
    viewAPage: 'general.viewAPage',
  })

  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Streaming%2B/assets/logo.jpeg',
    startTimestamp: browsingTimestamp,
  }

  if (!data)
    data = extractMetadata()

  const streamId = /(\d+|sample)/.exec(document.location.pathname)?.[1]

  if (streamId && data) {
    switch (data.delivery_status) {
      case 'PREPARING': // pre event
        presenceData.details = privacy ? strings.waitingLive : strings.waitingLiveThe
        break

      case 'WAIT_CONFIRM_ARCHIVED': // post event, waiting for encoding
        presenceData.details = privacy ? strings.waitingVid : strings.waitingVidThe
        break

      case 'STARTED': // now event, live is now
      case 'CONFIRMED_ARCHIVE': // post event, archive is available
        presenceData.details = strings.watchingLive
        break

      default: // archive is dead, etc...
        presenceData.details = strings.viewAPage
    }

    const video = document.querySelector<HTMLVideoElement>('#video0_html5_api')
    if (video) {
      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play
      presenceData.smallImageText = video.paused
        ? strings.paused
        : strings.playing
    }

    if (!privacy) {
      presenceData.state = data?.app_name
      presenceData.largeImageText = data?.app_name

      if (buttons) {
        presenceData.buttons = [{
          label: strings.buttonWatchStream,
          url: document.location.href.split('?')[0] || document.location.href,
        }, {
          label: strings.buttonViewPage,
          url: data.buy_ticket_url,
        }]
      }

      if (data.thumbnail)
        presenceData.largeImageKey = data.thumbnail

      if (video?.paused === false) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
      }
    }
  }

  presence.setActivity(presenceData)
})

interface Metadata {
  app_name: string // streaming title
  buy_ticket_url: string
  delivery_status: 'PREPARING' | 'STARTED' | 'WAIT_CONFIRM_ARCHIVED' | 'CONFIRMED_ARCHIVE' | string

  thumbnail?: string
}

function extractMetadata(): Metadata | undefined {
  let meta: Metadata | undefined
  for (const tag of document.querySelectorAll('script')) {
    const raw = /var app = (.+);/.exec(tag.innerHTML)
    if (raw)
      meta = JSON.parse(raw[1]!)
  }

  if (meta) {
    presence.info(`metadata found: ${meta}`)
    meta.thumbnail = extractEventThumbnail(meta)
  }

  return meta
}

function extractEventThumbnail(meta: Metadata) {
  if (meta?.buy_ticket_url) {
    const id = /.*(\d{6})(\d{4}).*/.exec(meta.buy_ticket_url)
    if (id?.length === 3) {
      return `https://eplus.jp/s/image/${id[1]}/${id[2]}/000/${id[1]}${id[2]}_1.png`
    }
  }
}
