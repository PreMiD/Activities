export type PrivacyOverrides = Record<string, boolean>

export const PRIVACY_MESSAGE_SOURCE = 'premid-animevietsub-privacy'

export interface PrivacyCommandMessage {
  source: typeof PRIVACY_MESSAGE_SOURCE
  type: 'request-state' | 'toggle'
}

export interface PrivacyStateMessage {
  source: typeof PRIVACY_MESSAGE_SOURCE
  type: 'state'
  privateMode: boolean
  privacyButtonShown: boolean
}

const unsafeKeys = new Set(['__proto__', 'constructor', 'prototype'])

export function isPrivacyCommandMessage(value: unknown): value is PrivacyCommandMessage {
  if (!value || typeof value !== 'object')
    return false

  const message = value as Partial<PrivacyCommandMessage>
  return message.source === PRIVACY_MESSAGE_SOURCE
    && (message.type === 'request-state' || message.type === 'toggle')
}

export function isPrivacyStateMessage(value: unknown): value is PrivacyStateMessage {
  if (!value || typeof value !== 'object')
    return false

  const message = value as Partial<PrivacyStateMessage>
  return message.source === PRIVACY_MESSAGE_SOURCE
    && message.type === 'state'
    && typeof message.privateMode === 'boolean'
    && typeof message.privacyButtonShown === 'boolean'
}

export function parsePrivacyOverrides(raw: string | null): PrivacyOverrides {
  try {
    const parsed: unknown = JSON.parse(raw ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return {}

    const overrides: PrivacyOverrides = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (unsafeKeys.has(key) || typeof value !== 'boolean')
        return {}
      overrides[key] = value
    }
    return overrides
  }
  catch {
    return {}
  }
}

export function getEpisodeKey(pathname: string, search: string): string {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const episode = new URLSearchParams(search).get('tap')

  return episode
    ? `${normalizedPath}?tap=${encodeURIComponent(episode)}`
    : normalizedPath
}

export function getEpisodePrivacy(
  globalPrivacy: boolean,
  episodeKey: string,
  overrides: PrivacyOverrides,
): boolean {
  return overrides[episodeKey] ?? globalPrivacy
}

export function toggleEpisodePrivacy(
  globalPrivacy: boolean,
  episodeKey: string,
  overrides: PrivacyOverrides,
): PrivacyOverrides {
  return {
    ...overrides,
    [episodeKey]: !getEpisodePrivacy(globalPrivacy, episodeKey, overrides),
  }
}
