import { ActivityType } from 'premid'

const presence = new Presence({ clientId: '1515251988646989854' })

presence.on('UpdateData', () => {
  const el = document.getElementById('kitsu-presence-data')

  if (!el || !el.getAttribute('data-active')) {
    presence.clearActivity()
    return
  }

  const details = el.getAttribute('data-details') || undefined
  const state = el.getAttribute('data-state') || undefined
  const largeImageKey = el.getAttribute('data-large-image') || undefined
  const largeImageText = el.getAttribute('data-large-image-text') || undefined
  const startTimestampStr = el.getAttribute('data-start-timestamp')
  const endTimestampStr = el.getAttribute('data-end-timestamp')

  const startTimestamp = startTimestampStr ? Number.parseInt(startTimestampStr, 10) * 1000 : undefined
  const endTimestamp = endTimestampStr ? Number.parseInt(endTimestampStr, 10) * 1000 : undefined

  presence.setActivity({
    type: ActivityType.Watching,
    details,
    state,
    largeImageKey,
    largeImageText,
    smallImageKey: 'https://kitsu.live/favicon.png',
    smallImageText: 'kitsu.live',
    startTimestamp,
    endTimestamp,
    buttons: [
      {
        label: 'Watch on kitsu.live',
        url: document.location.href,
      },
    ],
  })
})
