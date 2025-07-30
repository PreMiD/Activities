import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1399774169536921660',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://imgur.com/pjywsu6.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const setDetails = (details: string, smallKey?: string) => {
    presenceData.details = details
    if (smallKey)
      presenceData.smallImageKey = smallKey
  }

  const { pathname } = document.location

  if (pathname.endsWith('/terms-of-service')) {
    setDetails('Reading terms of service', Assets.Reading)
  }
  else if (pathname.endsWith('/privacy-policy')) {
    setDetails('Reading privacy policy', Assets.Reading)
  }
  else if (pathname.endsWith('/profile')) {
    setDetails('Viewing a profile')
  }
  else if (pathname.endsWith('/invite')) {
    setDetails('Viewing an invite')
  }
  else if (pathname.endsWith('/panais-canary/servers')) {
    setDetails('Viewing the dashboard')
  }
  else if (/\/panais-canary\/(\d+)\/dashboard$/.test(pathname)) {
    setDetails('Viewing dashboard')

    const musicTitle = document.querySelector('.text-sm.font-medium.truncate')?.textContent?.trim() || null
    const musicArtist = document.querySelector('.text-xs.text-muted-foreground.truncate')?.textContent?.trim() || null

    if (musicTitle || musicArtist) {
      presenceData.startTimestamp = Math.floor(Date.now() / 1000)
      presenceData.endTimestamp = presenceData.startTimestamp + 180
      presenceData.smallImageKey = Assets.Play

      if (musicTitle && musicArtist) {
        presenceData.name = musicTitle
        presenceData.details = musicArtist
      }
      else if (musicTitle) {
        presenceData.name = musicTitle
        presenceData.details = 'Unknown Artist'
      }
      else {
        presenceData.name = 'Playing: Unknown Song'
        presenceData.details = musicArtist!
      }
    }
    else {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
      delete presenceData.state
      delete presenceData.smallImageKey
    }
  }
  else if (pathname.endsWith('')) {
    setDetails('Viewing home page')
  }

  presence.setActivity(presenceData)
})
