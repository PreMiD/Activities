import { Assets } from 'premid'

const presence = new Presence({
  clientId: '609220157910286346',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})

function getTimesec(
  elapsedString = '00:00',
  durationString = '00:00',
  separator = ':',
): { elapsedSec: number, durationSec: number } {
  const elapsed = elapsedString.split(separator).map(Number.parseInt)
  const duration = durationString.split(separator).map(Number.parseInt)

  let elapsedSec = 0
  let durationSec = 0

  switch (elapsed.length) {
    case 3: {
      elapsedSec = (elapsed[0] ?? 0) * 60 * 60 + (elapsed[1] ?? 0) * 60 + (elapsed[2] ?? 0)
      break
    }
    case 2: {
      elapsedSec = (elapsed[0] ?? 0) * 60 + (elapsed[1] ?? 0)
      break
    }
    case 1: {
      [elapsedSec] = elapsed as [number]
      break
    }
  }

  switch (duration.length) {
    case 3: {
      durationSec = (duration[0] ?? 0) * 60 * 60 + (duration[1] ?? 0) * 60 + (duration[2] ?? 0)
      break
    }
    case 2: {
      durationSec = (duration[0] ?? 0) * 60 + (duration[1] ?? 0)
      break
    }
    case 1: {
      [durationSec] = duration as [number]
      break
    }
  }

  return { elapsedSec, durationSec }
}

presence.on('UpdateData', async () => {
  switch (location.hostname) {
    case 'www.nicovideo.jp': {
      if (location.pathname.startsWith('/watch/')) {
        const startTimeStamp = document
          .querySelector(
            'div[data-styling-id=":r4:"]  span.white-space_nowrap',
          )
          ?.textContent
          ?.split(':')
          .map(e => Number.parseInt(e))
          .reverse()
          .reduce((acc, cur, i) => acc + cur * 60 ** i, 0)
        const ownerElement = document.querySelector(
          'a[data-anchor-area="video_information"]:not(:has(div))',
        )
        const imageElement = document.querySelector('meta[property="og:image"]')
        const isPlaying = !!document.querySelector(
          '#tooltip\\:\\:r5\\:\\:trigger  > svg > path[fill-rule="evenodd"]',
        )
        const presenceData: PresenceData = {
          details: document.querySelector('main h1')?.textContent,
          state: `${
            ownerElement ? ownerElement.textContent : 'Deleted User'
          } - ${location.pathname.match(/..\d+$/)?.[0]}`,
          largeImageKey: imageElement
            ? imageElement.attributes.getNamedItem('content')?.value
            : 'https://cdn.rcd.gg/PreMiD/websites/N/niconico/assets/logo.png',
          smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
          smallImageText: isPlaying
            ? (await strings).play
            : (await strings).pause,
          startTimestamp: Math.floor(Date.now() / 1000) - (startTimeStamp ?? 0),
        }
        presence.setActivity(presenceData)
      }
      break
    }

    case 'live.nicovideo.jp':
    case 'live2.nicovideo.jp': {
      if (location.pathname.startsWith('/watch/lv')) {
        const presenceData: PresenceData = {
          details: document.querySelector(
            ' [class^=\'___program-title___\'] span ',
          )?.textContent,
          state: `${
            (
              document.querySelector('[class^=\'___channel-name-anchor___\']')
              ?? document.querySelector('[class^=\'___group-name-anchor___\']')
            )?.textContent
          } - ${location.pathname.match(/lv\d+/)?.[0]}`,
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/niconico/assets/logo.png',
          smallImageKey: Assets.Live,
          smallImageText: (await strings).live,
          startTimestamp: Math.floor(Date.now() / 1000)
            - getTimesec(
              document.querySelector(
                ' span[class^=\'___time-score___\'] span[class^=\'___value___\'] ',
              )?.textContent ?? '',
            ).elapsedSec,
        }

        presence.setActivity(presenceData)
      }
      else {
        presence.clearActivity()
      }

      break
    }

    case 'seiga.nicovideo.jp': {
      const presenceData: PresenceData = {
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/niconico/assets/logo.png',
      }
      if (location.pathname.startsWith('/seiga/im')) {
        presenceData.details = document.querySelector('.title')?.textContent
        presenceData.state = `${
          document.querySelector('#ko_watchlist_header.user .user_name strong')
            ?.textContent
        } - ${location.pathname.match(/im\d+/)?.[0]}`

        presence.setActivity(presenceData)
      }
      else if (location.pathname.startsWith('/watch/mg')) {
        presenceData.details = document.querySelector('.title')?.textContent
        presenceData.state = `${
          document.querySelector('.author_name')?.textContent
        } - ${location.pathname.match(/mg\d+/)?.[0]}`
      }
      if (presenceData.details)
        presence.setActivity(presenceData)
      else presence.setActivity()

      break
    }

    default:
      presence.setActivity()
      break
  }
})
