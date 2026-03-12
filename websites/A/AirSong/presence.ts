import { Assets } from 'premid'

const presence = new Presence({
  clientId: '936448491373359105',
})

presence.on('UpdateData', async () => {
  if (document.querySelector<HTMLAnchorElement>('a.as-logo')) {
    const [songDetail, songState, time] = await Promise.all([
      presence.getSetting<string>('songDetail'),
      presence.getSetting<string>('songState'),
      presence.getSetting<number>('time'),
    ])
    const title = document.querySelector<HTMLDivElement>('#as-player-title')?.textContent
    const artist = document
      .querySelector<HTMLDivElement>('#as-player-artist')
      ?.textContent
      ?.split(' - ', 1)[0]
    // Matches the whitespace character literally to eliminate as most false positives as possible
    const [, album] = document.querySelector<HTMLDivElement>('#as-player-artist')!.textContent!.split(/ - (.+)/) as [string, string]
    const volume = document
      .querySelector<HTMLDivElement>('div.mejs-horizontal-volume-current')
      ?.style
      ?.width
      ?.replace('px', '') as unknown as number
    const timeElapsed = presence.timestampFromFormat(
      document.querySelector<HTMLSpanElement>('span.mejs-currenttime')
        ?.textContent ?? '',
    )
    const presenceData: PresenceData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/AirSong/assets/logo.png',
    }
    const paused = document
      .querySelector<HTMLAnchorElement>('#as-player-play')
      ?.className
      ?.includes('fa-play')
    presenceData.details = songDetail
      .replace('%title%', title ?? '')
      .replace('%artist%', artist ?? '')
      .replace('%album%', album ?? '')
    presenceData.state = songState
      .replace('%title%', title ?? '')
      .replace('%artist%', artist ?? '')
      .replace('%album%', album ?? '')
    if (!paused && time === 1) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
        presence.timestampFromFormat(
          document.querySelector<HTMLSpanElement>('span.mejs-duration')
            ?.textContent ?? '',
        ),
        timeElapsed,
      )
    }
    else if (!paused && time === 2) {
      presenceData.startTimestamp = Date.now() / 1000 - timeElapsed
    }

    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused
      ? 'Paused'
      : `Playing at ${volume * 2}%`

    presence.setActivity(presenceData)
  }
})
