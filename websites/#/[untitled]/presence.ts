import type { LibraryProject } from './types.js'
import { ActivityType, getTimestamps, StatusDisplayType, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1440157128500314122',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/mQBrqv7.png',
}

function getElementText(selector: string) {
  const element = document.querySelector(selector)
  return element?.textContent?.trim() ?? ''
}

let lastProjectRef: string | null = null
let libraryData: LibraryProject | null = null

function getTrackProjectRef() {
  return document.querySelector<HTMLAnchorElement>('a:has(.playbar-title)')?.href
}

async function getProjectData(projectUrl: string): Promise<LibraryProject> {
  const response = await fetch(`${projectUrl}?_data=routes/library.project.$projectSlug`, {
    credentials: 'include',
  })

  const data = await response.json()
  return data?.project ?? null
}

function isPlaying() {
  const audioTag = document.querySelector<HTMLAudioElement>('body > audio')

  return !!audioTag && audioTag?.paused === false
}

presence.on('UpdateData', async () => {
  if (!isPlaying()) {
    return presence.clearActivity()
  }

  const currentProjectRef = getTrackProjectRef()
  if (currentProjectRef && lastProjectRef !== currentProjectRef) {
    lastProjectRef = currentProjectRef

    libraryData = await getProjectData(currentProjectRef)
  }

  const showLogo = await presence.getSetting<boolean>('show-logo')

  const title = getElementText('.playbar-title')
  const subtitle = getElementText('.playbar-subtitle')
  const coverArt = document.querySelector<HTMLImageElement>('.bg-playbar img')?.src

  const presenceData: PresenceData = {
    name: '[untitled].stream',
    details: title,
    largeImageText: subtitle,
    type: ActivityType.Listening,
    largeImageKey: coverArt,
    statusDisplayType: StatusDisplayType.Details,
  }

  if (libraryData?.project && lastProjectRef) {
    presenceData.largeImageUrl = lastProjectRef
    presenceData.state = `From ${libraryData.project.username}`
  }

  if (showLogo) {
    Object.assign(presenceData, {
      smallImageKey: ActivityAssets.Logo,
      smallImageUrl: 'https://untitled.stream',
      smallImageText: '[untitled]',
    })
  }

  const timestamp = getElementText('.timestamp').split(' / ')
  if (timestamp.length === 2) {
    const [currentTime, duration] = timestamp.map(timestampFromFormat);

    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime!, duration!)
  }

  presence.setActivity(presenceData)
})
