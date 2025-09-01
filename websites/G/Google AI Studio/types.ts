export enum Images {
  Logo = 'https://www.gstatic.com/aistudio/ai_studio_favicon_2_256x256.png',
}

export interface AiStudioSettings {
  privacy: boolean
  showChatName: boolean
  showModelName: boolean
  showVoiceName: boolean
  showTokenCount: boolean
}

export type ChatInfoType
  = | 'chatName'
    | 'chatModelName'
    | 'generatemediaChatName'
    | 'generatemediaModelName'
    | 'liveModelName'
    | 'liveModelVoiceName'
    | 'currentTokenCount'
    | 'maxTokenCount'
