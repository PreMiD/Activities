import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { globby } from 'globby'
import { getFolderLetter } from '../util/getFolderLetter.js'
import { getSchema } from '../util/getSchema.js'
import { exit, prefix, success } from '../util/log.js'
import { sanitazeFolderName } from '../util/sanitazeFolderName.js'

export async function versionizeActivity(activity: string) {
  if (!activity) {
    exit('Activity name is required')
  }

  const folderLetter = getFolderLetter(activity)
  const sanitazedActivity = sanitazeFolderName(activity)
  const path = resolve(process.cwd(), 'websites', folderLetter, sanitazedActivity)
  const schema = await getSchema()
  const apiVersions = getApiVersions(schema)

  if (!existsSync(path)) {
    exit(`Activity ${activity} not found`)
  }

  const versionized = await globby(`${path}/v*/metadata.json`).then(v => v.sort())
  if (versionized.length > 0) {
    const lastVersion = versionized[versionized.length - 1]
    const metadata = JSON.parse(await readFile(lastVersion, 'utf-8'))
    const { apiVersion } = metadata

    if (apiVersion === apiVersions[apiVersions.length - 1]) {
      exit('Activity is already at the latest API version')
    }

    const newVersion = apiVersions[apiVersions.indexOf(apiVersion) + 1]
    const newPath = resolve(path, `v${newVersion}`)
    await mkdir(newPath, { recursive: true })
    metadata.apiVersion = newVersion
    await writeFile(resolve(newPath, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
    await cp(resolve(fileURLToPath(import.meta.url), '../../../templates/tsconfig.versionized.json'), resolve(newPath, 'tsconfig.json'))
    await cp(resolve(fileURLToPath(import.meta.url), `../../../templates/presence.min.ts`), resolve(newPath, 'presence.ts'))

    success(
      `Activity versioned successfully! ${chalk.grey(chalk.underline(resolve(newPath, 'metadata.json')))}\n${prefix} ${chalk.white('Please edit the metadata.json file and update any necessary information.')}\n${prefix} ${chalk.white(`After that, run ${chalk.cyan(`pmd dev "${activity}"`)} to start developing the activity.`)}`,
    )
  }

  const metadata = JSON.parse(await readFile(resolve(path, 'metadata.json'), 'utf-8'))
  const { apiVersion } = metadata
  const newVersion = apiVersions[apiVersions.indexOf(apiVersion) + 1]

  if (apiVersion === apiVersions[apiVersions.length - 1]) {
    exit('Activity is already at the latest API version')
  }

  // Move the current version into a versioned folder
  const files = await globby(`${path}/**/*`)
  await mkdir(resolve(path, `v${apiVersion}`), { recursive: true })
  const directoriesToDelete = new Set<string>()
  for (const file of files) {
    const newPath = resolve(path, `v${apiVersion}`)
    const newFilePath = file.replace(path, newPath)
    const directory = dirname(newFilePath)
    if (directory !== newPath) {
      await mkdir(directory, { recursive: true })
      directoriesToDelete.add(dirname(file))
    }
    await rename(file, newFilePath)
  }

  await Promise.all(Array.from(directoriesToDelete).map(directory => rm(directory, { recursive: true })))
  // Overwrite the tsconfig.json file with the versionized one
  await writeFile(
    resolve(path, `v${apiVersion}`, 'tsconfig.json'),
    await readFile(resolve(fileURLToPath(import.meta.url), '../../../templates/tsconfig.versionized.json'), 'utf-8'),
  )

  // Create the new version folder
  const newPath = resolve(path, `v${newVersion}`)
  await mkdir(newPath, { recursive: true })
  metadata.apiVersion = newVersion
  await writeFile(resolve(newPath, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`)
  await cp(resolve(fileURLToPath(import.meta.url), '../../../templates/tsconfig.versionized.json'), resolve(newPath, 'tsconfig.json'))
  await cp(resolve(fileURLToPath(import.meta.url), `../../../templates/presence.min.ts`), resolve(newPath, 'presence.ts'))

  success(
    `Activity versioned successfully! ${chalk.grey(chalk.underline(resolve(newPath, 'metadata.json')))}\n${prefix} ${chalk.white('Please edit the metadata.json file and update any necessary information.')}\n${prefix} ${chalk.white(`After that, run ${chalk.cyan(`pmd dev "${activity}"`)} to start developing the activity.`)}`,
  )
}

function getApiVersions(schema: any): number[] {
  const min = schema.properties.apiVersion.minimum
  const max = schema.properties.apiVersion.maximum

  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}
