import { ActivityType, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1511505666664038460',
})
const NintendoMusicLogo = 'https://cdn.rcd.gg/PreMiD/websites/N/Nintendo%20Music/assets/logo.png'

const TrackOriginList: Record<string, Record<string, string>> = {
  'Mario Kart World': {
    'Desert Hills': 'DS Desert Hills',
    'Shy Guy Bazaar': '3DS Shy Guy Bazaar',
    'Wario Stadium': 'N64 Wario Stadium',
    'Airship Fortress': 'DS Airship Fortress',
    'DK Pass': 'DS DK Pass',
    'Sky-High Sundae': 'Tour Sky-High Sundae',
    'Wario\'s Galleon': '3DS Wario\'s Galleon',
    'Wario\'s Shipyard': '3DS Wario\'s Shipyard',
    'Koopa Troopa Beach': 'SNES Koopa Troopa Beach',
    'Peach Beach': 'GCN Peach Beach',
    'Dino Dino Jungle': 'GCN Dino Dino Jungle',
    'Moo Moo Meadows': 'Wii Moo Moo Meadows',
    'Choco Mountain': 'N64 Choco Mountain',
    'Toad\'s Factory': 'Wii Toad\'s Factory',
    'Mario Circuit': 'SNES Mario Circuit',
    'Desert Hills (Intro)': 'DS Desert Hills (Intro)',
    'Shy Guy Bazaar (Intro)': '3DS Shy Guy Bazaar (Intro)',
    'Wario Stadium (Intro)': 'N64 Wario Stadium (Intro)',
    'Airship Fortress (Intro)': 'DS Airship Fortress (Intro)',
    'DK Pass (Intro)': 'DS DK Pass (Intro)',
    'Sky-High Sundae (Intro)': 'Tour Sky-High Sundae (Intro)',
    'Wario\'s Galleon (Intro)': '3DS Wario\'s Galleon (Intro)',
    'Wario\'s Shipyard (Intro)': '3DS Wario\'s Shipyard (Intro)',
    'Koopa Troopa Beach (Intro)': 'SNES Koopa Troopa Beach (Intro)',
    'Peach Beach (Intro)': 'GCN Peach Beach (Intro)',
    'Dino Dino Jungle (Intro)': 'GCN Dino Dino Jungle (Intro)',
    'Moo Moo Meadows (Intro)': 'Wii Moo Moo Meadows (Intro)',
    'Choco Mountain (Intro)': 'N64 Choco Mountain (Intro)',
    'Toad\'s Factory (Intro)': 'Wii Toad\'s Factory (Intro)',
    'Mario Circuit (Intro)': 'SNES Mario Circuit (Intro)',
  },
}

