import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import AdmZip from 'adm-zip'

export async function zipDir(dir: string, filename: string) {
  const zip = new AdmZip()
  const zipPathInDir = resolve(dir, filename)

  //* Read all files in the directory and add them to the zip
  const files = await readdir(dir, { recursive: true })

  for (const file of files) {
    const filePath = join(dir, file)
    zip.addLocalFile(filePath)
  }

  zip.writeZip(zipPathInDir)
}
