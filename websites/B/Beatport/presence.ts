import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1374098754214297670',
})

let lastPathname = ''
let startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const showTimestamps = false

  if (pathname !== lastPathname) {
    lastPathname = pathname
    startTimestamp = Math.floor(Date.now() / 1000)
  }

  function getReleaseDetails(): string {
    const song = document.querySelector('[class*="ReleaseDetailCard"][class*="Name"]')?.textContent?.trim() || ''
    const artist = document.querySelector('[class*="ReleaseDetailCard"][class*="ArtistList"] a')?.textContent?.trim() || ''
    return `${artist} - ${song}`
  }

  function cleanTrackTitle(title: string): string {
    if (!title.match(/[([|]/)) {
      return title.trim()
    }

    const splitTitle = title.split(/[([|]/)
    return splitTitle[0]?.trim() || title.trim()
  }

  function cleanChartTitle(title?: string): string {
    if (!title)
      return ''

    const splitTitle = title.split(' Chart by ')
    return splitTitle[0]?.trim() || title.trim()
  }

  function cleanArtistPageTitle(title?: string): string {
    if (!title)
      return ''

    const splitTitle = title.split(' Music')
    return splitTitle[0]?.trim() || title.trim()
  }

  function cleanGenreTitle(title?: string): string {
    if (!title)
      return ''

    const match = title.match(/Get (.+?) Tracks/)
    return match?.[1]?.trim() || ''
  }

  let largeImage = 'https://i.imgur.com/jUa0uPY.jpeg'
  let details = 'Viewing Beatport'
  let state = ''
  let activityType = ActivityType.Playing

  if (pathname === '/') {
    details = 'Browsing Home'
  }
  else if (pathname.startsWith('/top-100')) {
    details = 'Viewing Top 100'
  }
  else if (pathname.startsWith('/genre')) {
    details = 'Browsing Genres'
    state = cleanGenreTitle(document.title)
  }
  else if (pathname.startsWith('/release')) {
    details = 'Viewing a Release'
    state = getReleaseDetails()
  }
  else if (pathname.startsWith('/track')) {
    details = 'Viewing a Track'
    state = cleanTrackTitle(document.title)
  }
  else if (pathname.startsWith('/artist')) {
    details = 'Viewing an Artist'
    state = cleanArtistPageTitle(document.title)
  }
  else if (pathname.startsWith('/label')) {
    details = 'Viewing a Label'
    state = cleanArtistPageTitle(document.title)
  }
  else if (pathname.startsWith('/chart')) {
    details = 'Viewing a Chart'
    state = cleanChartTitle(document.title)
  }

  const pauseIconHref = document.querySelector('svg[data-testid="player-control-pause_track"] use')?.getAttribute('href')
  const isPlaying = pauseIconHref === '/icons/sprite.svg#track-pause'

  if (isPlaying) {
    activityType = ActivityType.Listening
    details = document.querySelector('[class*="Player"][class*="TrackName"]')?.textContent?.trim() || 'Track'
    state = document.querySelector('[class*="Player"][class*="Artists"] a')?.textContent?.trim() || 'Artist'
    largeImage = document.querySelector('[class*="Artwork"][class*="Wrapper"] img.current')?.getAttribute('src') || largeImage
  }

  const presenceData: PresenceData = {
    type: activityType,
    largeImageKey: largeImage,
    details,
    state,
    startTimestamp: showTimestamps ? startTimestamp : undefined,
    ...(isPlaying && {
      smallImageKey: Assets.Play,
      smallImageText: 'Playing',
    }),
  }

  presence.setActivity(presenceData)
})
