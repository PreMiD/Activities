import { describe, expect, it } from 'vitest'
import { SyncScriptDevConsole } from './SyncScriptDevConsole.js'

describe('syncScriptDevConsole', () => {
  it('prints a dev script\'s logs and errors with the service and tab', () => {
    const devConsole = new SyncScriptDevConsole()

    expect(devConsole.format({ type: 'syncScriptLog', service: 'YouTube', tabId: 7, level: 'log', args: ['player', '{"ready":true}'] }))
      .toEqual({ level: 'info', text: '[YouTube tab 7] player {"ready":true}' })
    expect(devConsole.format({ type: 'syncScriptLog', service: 'YouTube', tabId: 7, level: 'error', args: ['setup threw', 'TypeError: x'] }))
      .toEqual({ level: 'error', text: '[YouTube tab 7] setup threw TypeError: x' })
  })

  it('ignores what it doesn\'t know', () => {
    const devConsole = new SyncScriptDevConsole()

    expect(devConsole.format(null)).toBeUndefined()
    expect(devConsole.format({ type: 'testEvent' })).toBeUndefined()
    expect(devConsole.format({ type: 'syncScriptLog', args: 'not a list' })).toBeUndefined()
  })
})
