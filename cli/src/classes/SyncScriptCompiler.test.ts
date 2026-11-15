import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { SyncScriptCompiler } from './SyncScriptCompiler.js'

const mocks = vi.hoisted(() => ({ build: vi.fn() }))
vi.mock('esbuild', () => ({ build: mocks.build }))

describe('syncScriptCompiler', () => {
  it('reports an esbuild failure instead of throwing when not killing', async () => {
    mocks.build.mockRejectedValueOnce(new Error('Could not resolve "./missing"'))
    const compiler = new SyncScriptCompiler(mkdtempSync(join(tmpdir(), 'sync-compile-')), { service: 'Test', regExp: 'test', version: '1.0.0' })
    vi.spyOn(compiler as any, 'typecheck').mockResolvedValue(true)

    await expect(compiler.compile({ kill: false })).resolves.toBe(false)
  })
})
