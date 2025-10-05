export enum Images {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20AI%20Studio/assets/logo.png',
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
