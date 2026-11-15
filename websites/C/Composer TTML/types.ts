interface ComposerLyricGroup {
  color: string
  id: string
  label: string
  templateVersion: number
}

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
  thumbnailDataUrl: string
  thumbnailForVideoId: string
  title: string
}

export interface ComposerLyricsDB {
  agents: { id: string, name?: string, type: string }[]
  audioFileName?: string
  audioSource?: { kind: 'file' | 'youtube', videoId?: string, name?: string }
  dismissedExplicitSuggestions: string[]
  dismissedSuggestions: string[]
  granularity: 'word' | 'line' | string
  groups: ComposerLyricGroup[]
  lines: ComposerLyricLine[]
  metadata: ComposerLyricMetadata
  primingStripped: boolean
  savedAt: number
  syllableSplitDefaults: { applyToAll: boolean, caseInsensitive: boolean }
  version: number
}

export interface ComposerAudioDB {
  name: string
  type: string
  data: ArrayBuffer
}
