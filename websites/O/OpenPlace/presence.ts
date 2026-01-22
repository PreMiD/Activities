const presence = new Presence({
  clientId: '1460179756770263072',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenPlace/assets/logo.png',
}

let level: string = 'Unknown'
let pixelsPainted: string = 'Unknown'

function updateGlobals() {
  const levelValue = document.querySelector('div.text-primary-content')?.textContent ?? 'Unknown'
  if (levelValue !== 'Unknown')
    level = levelValue

  let pixelsValue = document.querySelector('div.flex.items-center.gap-1 span.text-primary.font-semibold:not(.text-base)')?.textContent ?? 'Unknown'
  if (pixelsValue.startsWith('('))
    pixelsValue = 'Unknown'
  if (pixelsValue !== 'Unknown')
    pixelsPainted = pixelsValue
}

presence.on('UpdateData', async () => {
  const coordinatesPrivacy = await presence.getSetting<boolean>('coordinatesPrivacy')
  const countryPrivacy = !coordinatesPrivacy ? false : await presence.getSetting<boolean>('countryPrivacy')

  updateGlobals()
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const coordinatesElement = document.querySelector('.whitespace-nowrap')
  const coordinates = coordinatesElement && coordinatesElement.textContent
    ? coordinatesElement.textContent.replace('Pixel: ', '')
    : 'Unknown'
  const zone = document.querySelector('button.btn.btn-xs.flex')?.textContent ?? 'Unknown'
  const loggedIn = !document.querySelector('button.btn.btn-primary.shadow-xl')
  const isPainting = !!document.querySelector('div.absolute.bottom-0.left-0.z-50.w-full')

  // Helper function to determine the state message
  const getState = (): string => {
    if (!loggedIn)
      return 'Logged out'
    if (pixelsPainted === 'Unknown')
      return level === 'Unknown' ? '' : `Level ${level}`
    return `${pixelsPainted} Pixels painted (level ${level})`
  }

  // Set presence details and state based on available data
  if (coordinates === 'Unknown') {
    if (level === 'Unknown') {
      presenceData.details = !loggedIn ? 'Looking at the map' : 'Placing pixels'
      if (loggedIn)
        presenceData.state = getState()
    }
    else {
      presenceData.details = !isPainting ? 'Looking at the map' : 'Placing pixels'
      presenceData.state = getState()
    }
  }
  else {
    if (coordinatesPrivacy) {
      if (countryPrivacy) {
        presenceData.details = `Viewing a pixel`
      }
      else {
        presenceData.details = zone === 'Unknown'
          ? `Viewing a pixel`
          : `Viewing a pixel in ${zone}`
      }
    }
    else {
      presenceData.details = zone === 'Unknown'
        ? `Looking at pixel ${coordinates} (Unknown zone)`
        : `Looking at pixel ${coordinates} (${zone})`
    }
    presenceData.state = getState()
  }

  presence.setActivity(presenceData)
})
