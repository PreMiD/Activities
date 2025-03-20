import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1247668968395903030',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/LiveATC/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, hostname } = document.location

  switch (hostname.split('.')[0]) {
    case 'www': {
      switch (pathname.split('/')[1]?.replace('.php', '')) {
        case '': {
          presenceData.details = 'Viewing homepage'
          break
        }
        case 'index': {
          presenceData.details = 'Viewing homepage'
          break
        }
        case 'search': {
          const params = new URL(href).searchParams

          presenceData.details = 'Searching'
          presenceData.state = `${
            params.get('freq')
              ? 'Frequency: '
              : params.get('icao')
                ? 'ICAO: '
                : ''
          }${params.get('freq') || params.get('icao')?.toUpperCase() || ''}`
          break
        }
        case 'hlisten': {
          const radioInfo = document
            .querySelector('h1')
            ?.childNodes
            .item(2)
            .textContent
            ?.split(' - ')

          presenceData.details = radioInfo?.[0]
          presenceData.state = radioInfo?.[1]
          presenceData.largeImageText = document
            .querySelector('font')
            ?.textContent
            ?.trim()
          presenceData.smallImageKey = Assets.Live
          presenceData.buttons = [
            {
              url: href,
              label: 'Listen to Feed',
            },
          ]
          break
        }
        case 'archive': {
          if (document.querySelector('audio')) {
            const audio = document.querySelector('audio')!

            presenceData.details = 'Listening to archive'
            presenceData.state = audio
              .querySelector('source')
              ?.src
              ?.split('/')[4]
              ?.split('.')[0]
            presenceData.smallImageKey = audio.paused
              ? Assets.Pause
              : Assets.Play
            presenceData.smallImageText = audio.paused ? 'Paused' : 'Playing'
            if (!audio.paused) {
              [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(audio)
            }
          }
          else {
            presenceData.details = 'Searching archive'
          }
          break
        }
        case 'recordings': {
          presenceData.details = 'Browsing recordings'
          break
        }
        case 'feedindex': {
          presenceData.details = 'Browsing feeds'
          presenceData.state = document.querySelector('h1 > font')
          break
        }
        case 'topfeeds': {
          presenceData.details = 'Browsing top 50 feeds'
          break
        }
        case 'map': {
          presenceData.details = 'Viewing feed map'
          break
        }
        case 'badwxfeeds': {
          presenceData.details = 'Viewing bad weather airports'
          break
        }
        case 'coverage': {
          presenceData.details = 'Viewing coverage guide'
          break
        }
        default: {
          presenceData.details = pathname.split('/')[1]?.replace('.php', '')
          break
        }
      }
      break
    }
    case 'forums': {
      const pageURL = document.querySelector<HTMLAnchorElement>(
        '.navigate_section .last a',
      )?.href

      presenceData.details = 'Browsing the forums'
      presenceData.state = document.querySelector(
        '.navigate_section .last span',
      )
      if (pageURL && new URL(pageURL).pathname.split('/')[1] !== 'index.php') {
        presenceData.buttons = [
          {
            url: pageURL,
            label: 'View page',
          },
        ]
      }
    }
  }

  presence.setActivity(presenceData)
})
