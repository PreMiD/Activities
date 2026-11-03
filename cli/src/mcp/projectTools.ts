import type { Buffer } from 'node:buffer'
import type { ActivityMetadataAndFolder } from '../util/getActivities.js'
import { spawn } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { stripVTControlCharacters } from 'node:util'
import { getActivities } from '../util/getActivities.js'
import { scaffoldActivity } from '../util/scaffoldActivity.js'

const CLI_ENTRY = fileURLToPath(new URL('../../dist/index.js', import.meta.url))
const MAX_OUTPUT_CHARS = 20_000

export interface ToolError {
  error: string
}

export async function findActivity(service: string): Promise<ActivityMetadataAndFolder> {
  const wanted = service.toLowerCase()
  const activity = (await getActivities()).find(({ metadata }) => metadata.service.toLowerCase() === wanted)

  if (!activity)
    throw new Error(`Activity ${service} not found`)

  return activity
}

export function runCli(args: string[]): Promise<{ success: boolean, output: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [CLI_ENTRY, ...args], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let output = ''
    child.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    child.on('error', (error: Error) => {
      resolve({ success: false, output: error.message })
    })
    child.on('close', (code: number | null) => {
      resolve({
        success: code === 0,
        output: stripVTControlCharacters(output).slice(-MAX_OUTPUT_CHARS),
      })
    })
  })
}

export async function listActivities({ query }: { query?: string }): Promise<{ service: string, folder: string, url: string | string[], version: string }[] | ToolError> {
  try {
    const needle = query?.toLowerCase() ?? ''

    return (await getActivities())
      .filter(({ metadata }) => metadata.service.toLowerCase().includes(needle))
      .map(({ metadata, folder }) => ({
        service: metadata.service,
        folder,
        url: metadata.url,
        version: metadata.version,
      }))
  }
  catch (error) {
    return { error: (error as Error).message }
  }
}

export async function createActivity(input: {
  service: string
  url: string
  regExp: string
  category: string
  tags: string[]
  authorId: string
  authorName: string
  description?: string
}): Promise<{ folder: string, files: string[] } | ToolError> {
  try {
    const { authorId, authorName, ...rest } = input
    return await scaffoldActivity({ ...rest, author: { id: authorId, name: authorName } })
  }
  catch (error) {
    return { error: (error as Error).message }
  }
}

export async function buildActivity({ service, validate = true }: { service: string, validate?: boolean }): Promise<{ success: boolean, output: string } | ToolError> {
  try {
    const activity = await findActivity(service)

    return await runCli(['build', activity.metadata.service, '--no-kill', ...(validate ? ['--validate'] : [])])
  }
  catch (error) {
    return { error: (error as Error).message }
  }
}
