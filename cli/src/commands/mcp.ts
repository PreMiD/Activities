import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from '../mcp/server.js'

export async function mcp() {
  // stdout belongs to the MCP protocol, so route all logging to stderr.
  console.log = console.info = console.error

  await createServer().connect(new StdioServerTransport())
}
