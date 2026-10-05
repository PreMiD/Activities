import { ActivityAssets } from './assets.js'

export interface GrokMode {
  id: 'fast' | 'auto' | 'expert' | 'heavy' | 'build' | 'voice'
  title: string
}

const MODE_TITLES: Record<GrokMode['id'], string> = {
  fast: 'Fast',
  auto: 'Auto',
  expert: 'Expert',
  heavy: 'Heavy',
  build: 'Build',
  voice: 'Voice',
}

export const MODE_ASSETS: Record<GrokMode['id'], string> = {
  fast: ActivityAssets.Fast,
  auto: ActivityAssets.Auto,
  expert: ActivityAssets.Expert,
  heavy: ActivityAssets.Heavy,
  build: ActivityAssets.Build,
  voice: ActivityAssets.Voice,
}

function matchMode(text: string): GrokMode | null {
  const value = text.toLowerCase()
  const ids: GrokMode['id'][] = ['expert', 'heavy', 'build', 'voice', 'fast', 'auto']
  for (const id of ids) {
    if (new RegExp(`\\b${id}\\b`, 'i').test(value))
      return { id, title: MODE_TITLES[id] }
  }
  return null
}

export function getGrokMode(pathname: string): GrokMode | null {
  if (pathname.startsWith('/voice') || document.querySelector('[class*="voice-bar"]'))
    return { id: 'voice', title: MODE_TITLES.voice }

  const trigger = document.querySelector('#model-select-trigger')
  if (trigger) {
    const titled = trigger.querySelector('.truncate, .font-semibold')?.textContent ?? ''
    const fromTitle = matchMode(titled)
    if (fromTitle)
      return fromTitle
    const fromTrigger = matchMode(trigger.textContent ?? '')
    if (fromTrigger)
      return fromTrigger
  }

  return null
}
