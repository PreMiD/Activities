import type { ToolError } from './projectTools.js'
import { readFileSync } from 'node:fs'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { buildActivity, createActivity, listActivities } from './projectTools.js'

const cliPackageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'))

function toToolResult(result: unknown) {
  if (typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string') {
    return { isError: true, content: [{ type: 'text' as const, text: (result as ToolError).error }] }
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
}

export function createServer(): McpServer {
  const server = new McpServer({ name: 'premid-activities', version: cliPackageJson.version })

  server.registerTool(
    'list_activities',
    {
      description: 'List the activities in this repository (service, folder, url, version). Use it to check whether an activity already exists or to find the exact service name for build_activity. Optional query is a case-insensitive substring match on the service name.',
      inputSchema: {
        query: z.string().optional().describe('Case-insensitive substring of the service name'),
      },
    },
    async args => toToolResult(await listActivities(args)),
  )

  server.registerTool(
    'create_activity',
    {
      description: 'Scaffold a new activity folder with metadata.json, tsconfig.json and presence.ts. Call this first when building a new activity, then edit presence.ts in the returned folder. The regExp must match the service URLs and use the format used by existing activities, e.g. ^https?[:][/][/]([a-z0-9-]+[.])*example[.]com[/]. The category must be one of the schema categories.',
      inputSchema: {
        service: z.string().describe('Name of the service, e.g. "YouTube"'),
        url: z.string().describe('Main domain of the service, e.g. "youtube.com"'),
        regExp: z.string().describe('Regular expression matching the service URLs, e.g. ^https?[:][/][/]([a-z0-9-]+[.])*example[.]com[/]'),
        category: z.string().describe('Category of the service from the metadata schema, e.g. "video"'),
        tags: z.array(z.string()).describe('Tags of the presence'),
        authorId: z.string().describe('Discord ID of the author'),
        authorName: z.string().describe('Discord username of the author'),
        description: z.string().optional().describe('English description of the activity'),
      },
    },
    async args => toToolResult(await createActivity(args)),
  )

  server.registerTool(
    'build_activity',
    {
      description: 'Build an existing activity (run `pmd build`) and return the build output. Use it after editing presence.ts to check that the activity compiles. validate (default true) also runs the metadata and asset checks. Fails with "Activity <service> not found" for unknown services. Check that pmd dev or pmd test is not already running, because it uses the same port.',
      inputSchema: {
        service: z.string().describe('Name of the service, e.g. "YouTube"'),
        validate: z.boolean().optional().default(true).describe('Run the metadata and asset validation (default true)'),
      },
    },
    async args => toToolResult(await buildActivity(args)),
  )

  return server
}
