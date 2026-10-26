import type { TestEvent } from './WebSocketServer.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WebSocket from 'ws'
import { WebSocketServer } from './WebSocketServer.js'

vi.mock('../util/log.js', () => ({
  info: vi.fn(),
  prefix: '',
}))

const clients: WebSocket[] = []

function connectClient(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const client = new WebSocket('ws://localhost:3021')
    clients.push(client)
    client.once('open', () => resolve(client))
    client.once('error', reject)
  })
}

function parse(raw: WebSocket.RawData): any {
  return JSON.parse(raw.toString())
}

describe('webSocketServer test RPC', () => {
  let server: WebSocketServer

  beforeEach(() => {
    server = new WebSocketServer(process.cwd())
  })

  afterEach(async () => {
    for (const client of clients.splice(0))
      client.terminate()
    await server.close()
  })

  it('request resolves with testResponse result', async () => {
    const client = await connectClient()
    client.on('message', (raw) => {
      const message = parse(raw)
      if (message.type === 'test')
        client.send(JSON.stringify({ type: 'testResponse', id: message.id, result: { version: 1 } }))
    })
    await vi.waitFor(() => expect(server.isConnected).toBe(true))

    await expect(server.request('hello')).resolves.toEqual({ version: 1 })
  })

  it('request sends type, id, method and params', async () => {
    const client = await connectClient()
    const received = new Promise<any>(resolve => client.once('message', raw => resolve(parse(raw))))
    await vi.waitFor(() => expect(server.isConnected).toBe(true))

    const pending = server.request('openTab', { url: 'https://example.com', service: 'Example' }, 1000)
    const message = await received
    expect(message).toEqual({
      type: 'test',
      id: expect.any(Number),
      method: 'openTab',
      params: { url: 'https://example.com', service: 'Example' },
    })

    client.send(JSON.stringify({ type: 'testResponse', id: message.id, result: {} }))
    await pending
  })

  it('request rejects with testResponse error', async () => {
    const client = await connectClient()
    client.on('message', (raw) => {
      const message = parse(raw)
      if (message.type === 'test')
        client.send(JSON.stringify({ type: 'testResponse', id: message.id, error: 'Tab closed' }))
    })
    await vi.waitFor(() => expect(server.isConnected).toBe(true))

    await expect(server.request('evaluate')).rejects.toThrow('Tab closed')
  })

  it('request rejects when no extension is connected', async () => {
    expect(server.isConnected).toBe(false)
    await expect(server.request('hello')).rejects.toThrow('Extension not connected')
  })

  it('request times out', async () => {
    await connectClient()
    await vi.waitFor(() => expect(server.isConnected).toBe(true))

    await expect(server.request('hello', {}, 20)).rejects.toThrow('Timed out waiting for the extension (hello)')
  })

  it('onTestEvent receives events and can unsubscribe', async () => {
    const client = await connectClient()
    await vi.waitFor(() => expect(server.isConnected).toBe(true))

    const first = vi.fn()
    const second = vi.fn()
    const unsubscribe = server.onTestEvent(first)
    server.onTestEvent(second)

    const firstEvent: TestEvent = { tabId: 1, kind: 'setActivity', data: { details: 'Browsing' } }
    client.send(JSON.stringify({ type: 'testEvent', ...firstEvent }))
    await vi.waitFor(() => expect(second).toHaveBeenCalledTimes(1))
    expect(first).toHaveBeenCalledWith(firstEvent)

    unsubscribe()
    client.send(JSON.stringify({ type: 'testEvent', tabId: 1, kind: 'clearActivity' }))
    client.send(JSON.stringify({ type: 'testEvent', tabId: 2, kind: 'error', error: 'bad url' }))
    await vi.waitFor(() => expect(second).toHaveBeenCalledTimes(3))

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenLastCalledWith({ tabId: 2, kind: 'error', error: 'bad url' })
  })

  it('ignores non-JSON messages', async () => {
    const client = await connectClient()
    client.on('message', (raw) => {
      const message = parse(raw)
      if (message.type === 'test') {
        client.send('received')
        client.send('not json {')
        client.send(JSON.stringify({ type: 'testResponse', id: message.id, result: 'ok' }))
      }
    })
    await vi.waitFor(() => expect(server.isConnected).toBe(true))

    await expect(server.request('hello')).resolves.toBe('ok')
  })
})
