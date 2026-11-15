import type { RuntimeFlavour } from './harness.js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runSyncScript } from './harness.js'

function fakeDisney({ timeline = true, ad = false, paused = false } = {}) {
  const ui = { latestUiState: { interstitials: { isInterstitialPlaying: ad } } }
  const mediaElement = { playbackRate: 1 }
  const mediaPlayer: Record<string, any> = {
    playbackStatus: { playing: !paused, paused, buffering: false, currentState: paused ? 'PAUSED' : 'PLAYING' },
    timeline: timeline ? { info: { playheadPositionMs: 12_000, programDurationMs: 2_400_000 } } : undefined,
    mediaPlaybackCriteria: { metadata: { title: { text: 'Andor' }, subtitle: { text: 'S1:E1' } } },
    mediaElement,
    play: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
  }
  const elements: Record<string, unknown> = {
    'disney-web-player': { mediaPlayer },
    'disney-web-player-ui': ui,
  }
  return { mediaPlayer, mediaElement, ui, querySelector: (selector: string) => elements[selector] ?? null }
}

describe.each<RuntimeFlavour>(['old', 'new'])('disney+ sync script on the %s runtime', (flavour) => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends null and takes no control while the player has no timeline', () => {
    const { querySelector } = fakeDisney({ timeline: false })
    const page = runSyncScript('Disney+', flavour, { pathname: '/play/abc', querySelector })
    vi.advanceTimersByTime(2000)

    expect(page.posted.filter(m => m.key === 'state').every(m => m.data === null)).toBe(true)
    expect(page.posted.length).toBeGreaterThan(0)
    expect(page.ctx.video.takeControl).not.toHaveBeenCalled()
    page.stop()
  })

  it('does not take control before the player exists, but claims a play page', () => {
    const page = runSyncScript('Disney+', flavour, { pathname: '/en-gb/play/abc' })
    vi.advanceTimersByTime(2000)

    expect(page.ctx.video.takeControl).not.toHaveBeenCalled()
    expect(page.ctx.features).toHaveBeenCalledWith(expect.objectContaining({ fallback: false }))
    page.stop()
  })

  it('reports the timeline position and page info once there is a timeline', () => {
    const { querySelector } = fakeDisney()
    const page = runSyncScript('Disney+', flavour, { pathname: '/play/abc', querySelector })
    vi.advanceTimersByTime(250)

    expect(page.handles[0]!.reportPlayback).toHaveBeenLastCalledWith({ playing: true, currentTime: 12, duration: 2400, playbackRate: 1 })
    expect(page.ctx.setPageInfo).toHaveBeenCalledWith({ title: 'Andor', subtitle: 'S1:E1' })
    page.stop()
  })

  it('maps the ad flag through', () => {
    const { querySelector } = fakeDisney({ ad: true })
    const page = runSyncScript('Disney+', flavour, { pathname: '/play/abc', querySelector })
    vi.advanceTimersByTime(250)

    expect(page.bridged.ad).toEqual([true])
    page.stop()
  })

  it('lets an ad end reach the party while the player keeps playing', () => {
    const { querySelector, ui, mediaPlayer } = fakeDisney({ ad: true })
    const page = runSyncScript('Disney+', flavour, { pathname: '/play/abc', querySelector })
    vi.advanceTimersByTime(500)
    expect(page.bridged.ad).toEqual([true])

    ui.latestUiState.interstitials.isInterstitialPlaying = false
    for (let i = 0; i < 4; i++) {
      mediaPlayer.timeline.info.playheadPositionMs += 250
      vi.advanceTimersByTime(250)
    }

    expect(page.bridged.ad).toEqual([true, false])
    page.stop()
  })

  it('throttles a paused player to one post a second', () => {
    const { querySelector } = fakeDisney({ paused: true })
    const page = runSyncScript('Disney+', flavour, { pathname: '/play/abc', querySelector })
    vi.advanceTimersByTime(5000)

    expect(page.posted.filter(m => m.key === 'state').length).toBeLessThanOrEqual(6)
    page.stop()
  })

  it('reports a broken player API once after three failures', () => {
    const { querySelector, mediaPlayer } = fakeDisney()
    Object.defineProperty(mediaPlayer, 'playbackStatus', {
      get: () => {
        throw new TypeError('playbackStatus moved')
      },
    })
    const page = runSyncScript('Disney+', flavour, { pathname: '/play/abc', querySelector })
    vi.advanceTimersByTime(2000)

    expect(page.posted.filter(m => m.key === 'broken')).toHaveLength(1)
    expect(page.bridged.blocked).toEqual(['PreMiD cannot control the Disney+ player'])
    page.stop()
  })

  it('seeks to the party position before pausing when more than a second off', () => {
    const { querySelector, mediaPlayer } = fakeDisney()
    const page = runSyncScript('Disney+', flavour, { pathname: '/play/abc', querySelector })
    vi.advanceTimersByTime(250)

    page.handles[0]!.options.onPause(30)

    expect(mediaPlayer.seek).toHaveBeenCalledWith(30_000)
    expect(mediaPlayer.pause).toHaveBeenCalled()
    page.stop()
  })

  it('releases control once the player has been gone for a second', () => {
    const { querySelector } = fakeDisney()
    let present = true
    const page = runSyncScript('Disney+', flavour, { pathname: '/play/abc', querySelector: s => present ? querySelector(s) : null })
    vi.advanceTimersByTime(250)
    present = false
    vi.advanceTimersByTime(500)
    expect(page.handles[0]!.release).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1500)
    expect(page.handles[0]!.release).toHaveBeenCalled()
    page.stop()
  })
})
