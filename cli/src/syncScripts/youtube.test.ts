import type { RuntimeFlavour } from './harness.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runSyncScript, syncScriptsDir } from './harness.js'

describe('youTube regExp', () => {
  const regExp = new RegExp(JSON.parse(readFileSync(resolve(syncScriptsDir, 'YouTube', 'metadata.json'), 'utf8')).regExp)

  it.each([
    'https://www.youtube.com/watch?v=abc',
    'https://www.youtube.com/',
    'https://m.youtube.com/watch?v=abc',
    'https://music.youtube.com/watch?v=abc',
    'https://www.youtube.com/@channel/shorts',
  ])('matches %s', url => expect(regExp.test(url)).toBe(true))

  it.each([
    'https://www.youtube.com/shorts/abc',
    'https://m.youtube.com/shorts/abc',
    'https://studio.youtube.com/video/abc/edit',
  ])('skips %s', url => expect(regExp.test(url)).toBe(false))
})

describe.each<RuntimeFlavour>(['old', 'new'])('youTube sync script on the %s runtime', (flavour) => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports the ad state from the start and maps the ad flag through', () => {
    let inAd = false
    const page = runSyncScript('YouTube', flavour, {
      hostname: 'www.youtube.com',
      querySelector: selector => inAd && selector.includes('#movie_player.ad-showing') ? {} : null,
    })
    expect(page.bridged.ad).toEqual([false])

    inAd = true
    vi.advanceTimersByTime(500)
    inAd = false
    vi.advanceTimersByTime(500)

    expect(page.bridged.ad).toEqual([false, true, false])
    page.stop()
  })

  it('never takes control of the video and leaves the generic video sync on', () => {
    const page = runSyncScript('YouTube', flavour, { hostname: 'www.youtube.com' })
    vi.advanceTimersByTime(2000)

    expect(page.ctx.video.takeControl).not.toHaveBeenCalled()
    expect(page.ctx.features).toHaveBeenCalledWith({ cursor: false, scroll: false })
    page.stop()
  })

  it('sends page info only when it changes', () => {
    const page = runSyncScript('YouTube', flavour, {
      hostname: 'music.youtube.com',
      mediaSession: { metadata: { title: 'Song', artist: 'Artist', artwork: [{ src: 'cover.jpg' }] } },
    })
    vi.advanceTimersByTime(2000)

    expect(page.ctx.setPageInfo).toHaveBeenCalledTimes(1)
    expect(page.ctx.setPageInfo).toHaveBeenCalledWith({ title: 'Song', subtitle: 'Artist', thumbnail: 'cover.jpg' })
    page.stop()
  })
})
