import type { AniziumSettings } from '../types.js'
import { Images } from '../types.js'

const SETTINGS_CONFIG: {
  key: keyof AniziumSettings
  type: 'boolean' | 'number' | 'string'
  defaultValue: any
}[] = [
  { key: 'showButtons', type: 'boolean', defaultValue: true },
  { key: 'showPosters', type: 'boolean', defaultValue: true },
  { key: 'logoType', type: 'number', defaultValue: 0 },
  { key: 'showTimestamp', type: 'boolean', defaultValue: true },
  { key: 'watchingDetails', type: 'string', defaultValue: '%anime_title%' },
  {
    key: 'watchingState',
    type: 'string',
    defaultValue: 'Sezon %season% | Bölüm %episode%',
  },
]

export class SettingsManager {
  private presence: any
  private settings: AniziumSettings | undefined

  constructor(presence: any) {
    this.presence = presence
  }

  async getSettings(): Promise<AniziumSettings> {
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
      {} as Partial<AniziumSettings>,
    )

    this.settings = settingsObject as AniziumSettings
    return this.settings
  }

  getLogo(): string {
    if (!this.settings)
      return Images.AnimatedLogo

    switch (this.settings.logoType) {
      case 0: // Animasyonlu
        return Images.AnimatedLogo
      case 1: // Animasyonlu2
        return Images.AnimetedLogo2
      case 2: // Düz
        return Images.Logo
      case 3: // Düz, Arkaplan yok
        return Images.LogoNoBg
      default:
        return Images.AnimatedLogo
    }
  }

  get currentSettings(): AniziumSettings | undefined {
    return this.settings
  }
}
