import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1519022518617374852',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

interface NowPlayingResponse {
  online: boolean
  nowPlaying: {
    title: string
    artist: string
    art: string
    dj: {
      display_name: string
      avatar_url: string
    }
  }
}

interface TimetableSlot {
  id: number
  show_title: string
  display_name: string
  avatar_url: string
  co_display_name: string | null
  start_at: number
  end_at: number
}

interface TimetableResponse {
  from: number
  to: number
  slots: TimetableSlot[]
}

let currentTitle = 'Mile Zero'
let currentArtist = 'Your journey starts here'
let currentDj = 'AutoDJ'
let currentArt = ''
let isOnline = false

async function updateNowPlaying(): Promise<void> {
  try {
    const response = await fetch('https://hub.milezero.live/api/public/nowplaying')
    if (!response.ok)
      return

    const data: NowPlayingResponse = await response.json()

    isOnline = data.online
    currentTitle = data.nowPlaying.title
    currentArtist = data.nowPlaying.artist
    currentDj = data.nowPlaying.dj.display_name
    currentArt = data.nowPlaying.art
  }
  catch {
    // Keep the last known values if the API is briefly unreachable.
  }
}

let currentShow = ''
let timetableFetchedAt = 0
let timetable: TimetableSlot[] = []

async function updateTimetable(): Promise<void> {
  const now = Math.floor(Date.now() / 1000)

  // The schedule doesn't change often, so only refetch every 5 minutes.
  if (now - timetableFetchedAt < 300)
    return

  try {
    const response = await fetch('https://hub.milezero.live/api/public/timetable')
    if (!response.ok)
      return

    const data: TimetableResponse = await response.json()
    timetable = data.slots
    timetableFetchedAt = now
  }
  catch {
    // Keep the last known timetable if the API is briefly unreachable.
  }
}

function getCurrentShow(): string {
  const now = Math.floor(Date.now() / 1000)
  const liveSlot = timetable.find(slot => slot.start_at <= now && now < slot.end_at)

  return liveSlot
    ? liveSlot.co_display_name
      ? `${liveSlot.display_name} & ${liveSlot.co_display_name}`
      : liveSlot.display_name
    : ''
}

let lastTitle = ''
let lastTrackStart = Math.floor(Date.now() / 1000)

interface PresenceSettings {
  showDj: boolean
  useCoverArt: boolean
}

function pushMusicPresence(presenceData: PresenceData, settings: PresenceSettings): void {
  presenceData.details = currentTitle
  presenceData.state = settings.showDj ? `${currentArtist} • ${currentDj}` : currentArtist
  presenceData.smallImageKey = Assets.Play
  presenceData.smallImageText = settings.showDj ? `Listening to ${currentDj}` : 'Listening live'

  if (settings.useCoverArt && currentArt)
    presenceData.largeImageKey = currentArt

  if (lastTitle !== currentTitle) {
    lastTitle = currentTitle
    lastTrackStart = Math.floor(Date.now() / 1000)
  }

  presenceData.startTimestamp = lastTrackStart
}

setInterval(updateNowPlaying, 10000)
updateNowPlaying()

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.richie.media/u/6qR5hR.png',
  }

  const playButton = document.querySelector<HTMLButtonElement>('.hero-card__play')
  const isPlaying = playButton?.getAttribute('aria-label') === 'Stop the stream'

  const requestBody = document.querySelector<HTMLElement>('.rs-body')
  const isRequestPanelOpen = !!requestBody && requestBody.style.display !== 'none'

  const { pathname } = document.location

  const showButtons = await presence.getSetting<boolean>('buttons')
  const showDj = await presence.getSetting<boolean>('showDj')
  const useCoverArt = await presence.getSetting<boolean>('useCoverArt')

  if (isPlaying && isOnline) {
    pushMusicPresence(presenceData, { showDj, useCoverArt })
  }
  else {
    presenceData.startTimestamp = browsingTimestamp

    if (isRequestPanelOpen) {
      presenceData.details = 'Sending a Request'
      presenceData.smallImageKey = Assets.Writing
    }
    else if (pathname === '/' || pathname === '') {
      presenceData.details = 'Browsing Mile Zero'
    }
    else if (pathname.startsWith('/schedule')) {
      await updateTimetable()
      currentShow = getCurrentShow()

      presenceData.details = 'Viewing the Schedule'
      presenceData.state = currentShow ? `Now: ${currentShow}` : undefined
    }
    else if (pathname.startsWith('/blog/')) {
      presenceData.details = 'Reading the Blog'
      presenceData.state = document.title.split(' | ')[0]
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.startsWith('/team')) {
      presenceData.details = 'Viewing the Team'
    }
    else if (pathname.startsWith('/about')) {
      presenceData.details = 'Reading About Mile Zero'
    }
    else if (pathname.startsWith('/contact')) {
      presenceData.details = 'Viewing Contact Info'
    }
    else if (pathname.startsWith('/apply')) {
      presenceData.details = 'Applying to Present'
    }
    else if (pathname.startsWith('/brand')) {
      presenceData.details = 'Viewing the Brand Kit'
    }
    else {
      presenceData.details = 'Browsing Mile Zero'
    }
  }

  if (showButtons) {
    presenceData.buttons = [
      { label: 'Listen to MZ', url: 'https://milezero.live' },
      { label: 'Join the Discord', url: 'https://discord.milezero.live' },
    ]
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
