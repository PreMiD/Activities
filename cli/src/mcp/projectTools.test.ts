import { Buffer } from 'node:buffer'
import { EventEmitter } from 'node:events'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  spawn: vi.fn(),
  getActivities: vi.fn(),
}))

vi.mock('node:child_process', () => ({ spawn: mocks.spawn }))
vi.mock('../util/getActivities.js', () => ({ getActivities: mocks.getActivities }))

const { buildActivity, listActivities } = await import('./projectTools.js')

const activities = [
  { metadata: { service: 'YouTube', apiVersion: 1, version: '1.0.0', url: 'youtube.com' }, folder: '/repo/websites/Y/YouTube', versionized: false },
  { metadata: { service: 'Twitch', apiVersion: 1, version: '2.0.0', url: 'twitch.tv' }, folder: '/repo/websites/T/Twitch', versionized: false },
]

function fakeChild(output: string, code: number) {
  const child = new EventEmitter() as EventEmitter & { stdout: EventEmitter, stderr: EventEmitter }
  child.stdout = new EventEmitter()
  child.stderr = new EventEmitter()
  setImmediate(() => {
    child.stderr.emit('data', Buffer.from(output))
    child.emit('close', code)
  })
  return child
}

describe('projectTools', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getActivities.mockResolvedValue(activities)
  })

  describe('listActivities', () => {
    it('filters by query', async () => {
      const result = await listActivities({ query: 'you' })

      expect(result).toEqual([
        { service: 'YouTube', folder: '/repo/websites/Y/YouTube', url: 'youtube.com', version: '1.0.0' },
      ])
    })

    it('returns every activity without a query', async () => {
      const result = await listActivities({})

      expect(result).toHaveLength(2)
    })
  })

  describe('buildActivity', () => {
    it('build_activity returns success false and the stripped output on a failing build', async () => {
      mocks.spawn.mockReturnValue(fakeChild('\u001B[31mbuild failed\u001B[39m', 1))

      const result = await buildActivity({ service: 'YouTube' })

      expect(result).toEqual({ success: false, output: 'build failed' })
      expect(mocks.spawn).toHaveBeenCalledWith(
        process.execPath,
        [expect.stringMatching(/dist[/\\]index\.js$/), 'build', 'YouTube', '--no-kill', '--validate'],
        expect.anything(),
      )
    })

    it('build_activity rejects an unknown service', async () => {
      const result = await buildActivity({ service: 'Nope' })

      expect(result).toEqual({ error: 'Activity Nope not found' })
      expect(mocks.spawn).not.toHaveBeenCalled()
    })
  })
})
