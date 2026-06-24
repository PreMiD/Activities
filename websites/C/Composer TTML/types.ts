interface ComposerLyricLine {
  agentId: string
  backgroundText: string
  backgroundTextSource: any
  backgroundWords: []
  id: string
  text: string
  words: { text: string, begin: number, end: number }[]
}

interface ComposerLyricMetadata {
  album: string
  artist: string
  duration: number
  title: string
}

export interface ComposerLyricsDB {
  agents: { id: string, name?: string, type: string }[]
  audioFileName?: string
  audioSource?: { kind: string, name: string }
  dismissedExplicitSuggestions: string[]
  dismissedSuggestions: string[]
  granularity: 'word' | 'line' | string
  groups: []
  lines: ComposerLyricLine[]
  metadata: ComposerLyricMetadata
  savedAt: number
  version: number
}

export interface ComposerAudioDB {
  name: string
  type: string
  data: ArrayBuffer
}
