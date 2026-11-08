import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { globby } from 'globby'

export async function isFirstTimeAuthor(author: string, cwd = process.cwd()) {
  for (const m of await globby(['websites/*/*/metadata.json', 'websites/*/*/v*/metadata.json'], { cwd, absolute: true })) {
    const {
      author: { id },
    } = JSON.parse(await readFile(m, 'utf-8'))

    if (author !== id)
      continue

    return false
  }

  return true
}
