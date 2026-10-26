import type { ToolError } from './projectTools.js'
import { readFileSync } from 'node:fs'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { closePage, evaluate, extensionStatus, getActivity, loadActivity, navigate, openPage, runTests } from './browserTools.js'
import { buildActivity, createActivity, listActivities } from './projectTools.js'

const cliPackageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf-8'))

// Only the handler-error shape, { error } alone, is a tool failure. Results that carry an error field
// as data, like get_activity's { kind, activity, error }, are normal results.
export function toToolResult(result: unknown) {
  const isHandlerError = typeof result === 'object' && result !== null
    && Object.keys(result).length === 1 && 'error' in result && typeof result.error === 'string'
  if (isHandlerError) {
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

  server.registerTool(
    'extension_status',
    {
      description: 'Check whether the PreMiD dev extension is connected to pmd on port 3021, and whether it supports activity tests. Call it before the browser tools. If pmd dev or pmd test is already running, it returns the port 3021 error.',
      inputSchema: {},
    },
    async () => toToolResult(await extensionStatus()),
  )

  server.registerTool(
    'load_activity',
    {
      description: 'Build an activity and send it to the connected extension. Call it before open_page or run_tests. Only one activity is loaded at a time; loading another replaces it.',
      inputSchema: {
        service: z.string().describe('Name of the service, e.g. "YouTube"'),
      },
    },
    async args => toToolResult(await loadActivity(args)),
  )

  server.registerTool(
    'open_page',
    {
      description: 'Open a browser tab at url with the loaded activity running. Returns the tabId for navigate, evaluate, get_activity and close_page. The service must be the one loaded with load_activity.',
      inputSchema: {
        service: z.string().describe('Name of the loaded service'),
        url: z.string().describe('URL to open, e.g. "https://www.youtube.com/watch?v=abc"'),
        settings: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().describe('Activity settings to apply for this tab'),
      },
    },
    async args => toToolResult(await openPage(args)),
  )

  server.registerTool(
    'navigate',
    {
      description: 'Navigate an open tab to another URL.',
      inputSchema: {
        tabId: z.number().describe('Tab id returned by open_page'),
        url: z.string().describe('URL to navigate to'),
      },
    },
    async args => toToolResult(await navigate(args)),
  )

  server.registerTool(
    'evaluate',
    {
      description: 'Run a function in the page of an open tab and return its result. code is the function source, e.g. "() => document.title". It runs with no arguments.',
      inputSchema: {
        tabId: z.number().describe('Tab id returned by open_page'),
        code: z.string().describe('Function source, e.g. "() => document.title"'),
      },
    },
    async args => toToolResult(await evaluate(args)),
  )

  server.registerTool(
    'get_activity',
    {
      description: 'Read the presence the activity set in an open tab. Returns the latest buffered update and clears it, or waits up to timeoutMs for the next one. kind is setActivity, clearActivity, invalid, error or none (timed out). Call it after an action, such as navigate or a page change, to see what the activity shows.',
      inputSchema: {
        tabId: z.number().describe('Tab id returned by open_page'),
        timeoutMs: z.number().optional().default(5000).describe('How long to wait for an update when none is buffered (default 5000)'),
      },
    },
    async args => toToolResult(await getActivity(args)),
  )

  server.registerTool(
    'close_page',
    {
      description: 'Close an open tab.',
      inputSchema: {
        tabId: z.number().describe('Tab id returned by open_page'),
      },
    },
    async args => toToolResult(await closePage(args)),
  )

  server.registerTool(
    'run_tests',
    {
      description: 'Build an activity and run its *.test.ts files in the connected extension. Returns the TestResult list (file, name, status, durationMs, error, lastActivity). Fails with "No tests found" when the activity has no tests. Tests can pause to ask the user, so they may take a while.',
      inputSchema: {
        service: z.string().describe('Name of the service, e.g. "YouTube"'),
      },
    },
    async args => toToolResult(await runTests(args)),
  )

  return server
}
