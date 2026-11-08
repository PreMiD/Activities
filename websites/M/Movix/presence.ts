import { loadStrings } from './core/strings.js'
import { setPosterEnabled, setPrivacyMode } from './core/utils.js'
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

async function getLanguageSetting(): Promise<string> {
  try {
    const value = await presence.getSetting<string>('lang')
    return typeof value === 'string' && value ? value : 'en'
  }
  catch {
    return 'en'
  }
}

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons, privacyMode, showPoster, language]
    = await Promise.all([
      getBooleanSetting('showTimestamp', true),
      getBooleanSetting('showButtons', false),
      getBooleanSetting('privacyMode', false),
      getBooleanSetting('showPoster', true),
      getLanguageSetting(),
    ])

  await loadStrings(presence, language)
  setPrivacyMode(privacyMode)
  setPosterEnabled(showPoster)

  const presenceData = await buildRoutePresence(showTimestamp, showButtons)

  if (presenceData) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
