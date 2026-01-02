import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1453468273566810185',
})

interface StationData {
  nowPlaying: {
    artist: string,
    title: string,
    artwork: string,
    timestamp: number,
  },
}

let lastTrack = ''
let trackStartTime = Math.floor(Date.now() / 1000)
let hasPlayedBefore = false

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://www.wsqkthesquawk.net/favicons/web-app-manifest-512x512.png',
    largeImageText: 'WSQK The Squawk',
    type: 2,
  }

  const settings = await presence.getSetting<boolean>('showTimestamp')
  const showButtons = await presence.getSetting<boolean>('showButtons')

  const isModalOpen = document.querySelector('[role="dialog"]') !== null

  const playButton = Array.from(document.querySelectorAll('button')).find(
    btn => btn.textContent?.includes('PAUSE') || btn.textContent?.includes('TUNE IN'),
  )
  const isPlaying = playButton?.textContent?.includes('PAUSE') || false

  if (isPlaying)
    hasPlayedBefore = true

  try {
    const response = await fetch('https://api.typicalmedia.net/api/v1/wsqk/stats')
    const data: StationData = await response.json()

    if (data && data.nowPlaying) {
      const currentTrack = `${data.nowPlaying.artist} - ${data.nowPlaying.title}`

      if (currentTrack !== lastTrack) {
        lastTrack = currentTrack
        trackStartTime = Math.floor(Date.now() / 1000)
      }

      if (isModalOpen) {
        presenceData.details = 'Making a Request'
        presenceData.state = 'Request Line'
        presenceData.smallImageKey = Assets.Writing
        presenceData.smallImageText = 'Requesting a song'
      }
      else {
        presenceData.details = data.nowPlaying.title
        presenceData.state = data.nowPlaying.artist

        if (isPlaying) {
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Listening to WSQK The Squawk'

          if (settings)
            presenceData.startTimestamp = trackStartTime
        }
        else if (hasPlayedBefore) {
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          delete presenceData.startTimestamp
        }
        else {
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Browsing'
          delete presenceData.startTimestamp
        }
      }

      if (data.nowPlaying.artwork)
        presenceData.largeImageKey = data.nowPlaying.artwork

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Listen Now',
            url: 'https://wsqkthesquawk.net',
          },
          {
            label: 'Join Discord',
            url: 'https://discord.com/invite/S6r8HTwUGy',
          },
        ]
      }
    }
    else {
      presenceData.details = 'Browsing WSQK The Squawk'
      presenceData.state = 'Hawkins\' Hit Maker'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Browsing'
    }
  }
  catch {
    presenceData.details = 'Browsing WSQK The Squawk'
    presenceData.state = 'Hawkins\' Hit Maker'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Browsing'
  }

  presence.setActivity(presenceData)
})
