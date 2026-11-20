import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPomodoroState } from '../pages/pomodoro.js'
import { extractChapter, parseCount } from '../pages/reader.js'
import { extractEpisode, stripEpisode } from '../pages/watch.js'
import { distinctParts, samePresence } from './activity.js'
import { latinDigits, prettify, safeDecode } from './dom.js'

describe('numbers in any language', () => {
  it('converts Arabic digits and the decimal separator', () => {
    expect(latinDigits('الحلقة ١٢')).toBe('الحلقة 12')
    expect(latinDigits('٣٫٥')).toBe('3.5')
  })

  it('reads episodes, including decimals and Arabic text', () => {
    expect(extractEpisode('Episode 12.5')).toBe('12.5')
    expect(extractEpisode('الحلقة ٥')).toBe('5')
    expect(extractEpisode('S1E7')).toBe('7')
    expect(extractEpisode('Series')).toBeUndefined()
  })

  it('reads chapters', () => {
    expect(extractChapter('Chapter 3.5')).toBe('3.5')
    expect(extractChapter('الفصل ٣')).toBe('3')
  })

  it('reads "3 of 10" counts', () => {
    expect(parseCount('12 of 340')).toEqual({ partySize: 12, maxPartySize: 340 })
    expect(parseCount('١٢ من ٣٤٠')).toEqual({ partySize: 12, maxPartySize: 340 })
    expect(parseCount('0 of 10')).toBeUndefined()
    expect(parseCount('Chapter 5')).toBeUndefined()
  })
})

describe('titles and text', () => {
  it('removes the episode suffix from a title', () => {
    expect(stripEpisode('Series - Episode 12.5')).toBe('Series')
    expect(stripEpisode('Naruto - الحلقة ٥')).toBe('Naruto')
    expect(stripEpisode('Series - storm')).toBe('Series')
  })

  it('turns slugs into names and decodes URL text safely', () => {
    expect(prettify('kaoru-hana-wa-rin-to-saku')).toBe('Kaoru Hana Wa Rin To Saku')
    expect(safeDecode('caf%C3%A9')).toBe('café')
    expect(safeDecode('%E0%A4%A')).toBe('%E0%A4%A')
  })

  it('does not repeat the show title in a status line', () => {
    expect(distinctParts('Marrow', ['Marrow', 'Episode 2', 'episode 2', 'Room'])).toBe('Episode 2 • Room')
    expect(distinctParts(undefined, [undefined, 'A'])).toBe('A')
  })
})

describe('activity comparison', () => {
  const base = { details: 'A', state: 'B', startTimestamp: 100, endTimestamp: 200 }

  it('ignores a small timestamp drift but not a seek', () => {
    expect(samePresence(base, { ...base, startTimestamp: 101, endTimestamp: 201 })).toBe(true)
    expect(samePresence(base, { ...base, startTimestamp: 130, endTimestamp: 230 })).toBe(false)
  })

  it('notices a different text', () => {
    expect(samePresence(base, { ...base, state: 'C' })).toBe(false)
  })
})

describe('study timer', () => {
  afterEach(() => vi.unstubAllGlobals())

  /** Pretends to be a page at `path` whose tab remembers `timer`. */
  function openPage(path: string, timer: unknown): void {
    vi.stubGlobal('document', { location: { pathname: path, href: `https://stormy.rest${path}` } })
    vi.stubGlobal('sessionStorage', { getItem: () => JSON.stringify(timer) })
  }

  it('reads a running focus session on a Studysto page', () => {
    const endsAt = Date.now() + 600_000

    openPage('/studysto/desk', { phase: 'focus', endsAt, round: 1 })

    expect(getPomodoroState()).toMatchObject({ phase: 'focus', session: 2, area: 'Studysto', endsAt, length: 1500 })
  })

  it('ignores a paused or finished timer, a lecture and other pages', () => {
    openPage('/studysto/desk', { phase: 'focus', endsAt: null, round: 0 })
    expect(getPomodoroState()).toBeUndefined()

    openPage('/studysto/desk', { phase: 'focus', endsAt: Date.now() - 1000, round: 0 })
    expect(getPomodoroState()).toBeUndefined()

    openPage('/studysto/watch/s/t/c/l', { phase: 'focus', endsAt: Date.now() + 600_000, round: 0 })
    expect(getPomodoroState()).toBeUndefined()

    openPage('/anisto', { phase: 'focus', endsAt: Date.now() + 600_000, round: 0 })
    expect(getPomodoroState()).toBeUndefined()
  })

  it('names the break phases and Plansto', () => {
    openPage('/plansto/study', { phase: 'long', endsAt: Date.now() + 600_000, round: 0 })

    expect(getPomodoroState()).toMatchObject({ phase: 'long', area: 'Plansto', session: undefined, length: 900 })
  })
})
