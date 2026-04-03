import { ActivityType, Assets, getTimestamps, StatusDisplayType, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1480646971630030869',
})

enum ActivityAssets {
  Logo = 'https://dither.pw/uploads/internal/logo_black.png',
}

function getElement(query: string, root: ParentNode = document): string | null {
  const element = root.querySelector(query)
  return element?.textContent?.trim() || null
}

let elapsed = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href

presence.on('UpdateData', async () => {
  const [
    showBrowsing,
    showSong,
    hidePaused,
    showTimestamps,
    showCover,
    displayType,
  ] = await Promise.all([
    presence.getSetting<boolean>('browse'),
    presence.getSetting<boolean>('song'),
    presence.getSetting<boolean>('hidePaused'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('cover'),
    presence.getSetting<number>('displayType'),
  ])

  const titleElem = document.querySelector('[data-premid="title"]')
  const songTitle = titleElem?.textContent?.trim() || null

  const artistElements = document.querySelectorAll('[data-premid="artist"]')
  const artistName = Array.from(artistElements)
    .map(e => e.textContent?.trim() || '')
    .reduce((a, b) => (a.length > b.length ? a : b), '') || null

  const playbackButton = document.querySelector('[data-premid="playback-status"]')
  const playing = playbackButton?.querySelector('rect') !== null

  if (showSong && hidePaused && !playing && !showBrowsing) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: elapsed,
  }

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href
    elapsed = Math.floor(Date.now() / 1000)
  }

  const path = location.pathname

  if (showSong && songTitle) {
    presenceData.details = songTitle
    presenceData.state = artistName || 'Dither'

    switch (displayType) {
      case 1:
        presenceData.statusDisplayType = StatusDisplayType.State
        break
      case 2:
        presenceData.statusDisplayType = StatusDisplayType.Details
        break
    }

    const currentTimeStr = getElement('[data-premid="current-time"]')
    const durationStr = getElement('[data-premid="duration"]')

    if (currentTimeStr && durationStr) {
      const currentTime = timestampFromFormat(currentTimeStr)
      const duration = timestampFromFormat(durationStr)

      if (playing && showTimestamps) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
      }
      else {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
      }
    }

    if (showCover && titleElem) {
      let coverImg: HTMLImageElement | null = null
      let current: HTMLElement | null = titleElem as HTMLElement

      for (let i = 0; i < 10 && current && current !== document.body; i++) {
        const found = current.querySelector('img')
        if (found && found.src && (found.src.includes('/uploads/') || found.src.includes('cover'))) {
          coverImg = found
          break
        }
        const siblingImg = current.parentElement?.querySelector('img')
        if (siblingImg && siblingImg.src && (siblingImg.src.includes('/uploads/') || siblingImg.src.includes('cover'))) {
          coverImg = siblingImg
          break
        }
        current = current.parentElement
      }

      if (coverImg?.src)
        presenceData.largeImageKey = coverImg.src
    }
  }
  else if (showBrowsing) {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Browsing'

    if (path === '/' || path === '/discover') {
      presenceData.details = 'Exploring'
      presenceData.state = 'Home'
    }
    else if (path.startsWith('/library')) {
      presenceData.details = 'In Library'
      const activeTab = document.querySelector('button.bg-white.text-black.shadow')
      presenceData.state = activeTab?.textContent?.trim() || 'Library'
    }
    else if (path.startsWith('/settings')) {
      presenceData.details = 'Changing Settings'
      presenceData.state = 'Settings'
    }
    else if (path.startsWith('/songs/')) {
      presenceData.details = 'Viewing Song'
      presenceData.state = getElement('h1') || 'Song'
    }
    else if (path.startsWith('/project/')) {
      presenceData.details = 'Viewing Project'
      presenceData.state = getElement('h1') || 'Song'
    }
    else if (path.startsWith('/communities/') && path.length > 1) {
      presenceData.details = 'Viewing community'
      presenceData.state = getElement('h1') || 'Song'
    }
    else if (path.startsWith('/') && path.length > 1) {
      presenceData.details = 'Viewing Profile'
      presenceData.state = getElement('span') || 'Profile'
    }
    else {
      presenceData.details = 'Browsing'
      presenceData.state = 'Dither'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})
