import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  changedFiles: [] as { path: string, deleted: boolean }[],
}))

vi.mock('is-ci', () => ({ default: false }))
vi.mock('./getChangedFiles.js', () => ({
  getChangedFilesCi: async () => mocks.changedFiles,
  getChangedFilesLocal: () => mocks.changedFiles,
  decodeUtf8Escapes: (path: string) => path,
}))

describe('getChangedSyncScripts', () => {
  const cwd = process.cwd()
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'sync-scripts-'))
    mkdirSync(join(root, 'syncScripts', 'Netflix'), { recursive: true })
    writeFileSync(join(root, 'syncScripts', 'Netflix', 'metadata.json'), JSON.stringify({ service: 'Netflix', regExp: 'netflix' }))
    process.chdir(root)
  })

  afterEach(() => {
    process.chdir(cwd)
  })

  it('rebuilds a script when one of its files is deleted', async () => {
    mocks.changedFiles = [{ path: 'syncScripts/Netflix/mainworld.ts', deleted: true }]
    const { getChangedSyncScripts } = await import('./getSyncScripts.js')

    const { changed, deleted } = await getChangedSyncScripts()

    expect(changed.map(s => s.metadata.service)).toEqual(['Netflix'])
    expect(deleted).toEqual([])
  })

  it('deletes a script whose folder is gone', async () => {
    mocks.changedFiles = [
      { path: 'syncScripts/Gone/metadata.json', deleted: true },
      { path: 'syncScripts/Gone/content.ts', deleted: true },
    ]
    const { getChangedSyncScripts } = await import('./getSyncScripts.js')

    const { changed, deleted } = await getChangedSyncScripts()

    expect(changed).toEqual([])
    expect(deleted.map(s => s.metadata.service)).toEqual(['Gone'])
  })

  it('ignores files outside a script folder', async () => {
    mocks.changedFiles = [
      { path: 'syncScripts/README.md', deleted: true },
      { path: 'websites/N/Netflix/presence.ts', deleted: false },
    ]
    const { getChangedSyncScripts } = await import('./getSyncScripts.js')

    expect(await getChangedSyncScripts()).toEqual({ changed: [], deleted: [] })
  })
})
