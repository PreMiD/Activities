import type { AiStudioSettings } from '../types.js'
import { Utils } from '../utils.js'

export class RouteHandlers {
  public static handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'On the homepage'
  }

  public static handlePromptPage(presenceData: PresenceData, settings: AiStudioSettings): void {
    const chatName = Utils.getInfoByName('chatName')

    const pageTypeElement = document.querySelector('.breadcrumb-title')
    const pageTypeText = pageTypeElement ? pageTypeElement.textContent?.trim() : ''

    let modelName: string | null

    if (pageTypeText === 'Generate media') {
      modelName = Utils.getInfoByName('generatemediaModelName')
    }
    else {
      modelName = Utils.getInfoByName('chatModelName')
    }

    if (settings?.showChatName && chatName && chatName.toLowerCase() !== 'chat prompt') {
      presenceData.details = `Chat: ${chatName}`
    }
    else {
      presenceData.details = 'Working on a new prompt'
    }

    const stateParts: string[] = []

    if (settings?.showModelName) {
      stateParts.push(`Model: ${modelName || 'Unknown'}`)
    }

    if (settings?.showTokenCount) {
      const currentTokens = Utils.getInfoByName('currentTokenCount')

      if (currentTokens) {
        const tokenText = (currentTokens === 'progress_activity')
          ? 'Tokens: Calculating'
          : `Tokens: ${currentTokens}`

        stateParts.push(tokenText)
      }
    }
    presenceData.state = stateParts.join(' | ')
  }

  public static handleImagenPromptPage(presenceData: PresenceData, settings: AiStudioSettings): void {
    const chatName = Utils.getInfoByName('generatemediaChatName')
    const modelName = Utils.getInfoByName('generatemediaModelName')

    if (settings?.showChatName && chatName && chatName.toLowerCase() !== 'chat prompt') {
      presenceData.details = `Chat: ${chatName}`
    }
    else {
      presenceData.details = 'Working on a new prompt'
    }

    const stateParts: string[] = []

    if (settings?.showModelName) {
      stateParts.push(`Model: ${modelName || 'Unknown'}`)
    }

    presenceData.state = stateParts.join(' | ')
  }

  public static handleSpeechPromptPage(presenceData: PresenceData, settings: AiStudioSettings): void {
    const chatName = Utils.getInfoByName('generatemediaChatName')
    const modelName = Utils.getInfoByName('generatemediaModelName')

    if (settings?.showChatName && chatName && chatName.toLowerCase() !== 'chat prompt') {
      presenceData.details = `Chat: ${chatName}`
    }
    else {
      presenceData.details = 'Working on a new prompt'
    }

    const stateParts: string[] = []

    if (settings?.showModelName) {
      stateParts.push(`Model: ${modelName || 'Unknown'}`)
    }

    presenceData.state = stateParts.join(' | ')
  }

  public static handleLivePage(presenceData: PresenceData, settings: AiStudioSettings): void {
    const modelName = Utils.getInfoByName('liveModelName')
    const voiceName = Utils.getInfoByName('liveModelVoiceName')

    presenceData.details = 'Gemini Live'

    const stateParts: string[] = []

    if (settings?.showModelName) {
      stateParts.push(`Model: ${modelName || 'Unknown'}`)
    }

    if (settings?.showVoiceName) {
      stateParts.push(`Voice: ${voiceName || 'Unknown'}`)
    }

    presenceData.state = stateParts.join(' | ')
  }

  public static handleGenerateMediaPage(presenceData: PresenceData): void {
    presenceData.details = 'Exploring Generative Media Models'
  }

  public static handleLibraryPage(presenceData: PresenceData): void {
    presenceData.details = 'Displaying the Prompt History'
  }

  public static handleApiKeysPage(presenceData: PresenceData): void {
    presenceData.details = 'Managing API Keys'
  }

  public static handleUsagePage(presenceData: PresenceData): void {
    presenceData.details = 'Displaying Gemini API Usage'
  }

  public static handleStatusPage(presenceData: PresenceData): void {
    presenceData.details = 'Displaying the Status page'
  }

  public static handleDefaultPage(presenceData: PresenceData): void {
    presenceData.details = 'Page Displaying...'
  }
}
