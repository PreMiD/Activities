import { Assets } from 'premid'

const presence = new Presence({ clientId: '821776987570962532' })
const timestamp = Math.floor(Date.now() / 1000)

let data: {
  listeners: {
    unique: number
  }
  now_playing: {
    song: {
      artist: string
      text: string
      title: string
    }
  }
  live: {
    is_live: boolean
    streamer_name: string
  }
}

async function newStats() {
  return data = await (
    await window.fetch('https://cast.bladefm.com.au/api/nowplaying/1')
  ).json()
}

setInterval(newStats, 10000)
newStats()

presence.on('UpdateData', async () => {
  const settings = {
    details: (await presence.getSetting<string>('details'))
      .replace('%listeners%', `${data.listeners?.unique ?? 'Listeners'}`)
      .replace('%artist%', data.now_playing?.song.artist || 'Artist')
      .replace('%songText%', data.now_playing.song.text || 'Song')
      .replace('%title%', data.now_playing?.song.title || 'Title'),
    state: (await presence.getSetting<string>('state'))
      .replace('%listeners%', `${data.listeners?.unique ?? 'Listeners'}`)
      .replace('%artist%', data.now_playing?.song.artist || 'Artist')
      .replace('%songText%', data.now_playing.song.text || 'Song')
      .replace('%title%', data.now_playing?.song.title || 'Title'),
    timestamp: await presence.getSetting<boolean>('timestamp'),
  }
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/BladeFM/assets/logo.png',
    details: settings.details,
    state: settings.state,
    smallImageText: `${
      data.live.is_live ? data.live.streamer_name : 'AutoDJ'
    } is live!`,
    buttons: [
      {
        label: 'Tune in',
        url: 'https://cast.bladefm.com.au/radio/8000/radio.mp3',
      },
    ],
  }

  if (settings.timestamp)
    presenceData.startTimestamp = timestamp
  if (data.live.is_live && data.live.streamer_name !== 'Admin')
    presenceData.smallImageKey = Assets.Live
  else delete presenceData.smallImageText

  presence.setActivity(presenceData)
})
