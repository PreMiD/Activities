import { Assets } from 'premid'

const presence = new Presence({
  clientId: '630428033966276612',
})
const strings = presence.getStrings({
  pause: 'general.paused',
})
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Prambors%20Radio/assets/logo.png',
}

let timestamp: number | null = null

presence.on('UpdateData', async () => {
  const { pause } = await strings
  if (
    ['streaming.pramborsfm.com', 'live.pramborsfm.com'].includes(
      document.location.hostname,
    )
  ) {
    presenceData.buttons = [
      {
        label: 'Listen to Prambors',
        url: 'https://live.pramborsfm.com',
      },
    ]
    timestamp ??= Date.now()
    switch (document.location.hostname) {
      case 'streaming.pramborsfm.com': {
        const status = document.querySelector('#playerBtn')?.className
        if (status === 'stopped') {
          timestamp = null
          delete presenceData.startTimestamp
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = pause
        }
        else if (status === 'playing') {
          presenceData.smallImageKey = Assets.Live
          presenceData.smallImageText = 'Listening'
          presenceData.startTimestamp = timestamp
        }
        presenceData.state = document
          .querySelectorAll('span[data-radium=true]')
          .item(3)
          .textContent
        presenceData.details = document
          .querySelectorAll('span[data-radium=true]')
          .item(2)
          .textContent
        break
      }
      case 'live.pramborsfm.com': {
        const buttonAction = [
          ...[...document.querySelectorAll('button')].pop()!.classList,
        ]
          .pop()
          ?.split('--')
          .pop()
        if (buttonAction === 'play') {
          timestamp = null
          delete presenceData.startTimestamp
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = pause
        }
        else if (buttonAction === 'pause') {
          presenceData.smallImageKey = Assets.Live
          presenceData.smallImageText = 'Listening'
          presenceData.startTimestamp = timestamp
        }
        presenceData.state = document.querySelector(
          '.td-player-vertical__track-info__artist-name',
        )?.textContent
        presenceData.details = document.querySelector(
          '.td-player-vertical__track-info__cue-title',
        )?.textContent
        break
      }
    }
  }
  presence.setActivity(presenceData)
})
