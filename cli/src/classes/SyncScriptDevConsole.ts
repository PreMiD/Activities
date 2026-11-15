export interface DevConsoleLine {
  level: 'info' | 'error'
  text: string
}

/** Turns what the extension reports about a dev sync script into terminal lines. */
export class SyncScriptDevConsole {
  format(message: unknown): DevConsoleLine | undefined {
    if (!message || typeof message !== 'object')
      return undefined
    const { type, service, tabId, level, args } = message as Record<string, any>
    const where = `[${service} tab ${tabId}]`

    if (type === 'syncScriptLog' && Array.isArray(args))
      return { level: level === 'error' ? 'error' : 'info', text: `${where} ${args.join(' ')}` }
    return undefined
  }
}
