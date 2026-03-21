import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1480646971630030869',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
let lastKnownTime = 0
let lastUpdate = Date.now()
let isActuallyPlaying = false

presence.on('UpdateData', async () => {
  const footer = document.querySelector('.fixed.bottom-0')

  const songTitle = footer?.querySelector('p.font-bold, p.font-semibold, .truncate.font-bold, .truncate.font-semibold')?.textContent?.trim()
  const infoElement = footer?.querySelector('p.text-xs, p.text-\\[10px\\], .text-white\\/40, .text-white\\/20')
  const infoText = infoElement?.textContent?.trim() || ''

  const separatorRegex = /[\u2022\u00B7\u2013\u2014-]/
  const infoParts = infoText.split(separatorRegex).map(s => s.trim())

  let artistName = ''
  let projectName = ''

  if (infoParts.length > 1) {
    artistName = infoParts[0] || ''
    projectName = infoParts[1] || ''
  }
  else {
    artistName = infoParts[0] || ''
  }

  if (!artistName)
    artistName = document.querySelector('a[href^="/@"]')?.textContent?.trim() || ''
  if (!projectName)
    projectName = document.querySelector('h1')?.textContent?.trim() || ''

  if (projectName === songTitle)
    projectName = ''

  const coverImg = footer?.querySelector('img') as HTMLImageElement
  const coverUrl = coverImg?.src || 'https://dither.pw/uploads/internal/logo_black.png'

  const timeElements = footer?.querySelectorAll('.tabular-nums') || []
  const currentTimeStr = timeElements[0]?.textContent?.trim() || '0:00'
  const durationStr = timeElements[1]?.textContent?.trim() || '0:00'

  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number)
    const p0 = parts[0] || 0
    const p1 = parts[1] || 0
    const p2 = parts[2] || 0
    if (parts.length === 2)
      return p0 * 60 + p1
    if (parts.length === 3)
      return p0 * 3600 + p1 * 60 + p2
    return 0
  }

  const currentTime = parseTime(currentTimeStr)
  const totalTime = parseTime(durationStr)

  const hasPauseIcon = footer?.querySelector('svg path[d*="M6 19"], svg path[d*="M10 25"], svg path[d*="M11 22"], svg path[d*="M9 16"]') !== null
    || footer?.querySelector('button[aria-label*="Pause"], button[title*="Pause"]') !== null

  if (currentTime !== lastKnownTime && currentTime > 0) {
    isActuallyPlaying = true
    lastKnownTime = currentTime
    lastUpdate = Date.now()
  }
  else if (Date.now() - lastUpdate > 3000) {
    isActuallyPlaying = false
  }

  const isPlaying = hasPauseIcon || isActuallyPlaying

  // Party detection
  const isInParty = window.location.pathname.includes('/listen/')
    || Array.from(document.querySelectorAll('h2, h3, p, span, button')).some(el => el.textContent?.toUpperCase().includes('PARTY'))
    || document.querySelector('button[title*="Control"]') !== null

  let stateText = artistName || 'Unknown Artist'
  if (isInParty) {
    stateText += ' (In Party)'
  }

  if (songTitle) {
    const presenceData: any = {
      type: 2,
      details: songTitle,
      state: stateText,
      largeImageKey: coverUrl,
      largeImageText: projectName || 'untitled',
      smallImageKey: isPlaying ? Assets.Play : Assets.Pause,
      smallImageText: isPlaying ? 'Playing' : 'Paused',
    }

    if (isPlaying && totalTime > 0) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000) - currentTime
      presenceData.endTimestamp = presenceData.startTimestamp + totalTime
    }

    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity({
      type: 2,
      details: 'Browsing',
      state: 'In Library',
      largeImageKey: 'https://dither.pw/uploads/internal/logo_black.png',
      largeImageText: '',
      startTimestamp: browsingTimestamp,
    } as any)
  }
})
