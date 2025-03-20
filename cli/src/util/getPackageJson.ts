import { readFile } from 'node:fs/promises'
import { exit } from './log.js'

let packageJson: Record<string, any> | undefined
export async function getPackageJson(): Promise<Record<string, any>> {
  if (packageJson)
    return packageJson

  const localPackageJson = JSON.parse(await readFile('./package.json', 'utf-8').catch(() => {
    exit('This CLI is only available in the activities repository')
  }))

  return packageJson = localPackageJson
}

let cliPackageJson: Record<string, any> | undefined
export async function getCliPackageJson(): Promise<Record<string, any>> {
  if (cliPackageJson)
    return cliPackageJson

  const localCliPackageJson = JSON.parse(await readFile('./cli/package.json', 'utf-8').catch(() => {
    exit('This CLI is only available in the activities repository')
  }))

  return cliPackageJson = localCliPackageJson
}
