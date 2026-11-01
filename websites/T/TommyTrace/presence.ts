import { createPresenceData } from './game-state.js'

const presence = new Presence({ clientId: '1561972568708218910' })
const startedAt = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp').catch(() => true)
  const activity = createPresenceData(document, location, startedAt, { showTimestamp })
  if (activity)
    presence.setActivity(activity)
  else presence.clearActivity()
})
