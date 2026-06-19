import { ActivityType, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1511505666664038460',
})
const NintendoMusicLogo = 'https://i.imgur.com/thYBiff.png'

const TrackOriginList: Record<string, Record<string, string>> = {
  "Mario Kart World": {
    "Desert Hills": "DS Desert Hills",
    "Shy Guy Bazaar": "3DS Shy Guy Bazaar",
    "Wario Stadium": "N64 Wario Stadium",
    "Airship Fortress": "DS Airship Fortress",
    "DK Pass": "DS DK Pass",
    "Sky-High Sundae": "SW Sky-High Sundae",
    "Wario's Galleon": "3DS Wario's Galleon",
    "Wario's Shipyard": "3DS Wario's Shipyard",
    "Koopa Troopa Beach": "SNES Koopa Troopa Beach",
    "Peach Beach": "GCN Peach Beach",
    "Dino Dino Jungle": "GCN Dino Dino Jungle",
    "Moo Moo Meadows": "Wii Moo Moo Meadows",
    "Choco Mountain": "N64 Choco Mountain",
    "Toad's Factory": "Wii Toad's Factory",
    "Mario Circuit": "SNES Mario Circuit",
    "Desert Hills (Intro)": "DS Desert Hills (Intro)",
    "Shy Guy Bazaar (Intro)": "3DS Shy Guy Bazaar (Intro)",
    "Wario Stadium (Intro)": "N64 Wario Stadium (Intro)",
    "Airship Fortress (Intro)": "DS Airship Fortress (Intro)",
    "DK Pass (Intro)": "DS DK Pass (Intro)",
    "Sky-High Sundae (Intro)": "SW Sky-High Sundae (Intro)",
    "Wario's Galleon (Intro)": "3DS Wario's Galleon (Intro)",
    "Wario's Shipyard (Intro)": "3DS Wario's Shipyard (Intro)",
    "Koopa Troopa Beach (Intro)": "SNES Koopa Troopa Beach (Intro)",
    "Peach Beach (Intro)": "GCN Peach Beach (Intro)",
    "Dino Dino Jungle (Intro)": "GCN Dino Dino Jungle (Intro)",
    "Moo Moo Meadows (Intro)": "Wii Moo Moo Meadows (Intro)",
    "Choco Mountain (Intro)": "N64 Choco Mountain (Intro)",
    "Toad's Factory (Intro)": "Wii Toad's Factory (Intro)",
    "Mario Circuit (Intro)": "SNES Mario Circuit (Intro)",
  },
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const title = document.title
  const audio = document.querySelector('audio')
  const isPlaying = !!document.querySelector('[aria-label="Pause"]')
  const currentTime = audio?.currentTime || 0
  const duration = audio?.duration || 0
  const now = Math.floor(Date.now() / 1000)

  const songArt = document.querySelector<HTMLImageElement>('[aria-label="Playback panel"] img')?.src || NintendoMusicLogo
  const albumArt = document.querySelector<HTMLImageElement>('#main-column img')?.src || NintendoMusicLogo

  const [showTimestamps, showSongArt, displayFormat, marioKartTrackOrigin] = await Promise.all([
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showSongArt'),
    presence.getSetting<number>('displayFormat'),
    presence.getSetting<boolean>('marioKartTrackOrigin')
  ])

  const presenceData: PresenceData = {
    largeImageKey: NintendoMusicLogo,
    type: ActivityType.Listening,
  }

  if (isPlaying && title.includes(' - Nintendo Music')) {
    const parts = title.replace(' - Nintendo Music', '').trim().split(/[・·]/)
    const songName = parts[0]?.trim() || 'Unknown'
    const gameName = parts[1]?.trim() || 'Nintendo'

    presenceData.details = songName
    presenceData.state = gameName
    presenceData.startTimestamp = now - Math.floor(currentTime)
    presenceData.endTimestamp = now + Math.floor(duration - currentTime)

    if (showSongArt) {
      presenceData.largeImageKey = songArt
    }
  }
  else if (pathname.includes('/search')) {
    presenceData.details = 'Searching...'
    presenceData.largeImageKey = NintendoMusicLogo
  }
  else if (pathname.includes('/game')) {
    const parts = title.replace(' - Nintendo Music', '').trim().split(/[・·]/)
    const gameName = parts[1]?.trim() || 'Nintendo'
    const mainTitle = document.querySelector('#main-column h1')?.textContent

    presenceData.details = `Browsing ${mainTitle}`
    presenceData.state = gameName
    presenceData.startTimestamp = now

    if (showSongArt) {
      presenceData.largeImageKey = albumArt
    }
  }
  else if (pathname.includes('/user-playlist')) {
    const parts = title.replace(' - Nintendo Music', '').trim().split(/[・·]/)
    const songName = parts[0]?.trim() || 'Unknown'

    presenceData.details = songName
    presenceData.state = 'Personal Playlist'
    presenceData.startTimestamp = now

    if (showSongArt) {
      presenceData.largeImageKey = albumArt
    }
  }
  else if (pathname.includes('/playlist')) {
    const parts = title.replace(' - Nintendo Music', '').trim().split(/[・·]/)
    const songName = parts[0]?.trim() || 'Unknown'

    presenceData.details = songName
    presenceData.state = 'Official Playlist'
    presenceData.startTimestamp = now

    if (showSongArt) {
      presenceData.largeImageKey = albumArt
    }
  }
  else if (pathname.includes('/my-music')) {
    const mainTitle = document.querySelector('#main-column h1')?.textContent

    presenceData.details = mainTitle
    presenceData.state = 'My Music'
    presenceData.startTimestamp = now
  }
  else {
    presenceData.details = 'Browsing Music...'
    presenceData.startTimestamp = now
  }

  if (!showTimestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  if (marioKartTrackOrigin) { 
    const soundtrackName = presenceData.state;
    const songName = presenceData.details;
    if (typeof soundtrackName == 'string' && typeof songName == 'string') {
      const gameKey = soundtrackName as keyof typeof TrackOriginList;
      const gameTrack = TrackOriginList[gameKey];
      if (gameTrack && (songName in gameTrack)) {
        const mappedTrackValue = (gameTrack as Record<string, string>)[songName]
        presenceData.details = mappedTrackValue;
      }
    } 
  }

  switch(displayFormat) {
    case 0:
      presenceData.statusDisplayType = StatusDisplayType.Name
      break;
    case 1:
      presenceData.statusDisplayType = StatusDisplayType.Details
      break;
    case 2:
      presenceData.statusDisplayType = StatusDisplayType.State;
      break;
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
