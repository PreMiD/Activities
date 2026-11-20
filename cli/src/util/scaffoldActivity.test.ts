import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSchema: vi.fn(),
  getDmcaServices: vi.fn(),
  isFirstTimeAuthor: vi.fn(),
}))

vi.mock('./getSchema.js', () => ({ getSchema: mocks.getSchema }))
vi.mock('./isFirstTimeAuthor.js', () => ({ isFirstTimeAuthor: mocks.isFirstTimeAuthor }))
vi.mock('./dmca.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./dmca.js')>()
  return { ...actual, getDmcaServices: mocks.getDmcaServices }
})

const { scaffoldActivity } = await import('./scaffoldActivity.js')

const input = {
  service: 'Example Service',
  url: 'example.com',
  regExp: '^https?[:][/][/]([a-z0-9-]+[.])*example[.]com[/]',
  category: 'video',
  tags: ['video', 'streaming'],
  author: { id: '123', name: 'tester' },
}

describe('scaffoldActivity', () => {
  let cwd: string

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), 'pmd-scaffold-'))
    mocks.getSchema.mockResolvedValue({ definitions: {}, properties: {} })
    mocks.getDmcaServices.mockResolvedValue(new Set())
    mocks.isFirstTimeAuthor.mockResolvedValue(true)
  })

  afterEach(async () => {
    vi.clearAllMocks()
    await rm(cwd, { recursive: true, force: true })
  })

  it('scaffoldActivity writes metadata, tsconfig and presence.ts', async () => {
    const { folder, files } = await scaffoldActivity(input, cwd)

    expect(folder).toBe(join(cwd, 'websites', 'E', 'Example Service'))
    expect(files).toEqual([
      join(folder, 'metadata.json'),
      join(folder, 'tsconfig.json'),
      join(folder, 'presence.ts'),
    ])

    const metadata = JSON.parse(await readFile(join(folder, 'metadata.json'), 'utf-8'))
    expect(metadata.url).toBe('example.com')
    expect(metadata.regExp).toBe(input.regExp)
    expect(metadata.tags).toEqual(['video', 'streaming'])
    expect(metadata.description).toEqual({ en: 'TODO' })

    expect(await readFile(join(folder, 'tsconfig.json'), 'utf-8')).not.toBe('')
    expect(await readFile(join(folder, 'presence.ts'), 'utf-8')).not.toBe('')
  })

  it('scaffoldActivity picks the presence template by author status', async () => {
    const templates = fileURLToPath(new URL('../../templates', import.meta.url))
    const full = await readFile(join(templates, 'presence.ts'), 'utf-8')
    const min = await readFile(join(templates, 'presence.min.ts'), 'utf-8')

    mocks.isFirstTimeAuthor.mockResolvedValue(true)
    const first = await scaffoldActivity(input, cwd)
    expect(mocks.isFirstTimeAuthor).toHaveBeenLastCalledWith('123', cwd)
    expect(await readFile(join(first.folder, 'presence.ts'), 'utf-8')).toBe(full)

    mocks.isFirstTimeAuthor.mockResolvedValue(false)
    const known = await scaffoldActivity({ ...input, service: 'Other Service' }, cwd)
    expect(await readFile(join(known.folder, 'presence.ts'), 'utf-8')).toBe(min)
  })

  it('scaffoldActivity rejects an existing activity', async () => {
    await scaffoldActivity(input, cwd)

    await expect(scaffoldActivity(input, cwd)).rejects.toThrow('Activity Example Service already exists')
  })

  it('scaffoldActivity rejects DMCA-blocked services', async () => {
    mocks.getDmcaServices.mockResolvedValue(new Set(['example service']))

    await expect(scaffoldActivity(input, cwd)).rejects.toThrow('Activity "Example Service" is on the DMCA blocklist and cannot be created')
  })

  it('scaffoldActivity rejects metadata that fails the schema', async () => {
    mocks.getSchema.mockResolvedValue({ definitions: {}, type: 'object', required: ['missingField'] })

    await expect(scaffoldActivity(input, cwd)).rejects.toThrow(/missingField/)
  })
})
