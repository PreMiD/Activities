const presence = new Presence({
  clientId: '811198714726449183',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny%20Item%20Manager/assets/logo.png',
  GuardianWarlock = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny%20Item%20Manager/assets/0.png',
  GuardianTitan = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny%20Item%20Manager/assets/1.png',
  GuardianHunter = 'https://cdn.rcd.gg/PreMiD/websites/D/Destiny%20Item%20Manager/assets/2.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (window.location.host === 'destinyitemmanager.com') {
    presenceData.details = 'Browsing...'
  }
  else if (window.location.host.startsWith('app')) {
    if (window.location.pathname.includes('inventory')) {
      const guardian = document
        .querySelector(
          '#content > div.inventory-container.destiny2 > div > div.store-row.store-header > div:nth-child(1) > div:nth-child(1) > div > div._2mo8C > div._1zQrq > div.ohqoA > div.FZBlR',
        )
        ?.textContent
        ?.trim()

      presenceData.details = 'Inventory'
      presenceData.state = guardian
      presenceData.smallImageText = `${guardian} - ${document
        .querySelector(
          '#content > div.inventory-container.destiny2 > div > div.store-row.store-header > div:nth-child(1) > div:nth-child(1) > div > div._2mo8C > div._1zQrq > div.ohqoA > div._1FuuK',
        )
        ?.textContent
        ?.trim()}`

      switch (guardian) {
        case 'Titan': {
          presenceData.smallImageKey = ActivityAssets.GuardianTitan
          break
        }
        case 'Warlock': {
          presenceData.smallImageKey = ActivityAssets.GuardianWarlock
          break
        }
        case 'Hunter': {
          presenceData.smallImageKey = ActivityAssets.GuardianHunter
          break
        }
      }
    }
    else if (window.location.pathname.includes('progress')) {
      presenceData.details = 'Progress'
    }
    else if (window.location.pathname.includes('vendors')) {
      presenceData.details = 'Vendors'
    }
    else if (window.location.pathname.includes('records')) {
      presenceData.details = 'Records'
    }
    else if (window.location.pathname.includes('optimizer')) {
      presenceData.details = 'Loadout Optimizer'
    }
    else if (window.location.pathname.includes('organizer')) {
      presenceData.details = 'Organizer'
    }
    else if (window.location.pathname.includes('settings')) {
      presenceData.details = 'Settings'
    }
    else if (window.location.pathname.includes('about')) {
      presenceData.details = 'About'
    }
    else if (window.location.pathname.includes('whats-new')) {
      presenceData.details = 'DIM Changes'
    }
  }
  else {
    presenceData.details = 'Browsing...'
  }

  presence.setActivity(presenceData)
})
