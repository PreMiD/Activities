import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '745261937092198532',
})

presence.on('UpdateData', async () => {
  if (
    document.querySelectorAll('.player-controls__btn_pause').length !== 2
    || !navigator.mediaSession.metadata
  ) {
    return presence.clearActivity()
  }

  const largeImageKey = navigator.mediaSession.metadata.artwork
    ? navigator.mediaSession.metadata.artwork.at(-1)?.src
    : 'https://cdn.rcd.gg/PreMiD/websites/Y/Yandex%20Music/assets/logo.png'
  const timePassed = document.querySelector('.progress__left')?.textContent
  const [currentTime, duration] = [
    presence.timestampFromFormat(timePassed!),
    presence.timestampFromFormat(
      document.querySelector('.progress__right')!.textContent!,
    ) + presence.timestampFromFormat(timePassed!),
  ]
  const [startTimestamp, endTimestamp] = presence.getTimestamps(
    currentTime,
    duration,
  )
  const presenceData = {
    type: ActivityType.Listening,
    largeImageKey,
    details: navigator.mediaSession.metadata.title,
    state: navigator.mediaSession.metadata.artist
      || navigator.mediaSession.metadata.album,
    startTimestamp,
    endTimestamp,
  }

  presence.setActivity(presenceData)
})
