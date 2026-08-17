import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1536454244410859580',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/GhoulApp/assets/logo.png',
}

const BRIDGE_ID = 'ghoulapp-discord-activity-bridge'
const BRIDGE_MAX_LENGTH = 1024
const LABEL_MAX_LENGTH = 64
const DISCORD_TEXT_MAX_LENGTH = 128

const activityLabels = {
  browsing: 'Browsing GhoulApp',
  character_creation: 'Creating a character',
  character_sheet: 'Viewing a character sheet',
  wiki: 'Reading the rules wiki',
  dice_tools: 'Using dice tools',
  community: 'Browsing the community',
  chronicles: 'Browsing chronicles',
  storyteller_tools: 'Using Storyteller tools',
  chronicle_dashboard: 'Viewing a chronicle dashboard',
  story: 'Planning the chronicle story',
  npcs: 'Managing chronicle NPCs',
  chronicle_reference: 'Reading chronicle references',
  map: 'Viewing the chronicle map',
  characters: 'Viewing chronicle characters',
  relationships: 'Viewing chronicle relationships',
  planning: 'Planning a chronicle',
  battles: 'Preparing a battle',
  boons: 'Reviewing boons',
  xp: 'Reviewing experience',
  members: 'Viewing chronicle members',
  chronicle_settings: 'Managing chronicle settings',
  notes: 'Reviewing chronicle notes',
  live_session: 'In a live session',
  map_presenting: 'Presenting a chronicle map',
  session_broadcast: 'Presenting a live session',
} as const

type ActivityKey = keyof typeof activityLabels
type Edition = 'V5' | 'V20' | 'CUSTOM' | 'DAV20' | 'DA' | 'V6'
type Role = 'storyteller' | 'co_storyteller' | 'moderator' | 'player' | 'observer'

interface BridgeActivity {
  kind: 'activity'
  activity: ActivityKey
  chronicleName?: string
  edition?: Edition
  role?: Role
}

type BridgeResult = BridgeActivity | { kind: 'clear' } | { kind: 'missing' }

const editions = new Set<Edition>(['V5', 'V20', 'CUSTOM', 'DAV20', 'DA', 'V6'])
const roles = new Set<Role>(['storyteller', 'co_storyteller', 'moderator', 'player', 'observer'])
const activities = new Set<ActivityKey>(Object.keys(activityLabels) as ActivityKey[])
const unsafeLabelCharacters = /[\p{Cc}\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/gu

function clamp(value: string, maximum: number): string {
  return Array.from(value).slice(0, maximum).join('')
}

function sanitizeLabel(value: unknown): string | undefined {
  if (typeof value !== 'string')
    return undefined

  try {
    const sanitized = value
      .normalize('NFC')
      .replace(unsafeLabelCharacters, '')
      .replace(/\s+/gu, ' ')
      .trim()
    return sanitized ? clamp(sanitized, LABEL_MAX_LENGTH) : undefined
  }
  catch {
    return undefined
  }
}

function readBridge(): BridgeResult {
  const bridges = document.querySelectorAll<HTMLElement>(`#${BRIDGE_ID}`)
  if (bridges.length === 0)
    return { kind: 'missing' }
  if (bridges.length !== 1)
    return { kind: 'clear' }

  const raw = bridges[0]?.dataset.payload
  if (!raw || raw.length > BRIDGE_MAX_LENGTH)
    return { kind: 'clear' }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object')
      return { kind: 'clear' }

    const value = parsed as Record<string, unknown>
    if (value.v !== 1)
      return { kind: 'clear' }
    if (value.mode === 'clear')
      return { kind: 'clear' }
    if (value.mode !== 'activity' || typeof value.activity !== 'string')
      return { kind: 'clear' }
    if (!activities.has(value.activity as ActivityKey))
      return { kind: 'clear' }

    const chronicleName = sanitizeLabel(value.chronicleName)
    const edition = typeof value.edition === 'string' && editions.has(value.edition as Edition)
      ? value.edition as Edition
      : undefined
    const role = typeof value.role === 'string' && roles.has(value.role as Role)
      ? value.role as Role
      : undefined

    return {
      kind: 'activity',
      activity: value.activity as ActivityKey,
      ...(chronicleName ? { chronicleName } : {}),
      ...(edition ? { edition } : {}),
      ...(role ? { role } : {}),
    }
  }
  catch {
    return { kind: 'clear' }
  }
}

