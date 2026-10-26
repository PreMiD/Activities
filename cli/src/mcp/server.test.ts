import { describe, expect, it } from 'vitest'
import { toToolResult } from './server.js'

describe('toToolResult', () => {
  it('maps a handler error to a tool error', () => {
    expect(toToolResult({ error: 'Activity Nope not found' })).toEqual({
      isError: true,
      content: [{ type: 'text', text: 'Activity Nope not found' }],
    })
  })

  it('keeps an event result with an error field as a normal result', () => {
    const result = toToolResult({ kind: 'invalid', activity: null, error: 'Missing details' })

    expect(result.isError).toBeUndefined()
    expect(JSON.parse(result.content[0].text)).toEqual({ kind: 'invalid', activity: null, error: 'Missing details' })
  })
})
