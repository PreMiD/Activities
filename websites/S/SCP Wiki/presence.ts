const presence = new Presence({
  clientId: '639208971806310441',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SCP%20Wiki/assets/logo.png',
  LogoInt = 'https://cdn.rcd.gg/PreMiD/websites/S/SCP%20Wiki/assets/0.png',
  LogoSandbox = 'https://cdn.rcd.gg/PreMiD/websites/S/SCP%20Wiki/assets/1.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SCP%20Wiki/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'scp-int.wikidot.com')
    presenceData.largeImageKey = ActivityAssets.LogoInt
  if (document.location.hostname === 'scp-sandbox-3.wikidot.com')
    presenceData.largeImageKey = ActivityAssets.LogoSandbox

  if (document.location.pathname === '/' || !document.location.pathname) {
    presenceData.state = 'Front Page'
  }
  else {
    presenceData.state = document
      .querySelector('#page-title')
      ?.textContent
      ?.trim()
  }

  presence.setActivity(presenceData)
})
