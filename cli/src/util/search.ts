import process from 'node:process'
import { search as internalSearch } from '@inquirer/prompts'

function refStdin() {
  if (process.stdin.isTTY) {
    process.stdin.ref()
  }
}

function resumeStdin() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
    process.stdin.resume()
    process.stdin.unref()
  }
}

export function search<T>(...params: Parameters<typeof internalSearch<T>>): ReturnType<typeof internalSearch<T>> {
  refStdin()
  return internalSearch(...params).finally(resumeStdin)
}
