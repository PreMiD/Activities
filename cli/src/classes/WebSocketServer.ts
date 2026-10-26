import type { RawData } from 'ws'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import WebSocket, { WebSocketServer as WSServer } from 'ws'
import { info, prefix } from '../util/log.js'

export type TestEvent
  = | { tabId: number, kind: 'setActivity', data: unknown }
    | { tabId: number, kind: 'clearActivity' }
    | { tabId: number, kind: 'invalid' | 'error', error: string }

export interface TestRpc {
  request: <T = unknown>(method: string, params?: object, timeoutMs?: number) => Promise<T>
  onTestEvent: (listener: (event: TestEvent) => void) => () => void
}

type TestMessage
  = | { type: 'testResponse', id: number, result?: unknown, error?: string }
    | ({ type: 'testEvent' } & TestEvent)

export class WebSocketServer implements TestRpc {
  private server: WSServer

  constructor(public readonly cwd: string) {
    this.server = new WSServer({ port: 3021 })

    this.server.on('connection', (socket) => {
      if (this.resendOnConnect && !this.isSending) {
        info('Connected to the extension!')
        this.send()
      }

      socket.on('message', (raw) => {
        let message: TestMessage
        try {
          message = JSON.parse(raw.toString()) as TestMessage
        }
        catch {
          return
        }

        if (message?.type === 'testResponse') {
          this.handleTestResponse(message)
        }
        else if (message?.type === 'testEvent') {
          const { type: _type, ...event } = message
          for (const listener of this.testListeners) {
            // A throwing listener must not stop the others or the message handler.
            try {
              listener(event)
            }
            catch {}
          }
        }
      })

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
    if (!existsSync(distPath))
      return

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

    // eslint-disable-next-line no-unmodified-loop-condition
    while (receivedCount !== expectedCount) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    spinner.succeed(prefix + chalk.greenBright(' Activity sent to the extension!'))

    this.isSending = false
  }

  private nextTestId = 0
  private pendingTests = new Map<number, { resolve: (value: unknown) => void, reject: (error: Error) => void, timeout: NodeJS.Timeout }>()
  private testListeners = new Set<(event: TestEvent) => void>()

  get isConnected(): boolean {
    return this.getOpenClient() !== undefined
  }

  private getOpenClient() {
    return [...this.server.clients].find(client => client.readyState === WebSocket.OPEN)
  }

  request<T = unknown>(method: string, params: object = {}, timeoutMs = 30_000): Promise<T> {
    const client = this.getOpenClient()
    if (!client)
      return Promise.reject(new Error('Extension not connected'))

    const id = ++this.nextTestId
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingTests.delete(id)
        reject(new Error(`Timed out waiting for the extension (${method})`))
      }, timeoutMs)

      this.pendingTests.set(id, { resolve: resolve as (value: unknown) => void, reject, timeout })
      client.send(JSON.stringify({ type: 'test', id, method, params }))
    })
  }

  onTestEvent(listener: (event: TestEvent) => void) {
    this.testListeners.add(listener)
    return () => {
      this.testListeners.delete(listener)
    }
  }

  private handleTestResponse(message: Extract<TestMessage, { type: 'testResponse' }>) {
    const pending = this.pendingTests.get(message.id)
    if (!pending)
      return

    clearTimeout(pending.timeout)
    this.pendingTests.delete(message.id)

    if (typeof message.error === 'string')
      pending.reject(new Error(message.error))
    else
      pending.resolve(message.result)
  }

  async close(): Promise<void> {
    for (const [id, pending] of this.pendingTests) {
      clearTimeout(pending.timeout)
      this.pendingTests.delete(id)
      pending.reject(new Error('WebSocket server closed'))
    }

    for (const client of this.server.clients)
      client.terminate()

    await new Promise<void>((resolve, reject) => {
      this.server.close(err => err ? reject(err) : resolve())
    })
  }
}
