import { ActivityType, Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '745261937092198532',
})

presence.on('UpdateData', async () => {
  if (
    !document.querySelector('[*|href="/icons/sprite.svg#pause_filled_l"]:not([href])')
    || !navigator.mediaSession.metadata
  ) {
    return presence.clearActivity()
  }

  const largeImageKey = navigator.mediaSession.metadata.artwork
    ? navigator.mediaSession.metadata.artwork.at(-1)?.src
    : 'https://cdn.rcd.gg/PreMiD/websites/Y/Yandex%20Music/assets/logo.png'
  const timePassed = document.querySelector('[class*="Timecode_root_start"]')?.textContent
  const [currentTime, duration] = [
    timestampFromFormat(timePassed!),
    timestampFromFormat(
      document.querySelector('[class*="Timecode_root_end"]')!.textContent!,
    ),
  ]
  const [startTimestamp, endTimestamp] = getTimestamps(
    currentTime,
    duration,
  )
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    smallImageKey: Assets.Play,
    largeImageKey,
    details: navigator.mediaSession.metadata.title,
    state: navigator.mediaSession.metadata.artist
      || navigator.mediaSession.metadata.album,
    startTimestamp,
    endTimestamp,
  }

  presence.setActivity(presenceData)
})
