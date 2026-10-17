import { Assets } from 'premid'

const presence = new Presence({
  // Discord application ID; the application's name is what Discord shows
  // as the activity name. Create one at https://discord.com/developers/applications
  clientId: '1555481829816139836',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/OiNrW2k.png',
}

// Never reads names, bios or messages from the page: only the URL is used.
function describePage(path: string): { details: string, smallImageKey?: string } {
  if (path.startsWith('/app/recs'))
    return { details: 'Swiping' }
  if (path.startsWith('/app/explore'))
    return { details: 'Exploring', smallImageKey: Assets.Search }
  if (path.startsWith('/app/messages'))
    return { details: 'Chatting', smallImageKey: Assets.Writing }
  if (path.startsWith('/app/matches'))
    return { details: 'Viewing matches' }
  if (path.startsWith('/app/likes-you') || path.startsWith('/app/gold-home'))
    return { details: 'Viewing likes' }
  if (path.startsWith('/app/profile/edit'))
    return { details: 'Editing profile' }
  if (path.startsWith('/app/profile') || path.startsWith('/app/settings'))
    return { details: 'Viewing profile' }
  if (path.startsWith('/app'))
    return { details: 'Using Tinder' }
  return { details: 'Browsing the website' }
}

presence.on('UpdateData', async () => {
  const [privacyMode, showTimestamp] = await Promise.all([
    presence.getSetting<boolean>('privacyMode'),
    presence.getSetting<boolean>('showTimestamp'),
  ])

  // Strip a leading language segment, e.g. /fr/app/recs -> /app/recs
  const path = document.location.pathname.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/)/i, '')
  const page = describePage(path)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: privacyMode ? 'Using Tinder' : page.details,
  }
  if (!privacyMode && page.smallImageKey)
    presenceData.smallImageKey = page.smallImageKey
  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  presence.setActivity(presenceData)
})
