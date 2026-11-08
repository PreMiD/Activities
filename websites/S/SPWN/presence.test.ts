import { ActivityType, Assets } from 'premid'
import { expect, test } from 'premid/test'

/**
 * Waits for a presence update that satisfies the supplied condition.
 *
 * @param next - Reads the next activity update.
 * @param isReady - Checks whether an update is ready for assertions.
 * @returns The first matching presence within 20 updates.
 * @throws If none of the 20 updates satisfies the condition.
 */
async function nextPresence(
  next: () => Promise<PresenceData | undefined>,
  isReady: (presence: PresenceData) => boolean,
): Promise<PresenceData> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const presence = await next()
    if (presence !== undefined && isReady(presence))
      return presence
  }
  throw new Error('No presence matching the condition arrived')
}

test('browsing the home page', async ({ page, activity }) => {
  await page.goto('https://spwn.jp/')
  expect(await activity.next()).toMatchObject({
    type: ActivityType.Watching,
    details: 'Browsing home page',
  })
})

test('browsing an event page', async ({ page, activity }) => {
  await page.goto('https://spwn.jp/events/evt_26102901-jpmiko2ndlive')
  await page.waitFor('h2.no-translate')

  const title = await page.evaluate(() => document.querySelector('h2.no-translate')?.textContent.trim() ?? '')
  expect(title).not.toBe('')

  const presence = await nextPresence(
    () => activity.next(),
    p => typeof p.state === 'string' && p.state.trim().length > 0,
  )
  expect(presence).toMatchObject({
    type: ActivityType.Watching,
    details: expect.any(String),
    state: title,
    smallImageKey: Assets.Play,
    buttons: [
      {
        label: expect.any(String),
        url: 'https://spwn.jp/events/evt_26102901-jpmiko2ndlive',
      },
    ],
  })
})

test('privacy mode hides the event title', { settings: { privacy: true } }, async ({ page, activity }) => {
  await page.goto('https://spwn.jp/events/evt_26102901-jpmiko2ndlive')
  await page.waitFor('h2.no-translate')

  const title = await page.evaluate(() => document.querySelector('h2.no-translate')?.textContent.trim() ?? '')
  expect(title).not.toBe('')

  const presence = await activity.next()
  expect(presence).toBeDefined()
  expect(presence?.state ?? '').not.toContain(title)
  expect(presence?.buttons).toBeUndefined()
})

test('watching a stream', {
  timeout: 360_000,
}, async ({ page, activity }) => {
  await page.goto('https://spwn.jp/')
  await page.waitForUser('Sign in and watch the stream', {
    until: () => {
      const video = document.querySelector<HTMLVideoElement>('#Streaming video')
      const title = document.querySelector('#Streaming h1')?.textContent?.trim()
      return !!video && !video.paused && !video.ended && !!title
    },
  })
  activity.clear()

  const presence = await nextPresence(() => activity.next(), p => p.smallImageKey === Assets.Play && typeof p.state === 'string')
  const title = await page.evaluate(() => {
    return document.querySelector('#Streaming h1')?.textContent.trim() ?? ''
  })
  expect(title).not.toBe('')

  // The h1 may append labels such as 【本編】 or 【全景固定】 that the activity omits.
  expect(title).toContain(presence.state)

  expect(presence).toMatchObject({
    type: ActivityType.Watching,
    details: expect.any(String),
    state: expect.stringMatching(/\S/),
    smallImageKey: Assets.Play,
  })
  if (presence.startTimestamp !== undefined)
    expect(presence.startTimestamp).toEqual(expect.any(Number))
  if (presence.endTimestamp !== undefined)
    expect(presence.endTimestamp).toEqual(expect.any(Number))
})
