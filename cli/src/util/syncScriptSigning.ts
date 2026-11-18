import { Buffer } from 'node:buffer'
import { createHash, createPrivateKey, generateKeyPairSync, sign } from 'node:crypto'

export const SYNC_SCRIPT_API_VERSION = 1

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/** The hash the API stores and the extension checks the fetched files against. */
export function computeSyncScriptSha256(contentJs: string, mainworldJs?: string): string {
  return sha256Hex(`premid-sync-v1\ncontent:${sha256Hex(contentJs)}\nmainworld:${mainworldJs === undefined ? 'none' : sha256Hex(mainworldJs)}`)
}

export interface SignedFields {
  service: string
  regExp: string
  apiVersion: number
  version?: string
  minExtensionVersion?: string
  sha256: string
}

export function getSigningMessage({ service, regExp, apiVersion, version, minExtensionVersion, sha256 }: SignedFields): string {
  return `premid-sync-sig-v1\n${service}\n${regExp}\n${apiVersion}\n${version ?? ''}\n${minExtensionVersion ?? ''}\n${sha256}`
}

/** Signs with a base64 PKCS8 Ed25519 private key and returns the base64 signature. */
export function signSyncScript(fields: SignedFields, privateKeyBase64: string): string {
  const key = createPrivateKey({ key: Buffer.from(privateKeyBase64, 'base64'), format: 'der', type: 'pkcs8' })
  if (key.asymmetricKeyType !== 'ed25519')
    throw new Error('SYNC_SCRIPT_SIGNING_KEY is not an Ed25519 key')
  return sign(null, Buffer.from(getSigningMessage(fields), 'utf8'), key).toString('base64')
}

/** The private key as base64 PKCS8 DER, the public key as base64 of its raw 32 bytes. */
export function generateSigningKeyPair(): { privateKey: string, publicKey: string } {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519')
  const spki = publicKey.export({ format: 'der', type: 'spki' })
  return {
    privateKey: privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64'),
    publicKey: spki.subarray(spki.length - 32).toString('base64'),
  }
}
