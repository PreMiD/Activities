import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1347536423275860049',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://upload.cc/i1/2025/05/25/AQ5pLl.jpg',
  RJMainCover = 'https://api.asmr.one/api/cover',
  DLSite = 'https://www.dlsite.com/maniax/work/=/product_id',
}

let lastWorkId: string | null = null
let lastImageKey: string | null = null
let playingWorkId: string | null = null

async function getImageFromWork(workId: string): Promise<string | null> {
  const stripped = workId.replace('RJ', '').replace(/^0+/, '')
  const url = `${ActivityAssets.RJMainCover}/${stripped}.jpg?type=sam`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok)
      return null

    const blob = await res.blob()
    const base64 = await blobToBase64(blob)
    return `${base64}#${workId}`
  }
  catch {
    return null
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function extractWorkIdFromUrl(url: string): string | null {
  const match = url.match(/\/RJ(\d+)/i)
  return match ? `RJ${match[1]}` : null
}

presence.on('UpdateData', async () => {
  const currentPath = document.location.href
  const pathname = new URL(currentPath).pathname.split('/')
  const currentWorkId = pathname[2] || 'unknown'

  const [privacy, buttonsEnabled] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])

  const audio = document.querySelector('audio')
  const source = audio?.querySelector<HTMLSourceElement>('source')
  const audioSrc = source?.src

  const actualPlayingId = audioSrc ? extractWorkIdFromUrl(audioSrc) : null

  if (audio && audioSrc) {
    const title = document.querySelector<HTMLElement>('.text-bold')?.textContent?.trim()
    const description = document.querySelector<HTMLElement>('.text-caption')?.textContent?.trim()
    const currentTime = audio.currentTime ?? 0
    const duration = audio.duration ?? 0
    const isPaused = audio.paused

    if (!isPaused && actualPlayingId && playingWorkId !== actualPlayingId) {
      const newImageKey = await getImageFromWork(actualPlayingId)
      if (newImageKey) {
        lastImageKey = newImageKey
        lastWorkId = actualPlayingId
        playingWorkId = actualPlayingId
      }
    }

    const presenceData: PresenceData = {
      type: isPaused ? ActivityType.Watching : ActivityType.Listening,
      details: privacy ? 'Listening to something...' : title || 'Listening...',
      state: privacy ? undefined : description,
      startTimestamp: Math.floor(Date.now() / 1000) - Math.floor(currentTime),
      endTimestamp: isPaused
        ? undefined
        : Math.floor(Date.now() / 1000) + Math.floor(duration - currentTime),
      largeImageKey: privacy ? ActivityAssets.Logo : (lastImageKey ?? ActivityAssets.Logo),
      smallImageKey: isPaused ? Assets.Pause : Assets.Play,
      smallImageText: isPaused ? 'Paused' : 'Playing',
      buttons: !privacy && buttonsEnabled
        ? [
            { label: 'View on DLsite', url: `${ActivityAssets.DLSite}/${actualPlayingId}.html` },
            { label: 'Open on Asmr.one', url: currentPath },
          ]
        : undefined,
    }

    presence.setActivity(presenceData)
    return
  }
  else {
    playingWorkId = null
  }

  if (privacy) {
    return
  }

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const section = pathname[1]
  switch (section) {
    case 'works': {
      const keyword = new URLSearchParams(document.location.search)
        .get('keyword')
        ?.replace(/^(?:circle:|tag:|va:|["\s]+)/, '')

      presenceData.details = keyword
        ? `Searching "${keyword}...`
        : 'Viewing Home Page...'
      break
    }

    case 'work': {
      try {
        const title = document
          .querySelector<HTMLElement>('h1.text-h6.text-weight-regular')
          ?.textContent
          ?.trim()

        presenceData.details = title || 'Viewing Work'
        presenceData.state = `Viewing ${currentWorkId}...`

        if (!playingWorkId && (lastWorkId !== currentWorkId || !lastImageKey)) {
          const newImage = await getImageFromWork(currentWorkId)
          if (newImage) {
            presenceData.largeImageKey = newImage
            lastImageKey = newImage
            lastWorkId = currentWorkId
          }
        }
        else {
          presenceData.largeImageKey = lastImageKey ?? ActivityAssets.Logo
        }

        if (buttonsEnabled) {
          presenceData.buttons = [
            { label: 'View on DLsite', url: `${ActivityAssets.DLSite}/${currentWorkId}.html` },
            { label: 'Listing on Asmr.one', url: currentPath },
          ]
        }
      }
      catch {
        presenceData.details = 'Viewing Work (Failed)'
      }
      break
    }

    case 'favourites':
      presenceData.details = 'Viewing Favourites...'
      break
    case 'playlists':
      presenceData.details = 'Viewing Playlists...'
      break
    case 'circles':
      presenceData.details = 'Viewing Circles...'
      break
    case 'tags':
      presenceData.details = 'Viewing Tags...'
      break
    case 'vas':
      presenceData.details = 'Viewing Vocalists...'
      break
  }

  presence.setActivity(presenceData)
})
