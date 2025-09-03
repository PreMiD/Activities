import type { ChatInfoType } from './types.js'

export class Utils {
  public static getRoutePattern(pathname: string): string {
    if (pathname.startsWith('/prompts/')) {
      if (pathname.includes('/new_images')) {
        return '/prompts/new_images'
      }
      else {
        return '/prompts/'
      }
    }

    return pathname
  }

  public static getInfoByName(infoName: ChatInfoType): string {
    switch (infoName) {
      case 'chatName':
        return this.getTextFromSelector('.page-title h1', 'Unknown Chat')

      case 'chatModelName':
        return this.getTextFromSelector('button.model-selector-card span.title', 'Unknown Model')

      case 'generatemediaChatName':
        return this.getTextFromSelector('.page-title h1', 'Unknown Prompt')

      case 'generatemediaModelName':
        return this.getTextFromSelector('span.mat-mdc-select-value-text', 'Unknown Model')

      case 'liveModelName':
        return this.getTextFromSelector('[data-test-ms-model-selector] mat-select-trigger', 'Unknown Model')

      case 'liveModelVoiceName':
        return this.findLiveModelVoiceName()

      case 'currentTokenCount':
        return this.getTokenCount()

      default:
        return 'Unknown'
    }
  }

  private static getTextFromSelector(selector: string, defaultValue: string): string {
    const el = document.querySelector<HTMLElement>(selector)

    if (el?.textContent) {
      const trimmedText = el.textContent.trim()
      if (trimmedText) {
        return trimmedText
      }
    }

    return defaultValue
  }

  private static findLiveModelVoiceName(): string {
    const allEntries = document.querySelectorAll<HTMLElement>('.entry')

    for (const entry of Array.from(allEntries)) {
      const label = entry.querySelector<HTMLElement>('.label')
      if (label?.textContent?.trim() === 'Voice') {
        const triggerEl = entry.querySelector<HTMLElement>('mat-select-trigger')

        if (triggerEl) {
          for (const node of Array.from(triggerEl.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
              return node.textContent.trim()
            }
          }
        }
        break
      }
    }

    return 'Unknown Voice'
  }

  private static getTokenCount(): string {
    const selector = '.v3-token-count-value'

    const defaultValue = '0 tokens'
    const defaultReturnValue = '0'

    try {
      const fullTokenText = this.getTextFromSelector(selector, defaultValue)

      const parts = fullTokenText.trim().split(/\s+/)

      return parts[0] ?? defaultReturnValue
    }
    catch (error) {
      console.error('Error receiving token information:', error)
      return defaultReturnValue
    }
  }
}
