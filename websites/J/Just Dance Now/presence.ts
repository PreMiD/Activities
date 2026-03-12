const presence = new Presence({
  clientId: '928372793438011433',
})
const browsingStamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/J/Just%20Dance%20Now/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const [time, cover, roomCode] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('roomCode'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingStamp,
  }
  const coverURL = document.querySelector<HTMLImageElement>(
    `#section-${document
      .querySelector('.selected')
      ?.getAttribute('section-id')} .item-selected .song__cover`,
  )?.src
  const songTitle = document.querySelector(
    `#section-${document
      .querySelector('.selected')
      ?.getAttribute('section-id')} .item-selected .title`,
  )?.textContent
  const roomCodeString = document.querySelector('.danceroom__number')?.textContent

  if (document.querySelector('html')?.className.includes('vip')) {
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/J/Just%20Dance%20Now/assets/0.png'
    presenceData.smallImageText = 'VIP'
  }
  if (!document.querySelector('html')?.className.includes('state-')) {
    presenceData.details = 'Viewing Homepage'
  }
  else {
    switch (
      document.querySelector('html')?.className?.match(/state-([a-z]{0,15})/)?.[1]
    ) {
      case 'afterdance': {
        presenceData.details = 'Scores'
        presenceData.state = songTitle
        if (cover)
          presenceData.largeImageKey = coverURL

        if (roomCode)
          presenceData.details = `Scores (${roomCodeString})`
        break
      }
      case 'tutorial': {
        presenceData.details = 'Tutorial'
        presenceData.state = songTitle
        if (cover)
          presenceData.largeImageKey = coverURL

        if (roomCode)
          presenceData.details = `Tutorial (${roomCodeString})`
        break
      }
      case 'dance': {
        presenceData.details = 'Playing'
        presenceData.state = songTitle;
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(
          document.querySelector<HTMLVideoElement>('#in-game_video')!,
        )
        if (cover)
          presenceData.largeImageKey = coverURL

        if (roomCode)
          presenceData.details = `Playing (${roomCodeString})`
        break
      }
      case 'coachselection': {
        presenceData.details = 'Coach Selection'
        presenceData.state = `${
          document.querySelector('.coach-selection__details-song')?.textContent
        }`
        if (roomCode)
          presenceData.details = `Coach Selection (${roomCodeString})`

        if (cover)
          presenceData.largeImageKey = coverURL
        break
      }
      case 'songselection': {
        if (
          document
            .querySelector<HTMLLIElement>('.selected')
            ?.getAttribute('section-id') === 'playlist'
        ) {
          presenceData.details = `Browsing ${
            document.querySelector('.selected > .tabs--text')?.textContent
          }`
          presenceData.state = songTitle
          if (cover) {
            presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
              '.playlist--banner__selected > img',
            )?.src ?? ActivityAssets.Logo
          }
          if (roomCode) {
            presenceData.details = `Browsing ${
              document.querySelector('.selected > .tabs--text')?.textContent
            } (${roomCodeString})`
          }
          if (document.querySelector('#section-playlist .item-selected')) {
            presenceData.state = document.querySelector(
              '#section-playlist .item-selected .title',
            )?.textContent
            if (cover)
              presenceData.largeImageKey = coverURL
          }
        }
        else if (
          document
            .querySelector<HTMLLIElement>('.selected')
            ?.getAttribute('section-id') === 'songlist'
        ) {
          presenceData.details = `Browsing ${
            document.querySelector('.selected > .tabs--text')?.textContent
          }`
          if (document.querySelector('#section-songlist .item-selected')) {
            presenceData.state = document.querySelector(
              '#section-songlist .item-selected .title',
            )?.textContent
            if (cover)
              presenceData.largeImageKey = coverURL
          }
          if (roomCode) {
            presenceData.details = `Browsing ${
              document.querySelector('.selected > .tabs--text')?.textContent
            } (${roomCodeString})`
          }
        }
        else if (
          document
            .querySelector<HTMLLIElement>('.selected')
            ?.getAttribute('section-id') === 'leaderboard'
        ) {
          presenceData.details = 'Viewing leaderboard'
          presenceData.state = document.querySelector(
            '#leaderboard-tabs .selected',
          )?.textContent
        }
        break
      }
    }
  }

  if (!time)
    delete presenceData.startTimestamp

  if (presenceData.details)
    presence.setActivity(presenceData)
})
