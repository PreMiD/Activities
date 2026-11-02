import { createPresenceData } from './game-state.js'
import { PlaybackTracker } from './playback-tracker.js'

const presence = new Presence({ clientId: '1561993593592348772' })
const playbackTracker = new PlaybackTracker()

window.addEventListener('message', (event) => {
  playbackTracker.handleMessage(event, document, location)
})

presence.on('UpdateData', () => {
  const activity = createPresenceData(document, location, playbackTracker.read(document, location))
  if (activity)
    presence.setActivity(activity)
  else presence.clearActivity()
})
