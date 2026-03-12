import type ActivityStrings from './iFixit.json'

export interface GuideData {
  title: string
  category: string
  url: string
  image: {
    standard: string
  }
  steps: []
  difficulty: string
}

declare global {
  interface StringKeys {
    iFixIt: keyof typeof ActivityStrings
  }
}
