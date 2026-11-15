import { describe, expect, it } from 'vitest'
import { parseSoloCommand, SyncScriptDevConsole } from './SyncScriptDevConsole.js'

function report(kind: string, data?: unknown, tabId = 7) {
  return { type: 'syncScriptReport', service: 'YouTube', tabId, kind, data }
}

describe('parseSoloCommand', () => {
  it('reads roles, playback commands and help', () => {
    expect(parseSoloCommand('follower')).toEqual({ type: 'syncScriptSolo', command: 'follower' })
    expect(parseSoloCommand('  Controller ')).toEqual({ type: 'syncScriptSolo', command: 'controller' })
    expect(parseSoloCommand('play')).toEqual({ type: 'syncScriptSolo', command: 'play' })
    expect(parseSoloCommand('play 12.5')).toEqual({ type: 'syncScriptSolo', command: 'play', value: 12.5 })
    expect(parseSoloCommand('pause 30')).toEqual({ type: 'syncScriptSolo', command: 'pause', value: 30 })
    expect(parseSoloCommand('seek 0')).toEqual({ type: 'syncScriptSolo', command: 'seek', value: 0 })
    expect(parseSoloCommand('rate 1.5')).toEqual({ type: 'syncScriptSolo', command: 'rate', value: 1.5 })
    expect(parseSoloCommand('help')).toEqual({ help: true })
  })

  it('ignores an empty line', () => {
    expect(parseSoloCommand('   ')).toBeUndefined()
  })

  it('rejects unknown commands and bad values', () => {
    for (const line of ['jump', 'seek', 'seek abc', 'seek -3', 'rate 0', 'rate', 'follower 2', 'play 1 2', 'pause Infinity'])
      expect(parseSoloCommand(line), line).toEqual({ error: expect.stringContaining('help') })
  })
})

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

  it('tracks which tabs are in solo mode and in which role', () => {
    const devConsole = new SyncScriptDevConsole()

    expect(devConsole.format(report('solo', { active: true, role: 'controller', url: 'https://youtube.com/watch?v=1' }))?.text)
      .toBe('[YouTube tab 7] solo mode on as controller: https://youtube.com/watch?v=1')
    expect(devConsole.format(report('solo', { active: true, role: 'follower' }))?.text).toBe('[YouTube tab 7] now the follower')
    expect(devConsole.role).toBe('follower')
    expect(devConsole.soloTabs).toEqual(new Set([7]))

    expect(devConsole.format(report('solo', { active: false }))?.text).toBe('[YouTube tab 7] solo mode off')
    expect(devConsole.soloTabs.size).toBe(0)
  })

  it('forgets every solo tab when the extension disconnects', () => {
    const devConsole = new SyncScriptDevConsole()
    devConsole.format(report('solo', { active: true, role: 'follower', url: 'https://youtube.com' }))

    expect(devConsole.format({ type: 'disconnected' })).toBeUndefined()
    expect(devConsole.soloTabs.size).toBe(0)
    expect(devConsole.role).toBe('controller')
  })

  it('prints playback events at once and an unchanged state at most every five seconds', () => {
    const devConsole = new SyncScriptDevConsole()
    const status = (data: object, now: number) => devConsole.format(report('status', { duration: 300, playbackRate: 1, ...data }), now)?.text

    expect(status({ playing: true, currentTime: 1 }, 0)).toBe('[YouTube tab 7] playing at 1.0s of 300.0s')
    expect(status({ playing: true, currentTime: 2 }, 1000)).toBeUndefined()
    expect(status({ playing: false, currentTime: 2.5, event: 'pause' }, 1500)).toBe('[YouTube tab 7] pause at 2.5s of 300.0s')
    expect(status({ playing: false, currentTime: 2.5 }, 2500)).toBeUndefined()
    expect(status({ playing: false, currentTime: 2.5 }, 6600)).toBe('[YouTube tab 7] paused at 2.5s of 300.0s')
    expect(status({ playing: true, currentTime: 2.5, playbackRate: 2 }, 6700)).toBe('[YouTube tab 7] playing at 2.5s of 300.0s at 2x')
    expect(status({ playing: true, currentTime: 3, playbackRate: 1.5, event: 'rate' }, 6800)).toBe('[YouTube tab 7] rate 1.5x at 3.0s of 300.0s')
  })

  it('prints ads, buffering and the video handover only when they change', () => {
    const devConsole = new SyncScriptDevConsole()
    const text = (kind: string, data: object) => devConsole.format(report(kind, data))?.text

    expect(text('ad', { isInAd: false })).toBeUndefined()
    expect(text('ad', { isInAd: true })).toBe('[YouTube tab 7] ad started')
    expect(text('ad', { isInAd: true })).toBeUndefined()
    expect(text('ad', { isInAd: false })).toBe('[YouTube tab 7] ad ended')
    expect(text('buffering', { isBuffering: true })).toBe('[YouTube tab 7] buffering')
    expect(text('setElement', { hasElement: true })).toBe('[YouTube tab 7] took over the video')
  })

  it('prints the rest of what a script reports', () => {
    const devConsole = new SyncScriptDevConsole()

    expect(devConsole.format(report('error', { where: 'setup' }))).toEqual({ level: 'error', text: '[YouTube tab 7] the script stopped: setup threw' })
    expect(devConsole.format(report('blocked', { reason: 'Log in first' }))?.text).toBe('[YouTube tab 7] blocked: Log in first')
    expect(devConsole.format(report('pageInfo', { title: 'Video' }))?.text).toBe('[YouTube tab 7] pageInfo {"title":"Video"}')
    expect(devConsole.format(report('features', { fallback: false }))?.text).toBe('[YouTube tab 7] features {"fallback":false}')
  })

  it('explains why a command can\'t run yet', () => {
    const devConsole = new SyncScriptDevConsole()
    const play = { type: 'syncScriptSolo', command: 'play' } as const

    expect(devConsole.problemWith(play)).toContain('No tab is in solo mode')
    devConsole.format(report('solo', { active: true, role: 'controller', url: 'https://youtube.com' }))
    expect(devConsole.problemWith(play)).toContain('type follower first')
    expect(devConsole.problemWith({ type: 'syncScriptSolo', command: 'follower' })).toBeUndefined()
    devConsole.format(report('solo', { active: true, role: 'follower' }))
    expect(devConsole.problemWith(play)).toBeUndefined()
  })
})
