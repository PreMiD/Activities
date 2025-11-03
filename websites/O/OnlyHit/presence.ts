import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '666412985513672715',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {}
  const [format1, format2] = await Promise.all([
    presence.getSetting<string>('sFormat1'),
    presence.getSetting<string>('sFormat2'),
  ])
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    live: 'general.live',
    buttonListenAlong: 'general.buttonListenAlong',
    buttonViewSong: 'general.buttonViewSong',
  })

  const {
    data,
  } = await presence.getPageVariable<{
    data: {
      artist: string
      title: string
      isrc?: string
      cover?: string
      isPlaying: boolean
      start_time: number
      duration: number
      station: {
        name: string
        logo: string
        id: string
      }
    }
  }>(
    'data',
  )

  if (!data) {
    presence.setActivity()
    return
  }

  (presenceData as PresenceData).type = ActivityType.Listening
  presenceData.name = data.station.name
  presenceData.details = format1
    .replace('%song%', data.title)
    .replace('%artist%', data.artist)
  presenceData.state = format2
    .replace('%song%', data.title)
    .replace('%artist%', data.artist)
  presenceData.smallImageKey = data.isPlaying ? data.duration === 0 ? Assets.Live : Assets.Play : Assets.Pause
  presenceData.smallImageText = data.isPlaying ? data.duration === 0 ? strings.live : strings.play : strings.pause
  presenceData.largeImageKey = `https://onlyhit.us/cdn/${data.cover ? data.cover : data.station.logo}?width=512`
  if (data.duration !== 0 && data.isPlaying) {
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(Math.floor(Date.now() / 1000) - data.start_time, data.duration)
  }

  presenceData.buttons = [
    {
      label: strings.buttonListenAlong,
      url: `https://onlyhit.us/en/radio/${data.station.id}`,
    },
  ]
  if (data.isrc) {
    presenceData.buttons.push({
      label: strings.buttonViewSong,
      url: `https://onlyhit.us/en/music/track/${data.isrc}`,
    })
  }

  presence.setActivity(presenceData)
})
