import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  context: { eventName: '', payload: {} as Record<string, any>, repo: { owner: 'PreMiD', repo: 'Activities' } },
}))

vi.mock('is-ci', () => ({ default: true }))
vi.mock('@actions/github', () => ({ context: mocks.context }))

const { getBaseSha, getChangedFilesCi } = await import('./getChangedFiles.js')

describe('getBaseSha', () => {
  it('uses the pull request base', () => {
    Object.assign(mocks.context, { eventName: 'pull_request', payload: { pull_request: { base: { sha: 'base' } } } })
    expect(getBaseSha()).toBe('base')
  })

  it('uses the merge group base', () => {
    Object.assign(mocks.context, { eventName: 'merge_group', payload: { merge_group: { base_sha: 'group' } } })
    expect(getBaseSha()).toBe('group')
  })

  it('uses the commit before a push', () => {
    Object.assign(mocks.context, { eventName: 'push', payload: { before: 'before' } })
    expect(getBaseSha()).toBe('before')
  })

  it('has no base for the first push of a branch', () => {
    Object.assign(mocks.context, { eventName: 'push', payload: { before: '0000000000000000000000000000000000000000' } })
    expect(getBaseSha()).toBeUndefined()
  })

  it('has no base for a manual run', () => {
    Object.assign(mocks.context, { eventName: 'workflow_dispatch', payload: {} })
    expect(getBaseSha()).toBeUndefined()
  })
})

describe('getChangedFilesCi', () => {
  beforeEach(() => {
    vi.stubEnv('GITHUB_TOKEN', 'token')
    Object.assign(mocks.context, { eventName: 'push', payload: { before: 'before', after: 'after' } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('lists the files a push changed and deleted', async () => {
    const diff = [
      'diff --git a/syncScripts/Netflix/content.ts b/syncScripts/Netflix/content.ts',
      'index 1111111..2222222 100644',
      '--- a/syncScripts/Netflix/content.ts',
      '+++ b/syncScripts/Netflix/content.ts',
      '@@ -1 +1 @@',
      '-a',
      '+b',
      'diff --git a/syncScripts/Old/metadata.json b/syncScripts/Old/metadata.json',
      'deleted file mode 100644',
      'index 3333333..0000000',
      '--- a/syncScripts/Old/metadata.json',
      '+++ /dev/null',
      '@@ -1 +0,0 @@',
      '-{}',
      '',
    ].join('\n')
    const fetchMock = vi.fn().mockResolvedValue(new Response(diff, { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getChangedFilesCi()).resolves.toEqual([
      { path: 'syncScripts/Netflix/content.ts', deleted: false },
      { path: 'syncScripts/Old/metadata.json', deleted: true },
    ])
    expect(fetchMock.mock.calls[0]![0]).toBe('https://github.com/PreMiD/Activities/compare/before...after.diff')
  })

  it('fails instead of releasing nothing when the diff cannot be fetched', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('error', { status: 500, statusText: 'Internal Server Error' })))
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit')
    }) as never)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(getChangedFilesCi()).rejects.toThrow('exit')
    expect(exit).toHaveBeenCalledWith(1)
  })
})
