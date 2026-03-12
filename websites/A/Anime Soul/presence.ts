const presence = new Presence({
  clientId: '672156210627084328',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const staticPages: Record<string, PresenceData> = {
  '/': { details: 'Viewing home page' },
  '/staff-list': { details: 'Viewing Staff List' },
  'rules': { details: 'Viewing the rules' },
  'appeals': { details: 'Viewing Appeals' },
  'creators': { details: 'Viewing AS Creators' },
  'leaderboards': { details: 'Viewing Leaderboards' },
  'premium': { details: 'Viewing Premium' },
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Anime%20Soul/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = window.location

  for (const [path, data] of Object.entries(staticPages)) {
    if (pathname.startsWith(path))
      presenceData = { ...presenceData, ...data } as PresenceData
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
