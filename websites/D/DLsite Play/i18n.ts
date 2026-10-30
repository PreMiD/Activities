export interface Messages {
  viewWork: string
  paused: string
}

export const stringKeys = {
  viewWork: 'general.buttonViewPage',
  paused: 'general.paused',
}

export const defaultMessages: Messages = {
  viewWork: 'View Page',
  paused: 'Paused',
}

// getStrings follows PreMiD's official lang setting, including Auto. Never
// await translation requests inside UpdateData: playback must remain responsive.
export class TranslationCache {
  messages = { ...defaultMessages }
  private language: string | null = null
  private nextRefresh = 0
  private generation = 0
  private disposed = false

  constructor(private read: () => Promise<Messages>, private onChange: () => void) {}

  refresh(language: unknown) {
    if (this.disposed)
      return
    const key = typeof language === 'string' && language ? language : 'auto'
    if (key === this.language && Date.now() < this.nextRefresh)
      return
    if (key !== this.language)
      this.messages = { ...defaultMessages }
    this.language = key
    this.nextRefresh = Date.now() + 60000
    const generation = ++this.generation
    void this.read().then((result) => {
      if (this.disposed || generation !== this.generation)
        return
      const messages = { ...defaultMessages }
      for (const name of ['viewWork', 'paused'] as const) {
        const value = result?.[name]
        const maximum = name === 'viewWork' ? 32 : 128
        if (typeof value === 'string' && value.trim().length >= 2
          && value.trim().length <= maximum && value !== stringKeys[name]) {
          messages[name] = value.trim()
        }
      }
      if (JSON.stringify(messages) !== JSON.stringify(this.messages)) {
        this.messages = messages
        this.onChange()
      }
    }).catch(() => {
      // Keep safe English labels until the next scheduled retry.
    })
  }

  dispose() {
    this.disposed = true
    ++this.generation
  }
}
