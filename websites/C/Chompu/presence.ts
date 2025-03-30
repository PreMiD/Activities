import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1219713910165209169',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Chompu/assets/logo.png',
}

const presenceData: PresenceData = {
  type: ActivityType.Listening,
  largeImageKey: ActivityAssets.Logo,
}

presence.on('UpdateData', async () => {
  if (document.querySelector<HTMLElement>('[data-player-status=\'true\']')) {
    const playing = document.querySelector<HTMLButtonElement>('button svg[data-player-pause="true"]')
    const [startPlayer, durationPlayer] = [
      timestampFromFormat(
        document.querySelector<HTMLElement>('[data-player-position="true"]')?.textContent?.split(' / ')[0] ?? '',
      ),
      timestampFromFormat(document.querySelector<HTMLElement>('[data-player-position="true"]')?.textContent?.split(' / ')[1] ?? ''),
    ]
    const [startTimestamp, endTimestamp] = getTimestamps(
      startPlayer,
      durationPlayer,
    );

    [presenceData.startTimestamp, presenceData.endTimestamp] = [
      startTimestamp,
      endTimestamp,
    ]

    presenceData.details = document.querySelector<HTMLElement>('[data-player-title]')?.textContent
    presenceData.state = document.querySelector<HTMLElement>('[data-player-author]')?.textContent
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>('[data-player-image]')?.src
    presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
    presenceData.smallImageText = playing ? 'Playing' : 'Pause'
    presenceData.startTimestamp = startTimestamp
    presenceData.endTimestamp = endTimestamp
    if (!playing)
      delete presenceData.startTimestamp
  }
  else {
    presenceData.details = 'No song queue found'
    presenceData.state = 'In the server...'
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'Zzz'
    presenceData.startTimestamp = browsingTimestamp
    if (presenceData.endTimestamp)
      delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})
