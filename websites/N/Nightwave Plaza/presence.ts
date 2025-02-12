import { Assets } from 'premid'

const presence = new Presence({
  clientId: '620204628608417832',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Nightwave%20Plaza/assets/logo.png',
  }
  const playerTitle = document.querySelector('div.player-title')
  const playerArtist = document.querySelector('div.player-artist')
  const playerTime = document.querySelector('div.player-time')
  const playBackStatus = document.querySelector('button.player-play')
  const listeners = document.querySelector('div.col.cell')
  const header: NodeListOf<HTMLDivElement> = document.querySelectorAll(
    '.window > .inner > .header.header-draggable.noselect',
  )
  const songInfo = document.querySelector('.p-2.song-info')

  if (songInfo) {
    const [artist, album, title] = [...songInfo.querySelectorAll('.mb-1')].map(
      e => e.textContent,
    )
    if (artist && album && title) {
      presenceData.details = `Looking at ${title.substring(
        8,
      )} by ${artist.substring(10)}`
      presenceData.state = `Album: ${album.substring(8)}`
    }
  }
  else if (header.length === 2) {
    let rating: HTMLButtonElement | null = null
    if (header[1]?.textContent === 'Ratings')
      rating = document.querySelector('button.active')
    presenceData.details = `Looking at ${rating ? rating.textContent : ''} ${
      header[1]?.textContent
    }`
  }
  else {
    if (playerTitle)
      presenceData.state = playerTitle.textContent
    if (playerArtist)
      presenceData.details = playerArtist.textContent

    if (playBackStatus) {
      switch (playBackStatus.textContent) {
        case 'Play': {
          presenceData.smallImageKey = Assets.Play
          if (listeners)
            presenceData.smallImageText = listeners.textContent
          break
        }
        case 'Stop': {
          presenceData.smallImageKey = Assets.Pause
          if (listeners)
            presenceData.smallImageText = listeners.textContent
          break
        }
        default:
          break
      }
    }

    if (playerTime) {
      const [currentTime, duration] = playerTime.textContent
        ?.split('/')
        .map(time => presence.timestampFromFormat(time)) ?? [];

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(currentTime ?? 0, duration ?? 0)
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
