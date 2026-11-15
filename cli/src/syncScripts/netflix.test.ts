import type { RuntimeFlavour } from './harness.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runSyncScript } from './harness.js'

function fakeNetflix(overrides: Record<string, any> = {}) {
  const player = {
    isReady: () => true,
    isPaused: vi.fn(() => false),
    getSegmentTime: vi.fn(() => 5_000),
    getCurrentTime: vi.fn(() => 65_000),
    getDuration: () => 3_600_000,
    getPlaybackRate: vi.fn(() => 1),
    setPlaybackRate: vi.fn(),
    getElement: () => null,
    getAdManager: () => ({ adPresenting: { _value: false } }),
    play: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
    ...overrides,
  }
  const videoPlayer = {
    getAllPlayerSessionIds: () => ['preview-1', 'watch-1'],
    getVideoPlayerBySessionId: (id: string) => id === 'watch-1' ? player : null,
  }
  return { player, netflix: { appContext: { state: { playerApp: { getAPI: () => ({ videoPlayer }) } } } } }
}

describe.each<RuntimeFlavour>(['old', 'new'])('netflix sync script on the %s runtime', (flavour) => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not take control before the player exists', () => {
    const page = runSyncScript('Netflix', flavour, { pathname: '/browse' })
    vi.advanceTimersByTime(3000)

    expect(page.ctx.video.takeControl).not.toHaveBeenCalled()
    expect(page.ctx.features).not.toHaveBeenCalled()
    page.stop()
  })

  it('claims a watch page with fallback off before the player loads, and takes control once it does', () => {
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1' })
    expect(page.ctx.features).toHaveBeenCalledWith(expect.objectContaining({ video: true, fallback: false }))
    vi.advanceTimersByTime(2000)
    expect(page.ctx.video.takeControl).not.toHaveBeenCalled()

    page.window.netflix = fakeNetflix().netflix
    vi.advanceTimersByTime(250)

    expect(page.ctx.video.takeControl).toHaveBeenCalledTimes(1)
    page.stop()
  })

  it('reports the segment time, not the ad-inclusive player time', () => {
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1', window: { netflix: fakeNetflix().netflix } })
    vi.advanceTimersByTime(250)

    expect(page.handles[0]!.reportPlayback).toHaveBeenLastCalledWith({ playing: true, currentTime: 5, duration: 3600, playbackRate: 1 })
    page.stop()
  })

  it('maps the ad flag through', () => {
    const { netflix } = fakeNetflix({ getAdManager: () => ({ adPresenting: { _value: true } }) })
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1', window: { netflix } })
    vi.advanceTimersByTime(250)

    expect(page.bridged.ad).toEqual([true])
    page.stop()
  })

  it('lets an ad end reach the party while the player keeps playing', () => {
    let inAd = true
    let time = 0
    const { netflix } = fakeNetflix({ getAdManager: () => ({ adPresenting: { _value: inAd } }), getSegmentTime: () => (time += 250) })
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1', window: { netflix } })
    vi.advanceTimersByTime(500)
    expect(page.bridged.ad).toEqual([true])

    inAd = false
    vi.advanceTimersByTime(1000)

    expect(page.bridged.ad).toEqual([true, false])
    page.stop()
  })

  it('throttles a paused player to one post a second', () => {
    const { netflix } = fakeNetflix({ isPaused: () => true })
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1', window: { netflix } })
    vi.advanceTimersByTime(5000)

    expect(page.posted.filter(m => m.key === 'state').length).toBeLessThanOrEqual(6)
    page.stop()
  })

  it('reports a playing player every tick, so the old runtime never acts on a stale position', () => {
    let time = 0
    const { netflix } = fakeNetflix({ getSegmentTime: () => (time += 250) })
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1', window: { netflix } })
    vi.advanceTimersByTime(2000)

    expect(page.handles[0]!.reportPlayback).toHaveBeenCalledTimes(8)
    page.stop()
  })

  it('reports a broken player API once after three failures and clears it when the API works again', () => {
    let broken = true
    const { netflix } = fakeNetflix({
      isPaused: () => {
        if (broken)
          throw new TypeError('isPaused is not a function')
        return false
      },
    })
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1', window: { netflix } })
    vi.advanceTimersByTime(2000)

    expect(page.posted.filter(m => m.key === 'broken')).toHaveLength(1)
    expect(page.bridged.blocked).toEqual(['PreMiD cannot control the Netflix player'])
    if (flavour === 'new')
      expect(page.ctx.log).toHaveBeenCalledWith('Netflix player API failed', 'TypeError: isPaused is not a function')

    broken = false
    vi.advanceTimersByTime(250)
    expect(page.bridged.unblocked).toBe(1)
    page.stop()
  })

  it('seeks to the party position before playing when more than a second off', () => {
    const { netflix, player } = fakeNetflix({ isPaused: () => true })
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1', window: { netflix } })
    vi.advanceTimersByTime(250)

    page.handles[0]!.options.onPlay(60)
    expect(player.seek).toHaveBeenCalledWith(60_000)
    expect(player.play).toHaveBeenCalled()

    player.seek.mockClear()
    page.handles[0]!.options.onPlay(61)
    expect(player.seek).not.toHaveBeenCalled()

    page.handles[0]!.options.onPause(5.5)
    expect(player.seek).not.toHaveBeenCalled()
    page.stop()
  })

  it('only hands the runtime a rate setter on runtimes that expose ctx.runtime, and drops it if the player ignores it', () => {
    const { netflix, player } = fakeNetflix()
    const page = runSyncScript('Netflix', flavour, { pathname: '/watch/1', window: { netflix } })
    vi.advanceTimersByTime(250)
    const options = page.handles[0]!.options

    if (flavour === 'old') {
      expect(options.onRate).toBeUndefined()
    }
    else {
      options.onRate(1.02)
      expect(player.setPlaybackRate).toHaveBeenCalledWith(1.02)
      vi.advanceTimersByTime(500)
      expect(options.onRate).toBeUndefined()
    }
    page.stop()
  })
})
