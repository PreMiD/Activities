import { ActivityAssets } from './presence.js'
import { getDropDownSelected, getInp, tDiffInMS, toDate } from './utils.js'

function searchToPres(presenceData: PresenceData, station: string) {
  const title = getInp('name') || ''
  const from = toDate(getInp('from')!)
  const to = toDate(getInp('to')!)
  const channel = getDropDownSelected('hash')

  presenceData.details = `Searching ${station}'s playlists`
  if (title)
    presenceData.state = `for ${title}}`
  if (channel)
    presenceData.largeImageText = `in channel ${channel}`

  if (from && to)
    presenceData.state += `(from ${from} to ${to})`
  else if (from)
    presenceData.state += `(from ${from})`
  else if (to)
    presenceData.state += `(to ${to})`
}

export function handleStation(
  presence: Presence,
  presenceData: PresenceData,
): void {
  // first is nothing
  const [, station, action] = document.location.pathname.split('/')

  presenceData.details = `Browsing ${station}`
  switch (action) {
    case 'playlist': {
      searchToPres(presenceData, station!)
      try {
        const yPath = new URL(
          document.querySelector<HTMLIFrameElement>(
            '[src*="//www.youtube.com/embed/"]',
          )?.src ?? '',
        ).pathname.split('/')[2]
        if (yPath) {
          const watching = {
            url: `https://www.youtube.com/watch?v=${yPath}`,
            title: document
              .querySelector(`[data-youtube="${yPath}"]`)
              ?.querySelector('.txtsong')
              ?.textContent || '',
          }
          presenceData.details = `Watching ${watching.title}`
          presenceData.state = `From ${station}`
          presenceData.buttons = [
            { label: 'View on YouTube', url: watching.url },
          ]
        }
      }
      catch {
        /* empty */
      }
      break
    }

    case 'archive':
      {
        searchToPres(presenceData, station!)
        const audioPlayer = document.querySelector('[title="Pause"]')
        if (audioPlayer) {
          presenceData.details = `From ${station}`

          // no there is not a better way, all the tags are the same
          const audioName = audioPlayer.parentElement?.parentElement?.parentElement?.parentElement?.querySelector(
            'h4',
          )?.textContent
          presenceData.state = `Listening to ${audioName}`
          const startTS = audioPlayer.parentElement?.querySelector(
            '.audioplayer-time-current',
          )?.textContent
          const endTS = audioPlayer.parentElement?.querySelector(
            '.audioplayer-time-duration',
          )?.textContent

          if (startTS)
            presenceData.startTimestamp = tDiffInMS(startTS)
          if (startTS && endTS) {
            [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
              presence.timestampFromFormat(startTS),
              presence.timestampFromFormat(endTS),
            )
          }
        }
      }
      break

    case 'frequency': {
      presenceData.details = station
      presenceData.state = 'Viewing Frequency Map'
      if (presenceData.buttons)
        presence.clearActivity()
      break
    }

    case 'schedule': {
      presenceData.details = `Viewing Schedule for ${station}`
      delete presenceData.state
      searchToPres(presenceData, station!)
      break
    }

    case 'news': {
      presenceData.details = `Viewing News for ${station}`
      delete presenceData.state
      break
    }

    default: {
      presenceData.details = `Browsing ${station}`
      presenceData.buttons = [
        { label: 'View Station', url: document.location.href },
      ]

      const play = document.querySelector('[data-original-title="Pause"]')
      if (play) {
        presenceData.state = `Listening to ${
          document.querySelector('.actSong')?.textContent
        }`
        presenceData.startTimestamp = tDiffInMS(
          document.querySelector('.ctime')?.textContent ?? '',
        )
        presenceData.largeImageText = document
          .querySelector('.server-conts')
          ?.querySelector('.active > .info')
          ?.textContent

        // check if they're recording
        if (document.querySelector('.live')) {
          presenceData.smallImageKey = ActivityAssets.MicIco
          presenceData.smallImageText = 'Recording Broadcast'
        }
      }
    }
  }

  presenceData.buttons = [
    { label: 'View Station', url: `${document.location.origin}/${station}/` },
  ]
}