function stripEditionPrefix(pathname: string): string[] {
  const segments = pathname.split('/').filter(Boolean)
  if (['v5', 'v20', 'v6', 'da', 'dav20'].includes(segments[0]?.toLowerCase() ?? ''))
    segments.shift()
  return segments
}

function fallbackFromPath(pathname: string): BridgeActivity | { kind: 'clear' } {
  const segments = stripEditionPrefix(pathname)
  const root = segments[0]?.toLowerCase() ?? ''

  if (root === 'settings' || root === 'join' || root === 'invite')
    return { kind: 'clear' }
  if (root === 'create' || root === 'fastbuild' || root === 'bloodtest')
    return { kind: 'activity', activity: 'character_creation' }
  if (root === 'character' || root === 'sheet')
    return { kind: 'activity', activity: 'character_sheet' }
  if (root === 'diceroller')
    return { kind: 'activity', activity: 'dice_tools' }
  if (root === 'wiki' || root === 'started' || root === 'v6-explained')
    return { kind: 'activity', activity: 'wiki' }
  if (root === 'community' || root === 'id')
    return { kind: 'activity', activity: 'community' }
  if (root === 'tool' || root === 'tools' || root === 'storyteller')
    return { kind: 'activity', activity: 'storyteller_tools' }

  if (root === 'chronicle') {
    if (!segments[1] || segments[1]?.toLowerCase() === 'new')
      return { kind: 'activity', activity: 'chronicles' }

    const section = segments[2]?.toLowerCase() ?? 'dashboard'
    const chronicleSections: Record<string, ActivityKey> = {
      'dashboard': 'chronicle_dashboard',
      'story': 'story',
      'chapters': 'story',
      'sessions': 'story',
      'npcs': 'npcs',
      'wiki': 'chronicle_reference',
      'handbook': 'chronicle_reference',
      'quickref': 'chronicle_reference',
      'map': 'map',
      'locations': 'map',
      'characters': 'characters',
      'coteries': 'characters',
      'relationships': 'relationships',
      'hierarchy': 'relationships',
      'planning': 'planning',
      'calendar': 'planning',
      'battles': 'battles',
      'boons': 'boons',
      'harpy-ledger': 'boons',
      'xp': 'xp',
      'members': 'members',
      'settings': 'chronicle_settings',
      'notes': 'notes',
      'live-session': 'live_session',
    }
    return {
      kind: 'activity',
      activity: chronicleSections[section] ?? 'chronicle_dashboard',
    }
  }

  return { kind: 'activity', activity: 'browsing' }
}

async function getBooleanSetting(id: string, fallback: boolean): Promise<boolean> {
  try {
    const value = await presence.getSetting<boolean>(id)
    return typeof value === 'boolean' ? value : fallback
  }
  catch {
    return fallback
  }
}

function roleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    storyteller: 'Storyteller',
    co_storyteller: 'Co-Storyteller',
    moderator: 'Moderator',
    player: 'Player',
    observer: 'Observer',
  }
  return labels[role]
}

presence.on('UpdateData', async () => {
  const [showChronicleName, showEdition, showRole] = await Promise.all([
    getBooleanSetting('showChronicleName', false),
    getBooleanSetting('showEdition', true),
    getBooleanSetting('showRole', false),
  ])

  const bridge = readBridge()
  const resolved = bridge.kind === 'missing'
    ? fallbackFromPath(document.location.pathname)
    : bridge

  if (resolved.kind === 'clear') {
    presence.clearActivity()
    return
  }

  const stateParts: string[] = []
  if (showChronicleName && resolved.chronicleName)
    stateParts.push(resolved.chronicleName)
  if (showEdition && resolved.edition)
    stateParts.push(resolved.edition)
  if (showRole && resolved.role)
    stateParts.push(roleLabel(resolved.role))

  const presenceData: PresenceData = {
    type: ActivityType.Playing,
    largeImageKey: ActivityAssets.Logo,
    details: clamp(activityLabels[resolved.activity], DISCORD_TEXT_MAX_LENGTH),
  }
  if (stateParts.length > 0)
    presenceData.state = clamp(stateParts.join(' • '), DISCORD_TEXT_MAX_LENGTH)

  await presence.setActivity(presenceData)
})
