import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

let cache: Set<string> | null = null

export async function getDmcaServices(): Promise<Set<string>> {
  if (cache) {
    return cache
  }

  try {
    const dmcaPath = resolve(process.cwd(), 'dmca.json')
    const dmcaFile = JSON.parse(await readFile(dmcaPath, 'utf-8'))
    cache = new Set<string>((dmcaFile.services as string[]).map(s => s.toLowerCase()))
  }
  catch {
    cache = new Set<string>()
  }

  return cache
}

export function isDmcaBlocked(service: string, dmcaServices: Set<string>): boolean {
  return dmcaServices.has(service.toLowerCase())
}
