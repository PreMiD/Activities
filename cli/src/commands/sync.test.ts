import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  scripts: [] as { metadata: any, folder: string }[],
  deleted: [] as { metadata: { service: string } }[],
  release: vi.fn(),
  delete: vi.fn(),
  errors: [] as string[],
}))

vi.mock('../util/getSyncScripts.js', () => ({
  getSyncScripts: async () => mocks.scripts,
  getChangedSyncScripts: async () => ({ changed: mocks.scripts, deleted: mocks.deleted }),
  getSingleSyncScript: async () => mocks.scripts[0],
}))
vi.mock('../util/syncScriptRelease.js', () => ({
  releaseSyncScript: mocks.release,
  deleteSyncScript: mocks.delete,
}))
vi.mock('../util/log.js', () => ({
  prefix: 'pmd',
  info: () => {},
  success: () => {},
  error: (message: string) => mocks.errors.push(message),
  exit: (message: string) => {
    throw new Error(`exit: ${message}`)
  },
}))

function script(service: string) {
  return {
    metadata: { service, regExp: `^https?[:][/][/]${service.toLowerCase()}[.]com[/]`, version: '1.0.0' },
    folder: `/repo/syncScripts/${service}`,
  }
}

describe('syncRelease', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_API_KEY', 'key')
    mocks.errors = []
    mocks.deleted = []
    mocks.release.mockReset()
    mocks.delete.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('releases every script even when one fails, then fails with all failures', async () => {
    mocks.scripts = [script('Alpha'), script('Beta'), script('Gamma')]
    mocks.release.mockImplementation(async ({ metadata }) => metadata.service === 'Alpha' ? 'build failed' : true)
    const { syncRelease } = await import('./sync.js')

    await expect(syncRelease(undefined, { all: true })).rejects.toThrow('exit: 1 sync scripts failed to release')

    expect(mocks.release.mock.calls.map(([s]) => s.metadata.service)).toEqual(['Alpha', 'Beta', 'Gamma'])
    expect(mocks.errors).toContain('Alpha: build failed')
  })

  it('does not upload a script with invalid metadata', async () => {
    mocks.scripts = [script('Alpha'), { ...script('Beta'), metadata: { ...script('Beta').metadata, version: 'one' } }]
    mocks.release.mockResolvedValue(true)
    const { syncRelease } = await import('./sync.js')

    await expect(syncRelease(undefined, { all: true })).rejects.toThrow('exit: 1 sync scripts failed')

    expect(mocks.release.mock.calls.map(([s]) => s.metadata.service)).toEqual(['Alpha'])
  })

  it('deletes removed scripts and uploads changed ones', async () => {
    mocks.scripts = [script('Alpha')]
    mocks.deleted = [{ metadata: { service: 'Old' } }]
    mocks.release.mockResolvedValue(true)
    mocks.delete.mockResolvedValue(true)
    const { syncRelease } = await import('./sync.js')

    await syncRelease(undefined, { changed: true })

    expect(mocks.delete).toHaveBeenCalledWith('Old', expect.anything())
    expect(mocks.release).toHaveBeenCalledTimes(1)
  })
})
