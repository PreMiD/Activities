export type SoloRole = 'controller' | 'follower'

export interface SoloCommand {
  type: 'syncScriptSolo'
  command: SoloRole | 'play' | 'pause' | 'seek' | 'rate'
  value?: number
}

export interface DevConsoleLine {
  level: 'info' | 'error'
  text: string
}

export const SOLO_HELP = `Solo mode runs the script on any page it matches while no party is running. Commands:
  controller        the script plays the video and reports it (the default)
  follower          the script is driven like a party follower
  play [seconds]    play; with a time, like the heartbeat of a host playing at that time
  pause [seconds]   pause, at that time if given
  seek <seconds>    seek to a time
  rate <rate>       set the playback rate
  help              show this list`

// A playing video reports every second or two; an unchanged state is repeated only this often.
const STATUS_REPEAT_MS = 5000

export function parseSoloCommand(line: string): SoloCommand | { help: true } | { error: string } | undefined {
  const [name, arg, ...rest] = line.trim().toLowerCase().split(/\s+/)
  if (!name)
    return undefined
  if (name === 'help')
    return { help: true }

  const invalid = { error: `Unknown command "${line.trim()}", type help for the list` }
  const value = arg === undefined ? undefined : Number(arg)
  if (rest.length || (value !== undefined && !(Number.isFinite(value) && value >= 0)))
    return invalid

  switch (name) {
    case 'controller':
    case 'follower':
      return value === undefined ? { type: 'syncScriptSolo', command: name } : invalid
    case 'play':
    case 'pause':
      return { type: 'syncScriptSolo', command: name, ...(value !== undefined && { value }) }
    case 'seek':
      return value === undefined ? invalid : { type: 'syncScriptSolo', command: name, value }
    case 'rate':
      return value ? { type: 'syncScriptSolo', command: name, value } : invalid
    default:
      return invalid
  }
}

function seconds(value: unknown) {
  return typeof value === 'number' ? `${value.toFixed(1)}s` : '?'
}

/** Turns what the extension reports about a dev sync script into terminal lines, and checks commands against it. */
export class SyncScriptDevConsole {
  role: SoloRole = 'controller'
  readonly soloTabs = new Set<number>()
  private statuses = new Map<number, { playing: unknown, playbackRate: unknown, at: number }>()
  private flags = new Map<string, boolean>()

  format(message: unknown, now = Date.now()): DevConsoleLine | undefined {
    if (!message || typeof message !== 'object')
      return undefined
    const { type, service, tabId, level, args, kind, data } = message as Record<string, any>
    const where = `[${service} tab ${tabId}]`

    if (type === 'syncScriptLog' && Array.isArray(args))
      return { level: level === 'error' ? 'error' : 'info', text: `${where} ${args.join(' ')}` }
    if (type !== 'syncScriptReport' || typeof kind !== 'string')
      return undefined

    const text = this.describe(tabId, kind, data ?? {}, now)
    return text === undefined ? undefined : { level: kind === 'error' ? 'error' : 'info', text: `${where} ${text}` }
  }

  problemWith(command: SoloCommand): string | undefined {
    if (!this.soloTabs.size)
      return 'No tab is in solo mode. Open a page the script matches while no party is running.'
    if (command.command !== 'controller' && command.command !== 'follower' && this.role !== 'follower')
      return 'Playback commands drive a follower, type follower first.'
    return undefined
  }

  private describe(tabId: number, kind: string, data: Record<string, any>, now: number): string | undefined {
    switch (kind) {
      case 'solo':
        return this.solo(tabId, data)
      case 'status':
        return this.status(tabId, data, now)
      case 'ad':
        return this.changed(tabId, kind, data.isInAd === true, 'ad started', 'ad ended')
      case 'buffering':
        return this.changed(tabId, kind, data.isBuffering === true, 'buffering', 'buffering ended')
      case 'setElement':
        return this.changed(tabId, kind, data.hasElement === true, 'took over the video', 'released the video')
      case 'error':
        return `the script stopped: ${data.where} threw`
      case 'blocked':
        return `blocked: ${data.reason}`
      case 'unblocked':
        return 'unblocked'
      default:
        return `${kind} ${JSON.stringify(data)}`
    }
  }

  private solo(tabId: number, data: Record<string, any>) {
    if (!data.active) {
      this.soloTabs.delete(tabId)
      this.statuses.delete(tabId)
      for (const key of this.flags.keys()) {
        if (key.startsWith(`${tabId}:`))
          this.flags.delete(key)
      }
      return 'solo mode off'
    }
    this.soloTabs.add(tabId)
    if (data.role === 'controller' || data.role === 'follower')
      this.role = data.role
    return data.url ? `solo mode on as ${data.role}: ${data.url}` : `now the ${data.role}`
  }

  // The runtime reports a state again when a page or script starts, which isn't a change worth a line.
  private changed(tabId: number, kind: string, value: boolean, on: string, off: string) {
    const key = `${tabId}:${kind}`
    if ((this.flags.get(key) ?? false) === value)
      return undefined
    this.flags.set(key, value)
    return value ? on : off
  }

  private status(tabId: number, data: Record<string, any>, now: number) {
    const time = `${seconds(data.currentTime)}${data.duration ? ` of ${seconds(data.duration)}` : ''}`
    const previous = this.statuses.get(tabId)
    if (!data.event && previous && previous.playing === data.playing && previous.playbackRate === data.playbackRate && now - previous.at < STATUS_REPEAT_MS)
      return undefined
    this.statuses.set(tabId, { playing: data.playing, playbackRate: data.playbackRate, at: now })

    if (data.event)
      return data.event === 'rate' ? `rate ${data.playbackRate}x at ${time}` : `${data.event} at ${time}`
    const rate = data.playbackRate !== undefined && data.playbackRate !== 1 ? ` at ${data.playbackRate}x` : ''
    return `${data.playing ? 'playing' : 'paused'} at ${time}${rate}`
  }
}
