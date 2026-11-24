import process from 'node:process'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { closeConnection } from '../mcp/browserTools.js'
import { createServer } from '../mcp/server.js'

export async function mcp() {
  // stdout belongs to the MCP protocol, so route all logging to stderr.
  console.log = console.info = console.error

  const transport = new StdioServerTransport()

  // Runs once. Closing the client, a transport close or a signal all end the process, and the
  // WebSocket server is closed first so port 3021 is free for pmd dev or pmd test.
  let shuttingDown = false
  const shutdown = async () => {
    if (shuttingDown)
      return
    shuttingDown = true
    await closeConnection()
    process.exit(0)
  }

  transport.onclose = () => {
    void shutdown()
  }
  process.stdin.once('end', () => {
    void shutdown()
  })
  process.stdin.once('close', () => {
    void shutdown()
  })
  process.once('SIGINT', () => {
    void shutdown()
  })
  process.once('SIGTERM', () => {
    void shutdown()
  })

  await createServer().connect(transport)
}
