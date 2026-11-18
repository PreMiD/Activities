import { describe, expect, it, vi } from 'vitest'
import { newRuntimeCapabilities, runSyncScript } from './harness.js'

describe('sync script harness', () => {
  it('gives only the new runtime the runtime, log and host change members', () => {
    const old = runSyncScript('Netflix', 'old')
    const current = runSyncScript('Netflix', 'new')

    expect(old.ctx.runtime).toBeUndefined()
    expect(old.ctx.log).toBeUndefined()
    expect(old.ctx.party.onHostChange).toBeUndefined()
    expect(current.ctx.runtime.capabilities).toEqual(newRuntimeCapabilities)
    expect(current.ctx.log).toBeTypeOf('function')
    expect(current.ctx.party.onHostChange).toBeTypeOf('function')
  })

  it('notifies host change handlers until they unsubscribe', () => {
    const { ctx, changeHost } = runSyncScript('Netflix', 'new')
    const handler = vi.fn()
    const unsubscribe = ctx.party.onHostChange(handler)

    changeHost(true)
    unsubscribe()
    changeHost(false)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(true)
  })
})
