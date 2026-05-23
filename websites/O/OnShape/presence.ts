const presence = new Presence({
  clientId: '1403785669171740814',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/OnShape/assets/logo.png',
}

function getCleanOnshapeTitle(): string {
  const rawTitle = document.title
  if (rawTitle.includes('Documents')) {
    return 'Searching...'
  }
  return rawTitle.replace(' - Onshape', '').trim()
}

function getOnshapeStatus(): string {
  const status = document.title
  if (status.includes('Documents')) {
    return ''
  }
  else {
    return 'Editing...'
  }
}

presence.on('UpdateData', async () => {
  const title = getCleanOnshapeTitle()
  const state = getOnshapeStatus()
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: `${title}`,
    state: `${state}`,
  }

  presence.setActivity(presenceData)
})
