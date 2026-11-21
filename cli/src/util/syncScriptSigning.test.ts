import { Buffer } from 'node:buffer'
import { createHash, createPublicKey, verify } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { computeSyncScriptSha256, generateSigningKeyPair, getSigningMessage, signSyncScript } from './syncScriptSigning.js'

const hex = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex')

describe('computeSyncScriptSha256', () => {
  it('hashes the per-file hashes with the none marker for a missing mainworld', () => {
    expect(computeSyncScriptSha256('a')).toBe(hex(`premid-sync-v1\ncontent:${hex('a')}\nmainworld:none`))
    expect(computeSyncScriptSha256('a', 'b')).toBe(hex(`premid-sync-v1\ncontent:${hex('a')}\nmainworld:${hex('b')}`))
  })

  it('hashes an empty mainworld instead of treating it as missing', () => {
    expect(computeSyncScriptSha256('a', '')).toBe(hex(`premid-sync-v1\ncontent:${hex('a')}\nmainworld:${hex('')}`))
    expect(computeSyncScriptSha256('a', '')).not.toBe(computeSyncScriptSha256('a'))
  })
})

describe('signSyncScript', () => {
  const fields = { service: 'Netflix', regExp: '^https?[:][/][/]netflix[.]com[/]', apiVersion: 1, version: '1.0.0', sha256: 'ab'.repeat(32) }

  it('builds the signed message with empty optional fields', () => {
    expect(getSigningMessage(fields)).toBe(`premid-sync-sig-v1\nNetflix\n${fields.regExp}\n1\n1.0.0\n\n${fields.sha256}`)
  })

  it('produces a signature the raw public key verifies', () => {
    const { privateKey, publicKey } = generateSigningKeyPair()
    expect(Buffer.from(publicKey, 'base64')).toHaveLength(32)

    const signature = signSyncScript(fields, privateKey)

    const spki = Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), Buffer.from(publicKey, 'base64')])
    const key = createPublicKey({ key: spki, format: 'der', type: 'spki' })
    const message = Buffer.from(getSigningMessage(fields), 'utf8')
    expect(verify(null, message, key, Buffer.from(signature, 'base64'))).toBe(true)
    expect(verify(null, Buffer.from(getSigningMessage({ ...fields, version: '1.0.1' }), 'utf8'), key, Buffer.from(signature, 'base64'))).toBe(false)
  })

  it('rejects a key that is not Ed25519 PKCS8', () => {
    expect(() => signSyncScript(fields, Buffer.from('nope').toString('base64'))).toThrow()
  })
})
