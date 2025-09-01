export enum Images {
  Logo = 'https://mido.anlayana.com/premid/images/aistudio/logo.png',
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
