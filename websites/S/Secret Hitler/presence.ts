const presence = new Presence({
  clientId: '894514361559818260',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Secret%20Hitler/assets/logo.png',
  Private = 'https://cdn.rcd.gg/PreMiD/websites/S/Secret%20Hitler/assets/0.png',
  Unlisted = 'https://cdn.rcd.gg/PreMiD/websites/S/Secret%20Hitler/assets/1.png',
}

presence.on('UpdateData', async () => {
  const [time, buttons] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hash, href } = document.location

  switch (pathname.split('/')[1]) {
    case 'game': {
      presenceData.details = 'Browsing lobbies'
      switch (hash.split('/')[1]) {
        case 'creategame': {
          presenceData.details = 'Creating a game'
          break
        }
        case 'profile': {
          presenceData.details = 'Viewing profile'
          presenceData.state = document.querySelector('.profile.header')
          presenceData.buttons = [{ label: 'View Profile', url: href }]
          break
        }
        case 'table': {
          let isPlaying = false
          for (const element of document.querySelectorAll(
            '.player-number > span',
          )) {
            if (
              document.querySelector('.playername')?.textContent
              === (document
                .querySelectorAll('.player-number > span')[0]
                ?.textContent
                ?.match(/^\d+\. ([A-Z0-9]+)/i) ?? '')[1]
                || document.querySelector('.playername')?.textContent
                === element.textContent
            ) {
              isPlaying = true
            }
          }
          presenceData.details = `${
            isPlaying ? 'Playing' : 'Observing'
          } game [${
            document.querySelector('.player-count > span')?.textContent
          } Player${
            Number.parseInt(
              document.querySelector('.player-count > span')?.textContent ?? '0',
            ) === 1
              ? ''
              : 's'
          }]`
          presenceData.state = `${
            document.querySelector('.game-name')?.textContent
          }`
          if (document.querySelector('.option-icons .lock')) {
            presenceData.smallImageKey = ActivityAssets.Private
            presenceData.smallImageText = 'Private game'
          }
          if (!document.querySelector('.option-icons .lock.green')) {
            presenceData.buttons = [{ label: 'View Table', url: href }]
          }
          else {
            presenceData.smallImageKey = ActivityAssets.Unlisted
            presenceData.smallImageText = 'Unlisted game'
          }
          break
        }
        case 'replay': {
          const turnSlider = document.querySelector('.rc-slider-handle')
          presenceData.details = `Viewing replay ${
            turnSlider
              ? `[Turn ${turnSlider?.ariaValueNow}/${turnSlider?.ariaValueMax}]`
              : '[Chat]'
          }`
          presenceData.state = `${
            document.querySelector('.game-name')?.textContent
          }`
          if (document.querySelector('.option-icons .lock')) {
            presenceData.smallImageKey = ActivityAssets.Private
            presenceData.smallImageText = 'Private game'
          }
          if (!document.querySelector('.option-icons .lock.green')) {
            presenceData.buttons = [{ label: 'View Replay', url: href }]
          }
          else {
            presenceData.smallImageKey = ActivityAssets.Unlisted
            presenceData.smallImageText = 'Unlisted game'
          }
          break
        }
      }
      break
    }
    case 'observe': {
      presenceData.details = 'Browsing lobbies'
      switch (hash.split('/')[1]) {
        case 'profile': {
          presenceData.details = 'Viewing profile'
          presenceData.state = document.querySelector('.profile.header')
          presenceData.buttons = [{ label: 'View Profile', url: href }]
          break
        }
        case 'table': {
          presenceData.details = `Observing game [${document.querySelector('.player-count > span')?.textContent} Player${
            Number.parseInt(
              document.querySelector('.player-count > span')?.textContent ?? '0',
            ) === 1
              ? ''
              : 's'
          }]`
          presenceData.state = `${
            document.querySelector('.game-name')?.textContent
          }`
          if (document.querySelector('.option-icons .lock')) {
            presenceData.smallImageKey = ActivityAssets.Private
            presenceData.smallImageText = 'Private game'
          }
          if (!document.querySelector('.option-icons .lock.green')) {
            presenceData.buttons = [{ label: 'View Table', url: href }]
          }
          else {
            presenceData.smallImageKey = ActivityAssets.Unlisted
            presenceData.smallImageText = 'Unlisted game'
          }
          break
        }
        case 'replay': {
          const turnSlider = document.querySelector('.rc-slider-handle')
          presenceData.details = `Viewing replay ${
            turnSlider
              ? `[Turn ${turnSlider?.ariaValueNow}/${turnSlider?.ariaValueMax}]`
              : '[Chat]'
          }`
          presenceData.state = `${
            document.querySelector('.game-name')?.textContent
          }`
          if (document.querySelector('.option-icons .lock')) {
            presenceData.smallImageKey = ActivityAssets.Private
            presenceData.smallImageText = 'Private game'
          }
          if (!document.querySelector('.option-icons .lock.green')) {
            presenceData.buttons = [{ label: 'View Replay', url: href }]
          }
          else {
            presenceData.smallImageKey = ActivityAssets.Unlisted
            presenceData.smallImageText = 'Unlisted game'
          }
          break
        }
      }
      break
    }
    default: {
      presenceData.details = `Viewing ${
        document.querySelector('nav > .active')?.textContent
      }`
      if (pathname.split('/')[1] === 'account')
        presenceData.details = 'Viewing account info'
      break
    }
  }

  if (!time)
    delete presenceData.startTimestamp
  if (!buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})
