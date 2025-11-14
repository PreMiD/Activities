import type { RawData } from 'ws'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import WebSocket, { WebSocketServer as WSServer } from 'ws'
import { info, prefix } from '../util/log.js'

export class WebSocketServer {
  private server: WSServer

  constructor(public readonly cwd: string) {
    this.server = new WSServer({ port: 3021 })

    this.server.on('connection', (socket) => {
      if (this.resendOnConnect && !this.isSending) {
        info('Connected to the extension!')
        this.send()
      }

      socket.on('close', () => {
        info('Disconnected from the extension!')
      })
    })
  }

  private resendOnConnect = false
  private isSending = false
  async send() {
    this.resendOnConnect = true
    if (this.server.clients.size === 0 || [...this.server.clients.values()].every(client => client.readyState !== WebSocket.OPEN)) {
      return
    }

    if (this.isSending) {
      return
    }

    this.isSending = true

    const distPath = resolve(this.cwd, 'dist')
    if (!existsSync(distPath)) {
      this.isSending = false
      return
    }

    const files = await readdir(distPath)

    const spinner = ora(
      prefix + chalk.yellow(' Sending activity to the extension...'),
    ).start()

    let expectedCount = 0
    let receivedCount = 0
    for (const client of this.server.clients) {
      if (client.readyState !== WebSocket.OPEN)
        continue

      expectedCount++

      const timeout = setTimeout(removeExpectedCount, 3000)

      function removeExpectedCount() {
        expectedCount--
        finish()
      }

      function finish() {
        clearTimeout(timeout)

        client.off('message', onMessage)
        client.off('close', removeExpectedCount)
      }

      function onMessage(message: RawData) {
        if (message.toString() === 'received') {
          receivedCount++
          finish()
        }
      }

      client.on('message', onMessage)

      client.on('close', removeExpectedCount)

      client.send(JSON.stringify({
        type: 'localPresence',
        files: await Promise.all(files
          .filter(file => ['.json', '.js'].includes(extname(file)))
          .map(async (file) => {
            if (extname(file) === '.json') {
              return {
                file,
                contents: JSON.parse(await readFile(resolve(distPath, file), 'utf-8') || '{}'),
              }
            }
            else {
              return {
                file,
                contents: await readFile(resolve(distPath, file), 'utf-8'),
              }
            }
          })),
      }))
    }

    //* Wait for all clients to acknowledge receipt, with a maximum wait time of 10 seconds
    const maxWaitTime = 10000
    const startTime = Date.now()
    while (receivedCount !== expectedCount && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (receivedCount === expectedCount) {
      spinner.succeed(prefix + chalk.greenBright(' Activity sent to the extension!'))
    }
    else {
      spinner.warn(prefix + chalk.yellow(` Activity sent, but only ${receivedCount}/${expectedCount} clients acknowledged receipt`))
    }

    this.isSending = false
  }

  close() {
    this.server.close()
  }
}