const classicFormattingList: Record<string, string> = {
    'Donut Plains (Super Mario Kart)': 'SNES Donut Plains',
    'Ghost Valley (Super Mario Kart)': 'SNES Ghost Valley',
    'Bowser Castle (Super Mario Kart)': 'SNES Bowser Castle',
    'Choco Island (Super Mario Kart)': 'SNES Choco Island',
    'Choco Island (Fusion) (Super Mario Kart)': 'SNES Donut Plains (Fusion)',
    'Choco Island (Bossa Nova) (Super Mario Kart)': 'SNES Donut Plains (Bossa Nova)',
    'Koopa Beach (Super Mario Kart)': 'SNES Koopa Beach',
    'Vanilla Lake (Super Mario Kart)': 'SNES Vanilla Lake',
    'Rainbow Road (Super Mario Kart)': 'SNES Rainbow Road',
    'Battle Course (Super Mario Kart)': 'SNES Battle Course',
    'Moo Moo Farm (Mario Kart 64)': 'N64 Moo Moo Farm',
    'Koopa Troopa Beach (Mario Kart 64)': 'N64 Koopa Troopa Beach',
    'Koopa Troopa Beach (Electro) (Mario Kart)': 'N64 Koopa Troopa Beach (Electro)',
    'Kalimari Desert (Mario Kart 64)': 'N64 Kalimari Desert',
    'Toad\'s Turnpike (Mario Kart 64)': 'N64 Toad\'s Turnpike',
    'Frappe Snowland (Jazz Fusion) (Mario Kart 64)': 'N64 Frappe Snowland',
    'Frappe Snowland (Soul) (Mario Kart 64)': 'N64 Frappe Snowland (Soul)',
    'DK\'s Jungle Parkway (Mario Kart 64)': 'N64 DK\'s Jungle Parkway',
    'Rainbow Road (Mario Kart 64)': 'N64 Rainbow Road',
    'Battle Course (Mario Kart 64)': 'N64 Battle Course',
    'Battle Course (Mario Kart: Double Dash!!)': 'GCN Battle Course',
    'Figure-8 Circuit (Mario Kart DS)': 'DS Figure-8 Circuit',
    'Yoshi Falls (Mario Kart DS)': 'DS Yoshi Falls',
    'Cheek Cheep Beach (Mario Kart DS)': 'DS Cheep Cheep Beach',
    'Luigi\'s Mansion (Mario Kart DS)': 'DS Luigi\'s Mansion',
    'Delfino Square (Mario Kart DS)': 'DS Delfino Square',
    'Waluigi Pinball (Rock) (Mario Kart DS)': 'DS Waluigi Pinball',
    'Waluigi Pinball (Funk) (Mario Kart DS)': 'DS Waluigi Pinball (Funk)',
    'Shroom Ridge (Mario Kart DS)': 'DS Shroom Ridge',
    'Tick-Tock Clock (Mario Kart DS)': 'DS Tick-Tock Clock',
    'Peach Gardens (Mario Kart DS)': 'DS Peach Gardens',
    'Rainbow Road (Mario Kart DS)': 'DS Rainbow Road',
    'Battle Course (Mario Kart DS)': 'DS Battle Course',
    'Luigi Circuit (Mario Kart Wii)': 'Wii Luigi Circuit',
    'Mushroom Gorge (Mario Kart Wii)': 'Wii Mushroom Gorge',
    'Coconut Mall (Mario Kart Wii)': 'Wii Coconut Mall',
    'DK\'s Snowboard Cross (Mario Kart Wii)': 'Wii DK\'s Snowboard Cross',
    'Wario\'s Gold Mine (Mario Kart Wii)': 'Wii Wario\'s Gold Mine',
    'Daisy Circuit (Acoustic) (Mario Kart Wii)': 'Wii Daisy Circuit',
    'Daisy Circuit (Electro) (Mario Kart Wii)': 'Wii Daisy Circuit (Electro)',
    'Maple Treeway (Mario Kart Wii)': 'Wii Maple Treeway',
    'Grumble Volcano (Mario Kart Wii)': 'Wii Grumble Volcano',
    'Dry Dry Ruins (Mario Kart Wii)': 'Wii Dry Dry Ruins',
    'Moonview Highway (Mario Kart Wii)': 'Wii Moonview Highway',
    'Rainbow Road (Mario Kart) Wii': 'Wii Rainbow Road',
    'Chain Chomp Roulette (Mario Kart Wii)': 'Wii Chain Chomp Roulette',
    'Delfino Pier (Mario Kart Wii)': 'Wii Delfino Pier',
    'Thwomp Desert (Mario Kart Wii)': 'Wii Thwomp Desert',
    'Battle Stadium (Mario Kart 8 Deluxe)': 'SW Battle Stadium',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const title = document.title
  const audio = document.querySelector('audio')
  const mediaSession = navigator.mediaSession
  const isPlaying = mediaSession.playbackState === 'playing'
  const currentTime = audio?.currentTime ?? 0
  const duration = audio?.duration || 0
  const now = Math.floor(Date.now() / 1000)

  const albumArt = document.querySelector<HTMLImageElement>('#main-column img')?.src ?? NintendoMusicLogo

  const [showTimestamps, showSongArt, displayFormat, marioKartTrackOrigin, classicFormattingMKW] = await Promise.all([
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showSongArt'),
    presence.getSetting<number>('displayFormat'),
    presence.getSetting<boolean>('marioKartTrackOrigin'),
    presence.getSetting<boolean>('classicFormattingMKW'),
  ])

  const presenceData: PresenceData = {
    largeImageKey: NintendoMusicLogo,
    type: ActivityType.Listening,
  }

  if (isPlaying && mediaSession?.metadata) {
    const songArt = mediaSession.metadata.artwork?.[0]?.src ?? NintendoMusicLogo
    const songName = mediaSession.metadata.title ?? 'Unknown'
    const gameName = mediaSession.metadata.album ?? 'Nintendo'

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
    const gameName = parts[1]?.trim() ?? 'Nintendo'
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
    const songName = parts[0]?.trim() ?? 'Unknown'

    presenceData.details = songName
    presenceData.state = 'Personal Playlist'
    presenceData.startTimestamp = now

    if (showSongArt) {
      presenceData.largeImageKey = albumArt
    }
  }
  else if (pathname.includes('/playlist')) {
    const parts = title.replace(' - Nintendo Music', '').trim().split(/[・·]/)
    const songName = parts[0]?.trim() ?? 'Unknown'

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
    const soundtrackName = presenceData.state
    const songName = presenceData.details
    if (typeof soundtrackName === 'string' && typeof songName === 'string') {
      const gameKey = soundtrackName as keyof typeof TrackOriginList
      const gameTrack = TrackOriginList[gameKey]
      if (gameTrack && songName in gameTrack) {
        const mappedTrackValue = (gameTrack as Record<string, string>)[songName]
        presenceData.details = mappedTrackValue
      }
    }
  }

  if (classicFormattingMKW) {
    const songName = presenceData.details
    if (typeof songName === 'string') {
      const mappedTrack = classicFormattingList[songName]
      if (mappedTrack) {
        presenceData.details = mappedTrack
      }
    }
  }

  switch (displayFormat) {
    case 0:
      presenceData.statusDisplayType = StatusDisplayType.Details
      break
    case 1:
      presenceData.statusDisplayType = StatusDisplayType.State
      break
    case 2:
      presenceData.statusDisplayType = StatusDisplayType.Name
      break
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
