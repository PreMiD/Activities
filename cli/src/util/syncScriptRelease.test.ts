import { Buffer } from 'node:buffer'
import { createPublicKey, verify } from 'node:crypto'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteSyncScript, releaseSyncScript } from './syncScriptRelease.js'
import { computeSyncScriptSha256, generateSigningKeyPair, getSigningMessage } from './syncScriptSigning.js'

vi.mock('node:fs/promises', async importOriginal => ({ ...await importOriginal<typeof import('node:fs/promises')>(), cp: vi.fn() }))
vi.mock('../classes/SyncScriptCompiler.js', () => ({
  SyncScriptCompiler: class {
    compile = async () => true
  },
}))

const target = { apiUrl: 'https://api.test/v6', apiKey: 'key' }
const metadata = { service: 'Netflix', regExp: 'netflix', version: '1.2.0', minExtensionVersion: '2.15.0' }

describe('releaseSyncScript', () => {
  let folder: string
  const fetchMock = vi.fn()

  beforeEach(() => {
    folder = mkdtempSync(join(tmpdir(), 'sync-release-'))
    mkdirSync(join(folder, 'dist'))
    writeFileSync(join(folder, 'dist', 'content.js'), 'content')
    writeFileSync(join(folder, 'dist', 'mainworld.js'), 'mainworld')
    fetchMock.mockReset().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('uploads version and minExtensionVersion, unsigned without a key', async () => {
    vi.stubEnv('SYNC_SCRIPT_SIGNING_KEY', '')

    await expect(releaseSyncScript({ metadata, folder }, target)).resolves.toBe(true)

    const body = JSON.parse(fetchMock.mock.calls[0]![1].body)
    expect(body).toEqual({ service: 'Netflix', contentJs: 'content', mainworldJs: 'mainworld', regExp: 'netflix', version: '1.2.0', minExtensionVersion: '2.15.0' })
  })

  it('signs the uploaded bytes when a key is set', async () => {
    const { privateKey, publicKey } = generateSigningKeyPair()
    vi.stubEnv('SYNC_SCRIPT_SIGNING_KEY', privateKey)

    await releaseSyncScript({ metadata, folder }, target)

    const body = JSON.parse(fetchMock.mock.calls[0]![1].body)
    const message = getSigningMessage({ ...metadata, apiVersion: 1, sha256: computeSyncScriptSha256('content', 'mainworld') })
    const key = createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), Buffer.from(publicKey, 'base64')]), format: 'der', type: 'spki' })
    expect(verify(null, Buffer.from(message, 'utf8'), key, Buffer.from(body.signature, 'base64'))).toBe(true)
  })

  it('returns the reason when the upload fails', async () => {
    fetchMock.mockResolvedValue(new Response('bad', { status: 400, statusText: 'Bad Request' }))

    await expect(releaseSyncScript({ metadata, folder }, target)).resolves.toBe('upload failed: 400 Bad Request, bad')
  })
})

describe('deleteSyncScript', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('deletes by service', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(deleteSyncScript('Disney+', target)).resolves.toBe(true)
    expect(fetchMock.mock.calls[0]![0]).toBe('https://api.test/v6/sync-scripts/v1/Disney%2B')
  })

  it('treats a script that is already gone as deleted', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not found', { status: 404 })))

    await expect(deleteSyncScript('Gone', target)).resolves.toBe(true)
  })

  it('reports other failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 500, statusText: 'Internal Server Error' })))

    await expect(deleteSyncScript('Gone', target)).resolves.toBe('delete failed: 500 Internal Server Error, nope')
  })
})
