import process from 'node:process'
import { search as internalSearch } from '@inquirer/prompts'

function resumeStdin() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
    process.stdin.resume()
  }
}

export function search<T>(...params: Parameters<typeof internalSearch<T>>): ReturnType<typeof internalSearch<T>> {
  return internalSearch(...params).finally(resumeStdin)
}
