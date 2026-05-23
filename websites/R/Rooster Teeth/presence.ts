import { Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1405254120809566218',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Rooster%20Teeth/assets/logo.png',
}

let iFrameData: {
  video?: {
    paused?: boolean
    currentTime?: number
    duration?: number
    title?: string
  }
} = {}

presence.on('iFrameData', (data) => {
  iFrameData = data
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    name: 'Rooster Teeth',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname, href } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')

  switch (pathname.split('/')[1]) {
    case 'about':
      Object.assign(presenceData)
      presenceData.details = 'Browsing About RT'
      presenceData.smallImageKey = Assets.Reading
      break

    case 'community':
      Object.assign(presenceData)

      presenceData.smallImageKey = Assets.Reading

      if (pathname.split('/')[4]) {
        presenceData.details = 'Reading forum post:'
        presenceData.state = document.querySelector('h2')?.textContent

        if (buttons) {
          presenceData.buttons = [
            {
              label: 'Read post',
              url: href,
            },
          ]
        }
      }
      else {
        presenceData.details = 'Browsing Community Forum'
      }
      break

    case 'series':
      Object.assign(presenceData)

      presenceData.smallImageKey = Assets.Search

      if (pathname.split('/')[2]) {
        presenceData.details = 'Browsing through episodes of:'
        presenceData.state = document.querySelector('title')
      }
      else {
        presenceData.details = 'Browsing Shows'
      }
      break

    case 'watch':
      Object.assign(presenceData)
      if (iFrameData.video) {
        const { paused, currentTime, duration } = iFrameData.video

        presenceData.details = document.querySelector('h1')?.textContent
        presenceData.state = document.querySelector('main a span > div > span')?.textContent

        if (currentTime && duration && !paused) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing'
        }
        else {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
      }

      if (buttons) {
        presenceData.buttons = [
          {
            label: 'Watch Episode',
            url: href,
          },
        ]
      }
      break

    case 'user':
      Object.assign(presenceData)

      if (pathname.split('/')[2]) {
        presenceData.details = 'Viewing User:'
        presenceData.state = document.querySelector('h1')?.textContent

        if (buttons) {
          presenceData.buttons = [
            {
              label: 'View User',
              url: href,
            },
          ]
        }
      }
      break

    default:
      presenceData.details = 'Browsing...'
      break
  }

  presence.setActivity(presenceData)
})
