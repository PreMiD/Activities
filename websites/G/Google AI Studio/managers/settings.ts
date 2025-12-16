import type { AiStudioSettings } from '../types.js'

const SETTINGS_CONFIG: {
  key: keyof AiStudioSettings
  type: 'boolean' | 'number' | 'string'
  defaultValue: any
}[] = [
  { key: 'privacy', type: 'boolean', defaultValue: false },
  { key: 'showChatName', type: 'boolean', defaultValue: true },
  { key: 'showModelName', type: 'boolean', defaultValue: true },
  { key: 'showVoiceName', type: 'boolean', defaultValue: true },
  { key: 'showTokenCount', type: 'boolean', defaultValue: true },

]

export class SettingsManager {
  private presence: any
  private settings: AiStudioSettings | undefined

  constructor(presence: any) {
    this.presence = presence
  }

  async getSettings(): Promise<AiStudioSettings> {
    const settingKeys = SETTINGS_CONFIG.map(config => config.key)

    const settingPromises = settingKeys.map(key => this.presence.getSetting(key))
    const settingValues = await Promise.all(settingPromises)

    const settingsObject = SETTINGS_CONFIG.reduce(
      (acc, config, index) => {
        const receivedValue = settingValues[index]
        const { key, type, defaultValue } = config

        let isTypeValid = false

        switch (type) {
          case 'string':
            isTypeValid = typeof receivedValue === 'string'
            break
          case 'number':
            isTypeValid = typeof receivedValue === 'number'
            break
          case 'boolean':
            isTypeValid = typeof receivedValue === 'boolean'
            break
        }

        const isValueValid
                    = type === 'string'
                      ? isTypeValid && receivedValue
                      : isTypeValid

        acc[key] = isValueValid ? receivedValue : defaultValue
        return acc
      },
      {} as Partial<AiStudioSettings>,
    )

    this.settings = settingsObject as AiStudioSettings
    return this.settings
  }

  get currentSettings(): AiStudioSettings | undefined {
    return this.settings
  }
}
