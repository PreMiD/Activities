import { describe, expect, it } from 'vitest'
import { checkVersionBumps, validateRegExp, validateSyncScripts } from './validateSyncScripts.js'

function script(folder: string, metadata: Record<string, unknown>) {
  return { folder: `/repo/syncScripts/${folder}`, metadata: metadata as any }
}

const valid = { service: 'Netflix', regExp: '^https?[:][/][/]([a-z0-9-]{1,63}[.])?netflix[.]com[/]', version: '1.0.0' }

describe('validateRegExp', () => {
  it('accepts the shipped patterns', () => {
    expect(validateRegExp(valid.regExp)).toBeUndefined()
    expect(validateRegExp('^https?[:][/][/](www|m|music)[.]youtube[.]com[/](?!shorts[/])')).toBeUndefined()
  })

  it('rejects the subdomain pattern the stable extension treats as a nested quantifier', () => {
    expect(validateRegExp('^https?[:][/][/]([a-z0-9-]+[.])*netflix[.]com[/]')).toMatch(/rejects/)
  })

  it('rejects nested quantifiers', () => {
    expect(validateRegExp('(a+)+')).toMatch(/rejects/)
    expect(validateRegExp('(.*)*')).toMatch(/rejects/)
  })

  it('rejects patterns that are too long or do not compile', () => {
    expect(validateRegExp(`^${'a'.repeat(1000)}`)).toMatch(/1000/)
    expect(validateRegExp('(')).toMatch(/compile/)
    expect(validateRegExp('')).toMatch(/non-empty/)
    expect(validateRegExp(undefined)).toMatch(/non-empty/)
  })
})

describe('validateSyncScripts', () => {
  it('accepts valid scripts', () => {
    expect(validateSyncScripts([script('Netflix', valid), script('Disney+', { ...valid, service: 'Disney+', minExtensionVersion: '2.15.0' })])).toEqual([])
  })

  it('requires the folder name to match the service', () => {
    expect(validateSyncScripts([script('Netflix2', valid)])).toEqual([
      'Netflix2: folder name "Netflix2" does not match service "Netflix" (expected "Netflix")',
    ])
  })

  it('rejects duplicate services', () => {
    expect(validateSyncScripts([script('Netflix', valid), script('netflix', { ...valid, service: 'netflix' })])).toEqual([
      'Netflix, netflix: the same service is used by 2 sync scripts',
    ])
  })

  it('requires semver versions', () => {
    expect(validateSyncScripts([script('Netflix', { ...valid, version: undefined })])[0]).toMatch(/version must be a semver/)
    expect(validateSyncScripts([script('Netflix', { ...valid, version: '1.0' })])[0]).toMatch(/version must be a semver/)
    expect(validateSyncScripts([script('Netflix', { ...valid, minExtensionVersion: 'soon' })])[0]).toMatch(/minExtensionVersion/)
  })

  it('rejects line breaks in signed fields', () => {
    expect(validateSyncScripts([script('Netflix', { ...valid, regExp: `${valid.regExp}\n` })])).toContain('Netflix: regExp must not contain a line break')
    expect(validateSyncScripts([script('Netflix', { ...valid, version: '1.0.0\r' })])).toContain('Netflix: version must not contain a line break')
    expect(validateSyncScripts([script('Netflix', { ...valid, minExtensionVersion: '2.15.0\n' })])).toContain('Netflix: minExtensionVersion must not contain a line break')
  })
})

describe('checkVersionBumps', () => {
  const base = (versions: Record<string, string>) => (folder: string) => versions[folder] ? { version: versions[folder] } : undefined

  it('requires a changed script to raise its version', () => {
    expect(checkVersionBumps([script('Netflix', valid)], new Set(['Netflix']), base({ Netflix: '1.0.0' }))).toEqual([
      'Netflix: the script changed, so version must be raised above 1.0.0 (it is 1.0.0)',
    ])
    expect(checkVersionBumps([script('Netflix', { ...valid, version: '0.9.0' })], new Set(['Netflix']), base({ Netflix: '1.0.0' }))).toHaveLength(1)
  })

  it('passes raised versions, unchanged scripts and scripts without a base version', () => {
    expect(checkVersionBumps([script('Netflix', { ...valid, version: '1.0.1' })], new Set(['Netflix']), base({ Netflix: '1.0.0' }))).toEqual([])
    expect(checkVersionBumps([script('Netflix', valid)], new Set(), base({ Netflix: '1.0.0' }))).toEqual([])
    expect(checkVersionBumps([script('Netflix', valid)], new Set(['Netflix']), base({}))).toEqual([])
  })
})
