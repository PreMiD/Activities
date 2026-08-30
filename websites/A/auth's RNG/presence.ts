import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1408180664670359673',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://authsrng.xyz/assets/favicons/android-chrome-512x512.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Play,
    startTimestamp: browsingTimestamp,
    details: "auth's RNG",
    state: 'Playing',
    buttons: [
      {
        label: "play auth's RNG!",
        url: 'https://authsrng.xyz',
      },
    ],
  }

  presence.setActivity(presenceData)
})