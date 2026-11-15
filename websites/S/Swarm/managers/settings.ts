import type { Settings } from '../types.js'

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export class SettingsManager {
  private presence: Presence
  private settings: Settings | undefined

  constructor(presence: Presence) {
    this.presence = presence
  }

  async getSettings(): Promise<Settings> {
    const [privacy, showButtons, showPosters] = await Promise.all([
      this.presence.getSetting('privacy'),
      this.presence.getSetting('showButtons'),
      this.presence.getSetting('showPosters'),
    ])

    this.settings = {
      privacy: asBool(privacy, false),
      showButtons: asBool(showButtons, true),
      showPosters: asBool(showPosters, true),
    }

    return this.settings
  }

  get currentSettings(): Settings | undefined {
    return this.settings
  }
}
