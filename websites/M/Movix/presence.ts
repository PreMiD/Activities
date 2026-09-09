import { setLanguage } from './core/strings.js'
import {
  setIframePlayback,
  setPosterEnabled,
  setPrivacyMode,
} from './core/utils.js'
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

async function getNumberSetting(
  settingId: string,
  fallback: number,
): Promise<number> {
  try {
    const value = await presence.getSetting<number>(settingId)
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : fallback
  }
  catch {
    return fallback
  }
}

presence.on('iFrameData', (data: unknown) => {
  setIframePlayback(data)
})

presence.on('UpdateData', async () => {
  const [showTimestamp, showButtons, privacyMode, showPoster, langIndex]
    = await Promise.all([
      getBooleanSetting('showTimestamp', true),
      getBooleanSetting('showButtons', false),
      getBooleanSetting('privacyMode', false),
      getBooleanSetting('showPoster', true),
      getNumberSetting('lang', 0),
    ])

  setLanguage(langIndex === 1 ? 'en' : 'fr')
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
