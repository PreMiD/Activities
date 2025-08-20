import type { AniziumSettings } from './types.js'
import { Images } from './types.js'

export class SettingsManager {
  private presence: any
  private settings: AniziumSettings | undefined

  constructor(presence: any) {
    this.presence = presence
  }

  async getSettings(): Promise<AniziumSettings> {
    const settingKeys: (keyof AniziumSettings)[] = ['showButtons', 'logoType']

    const settingPromises = settingKeys.map(key => this.presence.getSetting(key))
    const settingValues = await Promise.all(settingPromises)

    const settingsObject = settingKeys.reduce((acc, key, index) => {
      const value = settingValues[index]
      if (key === 'showButtons') {
        acc[key] = typeof value === 'boolean' ? value : true
      }
      else if (key === 'logoType') {
        acc[key] = typeof value === 'number' ? value : 0 // Varsayılan olarak animasyonlu logo
      }
      return acc
    }, {} as Partial<AniziumSettings>)

    this.settings = settingsObject as AniziumSettings
    return this.settings
  }

  getLogo(): string {
    if (!this.settings)
      return Images.AnimatedLogo

    switch (this.settings.logoType) {
      case 0: // Animasyonlu
        return Images.AnimatedLogo
      case 1: // Düz
        return Images.Logo
      case 2: // Düz, Arkaplan yok
        return Images.LogoNoBg
      default:
        return Images.AnimatedLogo
    }
  }

  get currentSettings(): AniziumSettings | undefined {
    return this.settings
  }
}
