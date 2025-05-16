import { Assets } from 'premid'

// See https://github.com/NeedCoolerShoes/editor for editor code to find data to extract

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://needcoolershoes.com/icon.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  presence.setActivity(presenceData)
})
