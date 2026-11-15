import type { SyncScriptMetadata } from '../classes/SyncScriptCompiler.js'
import type { SyncScriptMetadataAndFolder } from './getSyncScripts.js'
import { basename } from 'node:path'
import semver from 'semver'
import { sanitazeFolderName } from './sanitazeFolderName.js'

// The extension's nested-quantifier rules. Stable (2.14) validates the whole discovery list at once,
// so one entry its rule rejects leaves it with no sync scripts at all.
// They are copied verbatim to match exactly what the extension accepts; input is capped at 1000 characters first.
const NESTED_QUANTIFIER_RULES = [
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  /\([^)]*[+*][^)]*\)[+*]/,
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  /\([^)]*[+*](?:[^)]*[+*?|][^)]*)?\)[+*]/,
]

// The service names the API accepts.
const SERVICE_PATTERN = /^[\w+. -]{1,64}$/

export function validateRegExp(regExp: unknown): string | undefined {
  if (typeof regExp !== 'string' || regExp.length === 0)
    return 'regExp must be a non-empty string'
  if (regExp.length > 1000)
    return 'regExp is longer than 1000 characters'
  if (NESTED_QUANTIFIER_RULES.some(rule => rule.test(regExp)))
    return 'regExp has a group containing + or * that is itself repeated with + or *, which the extension rejects (use {1,63} or ? instead)'
  try {
    // eslint-disable-next-line no-new
    new RegExp(regExp)
  }
  catch (error) {
    return `regExp does not compile: ${(error as Error).message}`
  }
}

export function validateSyncScriptMetadata(metadata: Partial<SyncScriptMetadata>, folder: string): string[] {
  const errors: string[] = []

  // These fields are joined with newlines into the signed message, so a newline inside one would make it ambiguous.
  for (const field of ['service', 'regExp', 'version', 'minExtensionVersion'] as const) {
    const value = metadata[field]
    if (typeof value === 'string' && /[\r\n]/.test(value))
      errors.push(`${field} must not contain a line break`)
  }

  if (typeof metadata.service !== 'string' || !SERVICE_PATTERN.test(metadata.service))
    errors.push('service must be 1 to 64 letters, digits, spaces or + . _ -')
  else if (basename(folder) !== sanitazeFolderName(metadata.service))
    errors.push(`folder name "${basename(folder)}" does not match service "${metadata.service}" (expected "${sanitazeFolderName(metadata.service)}")`)

  const regExpError = validateRegExp(metadata.regExp)
  if (regExpError)
    errors.push(regExpError)

  if (typeof metadata.version !== 'string' || semver.valid(metadata.version) !== metadata.version)
    errors.push('version must be a semver version such as "1.0.0"')

  if (metadata.minExtensionVersion !== undefined && (typeof metadata.minExtensionVersion !== 'string' || semver.valid(metadata.minExtensionVersion) !== metadata.minExtensionVersion))
    errors.push('minExtensionVersion must be a semver version such as "2.15.0" when set')

  return errors
}

/** Returns every problem as "<folder>: <message>". */
export function validateSyncScripts(scripts: SyncScriptMetadataAndFolder[]): string[] {
  const errors: string[] = []
  const foldersByService = new Map<string, string[]>()

  for (const { metadata, folder } of scripts) {
    for (const error of validateSyncScriptMetadata(metadata, folder))
      errors.push(`${basename(folder)}: ${error}`)

    if (typeof metadata.service === 'string') {
      const key = metadata.service.toLowerCase()
      foldersByService.set(key, [...(foldersByService.get(key) ?? []), basename(folder)])
    }
  }

  for (const folders of foldersByService.values()) {
    if (folders.length > 1)
      errors.push(`${folders.join(', ')}: the same service is used by ${folders.length} sync scripts`)
  }

  return errors
}

/**
 * A script whose folder changed must raise its version over the base branch's.
 * A script that is new, or had no valid version at the base, passes.
 */
export function checkVersionBumps(
  scripts: SyncScriptMetadataAndFolder[],
  changedFolders: Set<string>,
  baseMetadata: (folder: string) => Partial<SyncScriptMetadata> | undefined,
): string[] {
  const errors: string[] = []

  for (const { metadata, folder } of scripts) {
    const name = basename(folder)
    if (!changedFolders.has(name))
      continue

    const baseVersion = baseMetadata(name)?.version
    if (typeof baseVersion !== 'string' || !semver.valid(baseVersion) || typeof metadata.version !== 'string' || !semver.valid(metadata.version))
      continue

    if (!semver.gt(metadata.version, baseVersion))
      errors.push(`${name}: the script changed, so version must be raised above ${baseVersion} (it is ${metadata.version})`)
  }

  return errors
}
