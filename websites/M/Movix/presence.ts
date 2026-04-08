import { buildRoutePresence } from './routes/buildRoutePresence.js'

const presence = new Presence({
  clientId: '1259926474174238741',
})

async function getBooleanSetting(
  settingId: string,
  fallback: boolean,
): Promise<boolean> {
  try {
    const value = await presence.getSetting<boolean>(settingId)
    return typeof value === 'boolean' ? value : fallback
  }
  catch {
    return fallback
  }
}

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons] = await Promise.all([
    getBooleanSetting('showTimestamp', true),
    getBooleanSetting('showButtons', false),
  ])

  const presenceData = await buildRoutePresence(showTimestamp, showButtons)

  if (presenceData) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})

