import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  getDmcaServices: vi.fn(),
  isDmcaBlocked: vi.fn(),
  addSarifLog: vi.fn(),
  getJsonPosition: vi.fn().mockResolvedValue({ line: 1, column: 1 }),
  error: vi.fn(),
  exit: vi.fn(),
}))

vi.mock('node:fs/promises', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...original,
    readFile: mocks.readFile,
    cp: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue([]),
  }
})

vi.mock('../util/dmca.js', () => ({
  getDmcaServices: mocks.getDmcaServices,
  isDmcaBlocked: mocks.isDmcaBlocked,
}))

vi.mock('../util/sarif.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../util/sarif.js')>()
  return {
    ...original,
    addSarifLog: mocks.addSarifLog,
  }
})

vi.mock('../util/getJsonPosition.js', () => ({
  getJsonPosition: mocks.getJsonPosition,
}))

vi.mock('../util/log.js', () => ({
  error: mocks.error,
  exit: mocks.exit,
  prefix: '[pmd]',
}))

//* Mock remaining dependencies to prevent actual execution
vi.mock('../util/getActivities.js', () => ({
  getChangedActivities: vi.fn().mockResolvedValue({ changed: [], deleted: [] }),
}))

vi.mock('./AssetsManager.js', () => ({
  AssetsManager: class {
    getClientIds = vi.fn().mockResolvedValue(['123'])
    validateClientId = vi.fn().mockResolvedValue(true)
    getAssets = vi.fn().mockResolvedValue([])
    validateImage = vi.fn().mockResolvedValue(true)
  },
}))

vi.mock('./DependenciesManager.js', () => ({
  DependenciesManager: class {
    installDependencies = vi.fn()
  },
}))

vi.mock('./TypescriptCompiler.js', () => ({
  TypescriptCompiler: class {
    typecheck = vi.fn().mockResolvedValue(true)
  },
}))

vi.mock('./WebSocketServer.js', () => ({
  WebSocketServer: vi.fn(),
}))

vi.mock('../util/dnsValidator.js', () => ({
  checkDomainDns: vi.fn().mockResolvedValue({ valid: true }),
  isValidDomain: vi.fn().mockReturnValue(true),
  sanitizeDomain: vi.fn((url: string) => url),
}))

vi.mock('../util/sanitazeFolderName.js', () => ({
  sanitazeFolderName: vi.fn((name: string) => name),
}))

vi.mock('esbuild', () => ({
  build: vi.fn().mockResolvedValue({}),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(false),
}))

const mockMetadata = {
  service: 'HiAnime',
  apiVersion: 1,
  version: '1.0.0',
  logo: 'https://example.com/logo.png',
  thumbnail: 'https://example.com/thumbnail.png',
  url: 'hianime.to',
  description: { en: 'Test' },
  tags: ['anime'],
}

describe('activityCompiler DMCA check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.readFile.mockResolvedValue(JSON.stringify(mockMetadata))
    //* Mock global fetch for libraryVersion and locales checks
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/locales')) {
        return Promise.resolve({ json: () => Promise.resolve(['en']) })
      }
      return Promise.resolve({ json: () => Promise.resolve(null) })
    }))
  })

  it('should return false and add SARIF log for a DMCA\'d service', async () => {
    mocks.getDmcaServices.mockResolvedValue(new Set(['hianime']))
    mocks.isDmcaBlocked.mockReturnValue(true)

    const { ActivityCompiler } = await import('./ActivityCompiler.js')
    const compiler = new ActivityCompiler('/test/HiAnime', mockMetadata, false)

    //* Access private method via compile with validate: true
    const result = await compiler.compile({ kill: false, validate: true, preCheck: false, zip: false })

    expect(result).toBe(false)
    expect(mocks.isDmcaBlocked).toHaveBeenCalledWith('HiAnime', expect.any(Set))
    expect(mocks.addSarifLog).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('DMCA blocklist'),
        ruleId: 'dmca-check',
      }),
    )
  })

  it('should not block a non-DMCA\'d service', async () => {
    mocks.getDmcaServices.mockResolvedValue(new Set(['hianime']))
    mocks.isDmcaBlocked.mockReturnValue(false)

    const safeMetadata = { ...mockMetadata, service: 'YouTube' }
    mocks.readFile.mockResolvedValue(JSON.stringify(safeMetadata))

    const { ActivityCompiler } = await import('./ActivityCompiler.js')
    const compiler = new ActivityCompiler('/test/YouTube', safeMetadata, false)

    await compiler.compile({ kill: false, validate: true, preCheck: false, zip: false })

    //* Should not have been blocked by DMCA check (may fail for other reasons in test env)
    expect(mocks.isDmcaBlocked).toHaveBeenCalledWith('YouTube', expect.any(Set))
    expect(mocks.addSarifLog).not.toHaveBeenCalledWith(
      expect.objectContaining({
        ruleId: 'dmca-check',
      }),
    )
  })
})
