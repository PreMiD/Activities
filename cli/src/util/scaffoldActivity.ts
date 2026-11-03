import { existsSync } from 'node:fs'
import { cp, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Validator } from 'jsonschema'
import { getDmcaServices, isDmcaBlocked } from './dmca.js'
import { getFolderLetter } from './getFolderLetter.js'
import { getSchema } from './getSchema.js'
import { isFirstTimeAuthor } from './isFirstTimeAuthor.js'
import { sanitazeFolderName } from './sanitazeFolderName.js'

export interface ScaffoldActivityInput {
  service: string
  url: string
  regExp: string
  category: string
  tags: string[]
  author: { id: string, name: string }
  description?: string
}

/**
 * Creates the folder, metadata.json, tsconfig.json and presence.ts of a new activity.
 * Throws instead of exiting so callers (such as the MCP server) survive bad input.
 */
export async function scaffoldActivity(
  input: ScaffoldActivityInput,
  cwd = process.cwd(),
): Promise<{ folder: string, files: string[] }> {
  const { service, url, regExp, category, tags, author, description } = input

  if (isDmcaBlocked(service, await getDmcaServices())) {
    throw new Error(`Activity "${service}" is on the DMCA blocklist and cannot be created`)
  }

  const folder = resolve(cwd, 'websites', getFolderLetter(service), sanitazeFolderName(service))
  if (existsSync(folder)) {
    throw new Error(`Activity ${service} already exists`)
  }

  const schema = await getSchema()
  const validator = new Validator()
  validator.addSchema({ definitions: schema.definitions })

  // Check before writing metadata.json, otherwise the new file always matches its own author.
  const firstTimeAuthor = await isFirstTimeAuthor(author.id, cwd)

  const metadata = {
    $schema: 'https://schemas.premid.app/metadata/1.17',
    apiVersion: 1,
    author,
    service,
    description: {
      en: description ?? 'TODO',
    },
    url,
    regExp,
    version: '1.0.0',
    logo: 'https://i.imgur.com/000000.png',
    thumbnail: 'https://i.imgur.com/000000.png',
    color: '#000000',
    category,
    tags,
  }

  const result = validator.validate(metadata, schema)
  if (!result.valid) {
    throw new Error(result.toString())
  }

  const templates = resolve(fileURLToPath(import.meta.url), '../../../templates')
  const files = [
    resolve(folder, 'metadata.json'),
    resolve(folder, 'tsconfig.json'),
    resolve(folder, 'presence.ts'),
  ]

  await mkdir(folder, { recursive: true })
  await writeFile(files[0], `${JSON.stringify(metadata, null, 2)}\n`)
  await cp(resolve(templates, 'tsconfig.json'), files[1])
  await cp(resolve(templates, `presence${firstTimeAuthor ? '' : '.min'}.ts`), files[2])

  return { folder, files }
}
