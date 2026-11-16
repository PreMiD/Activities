import type { Page } from 'premid/test'
import { ActivityType, Assets } from 'premid'
import { expect, test } from 'premid/test'

const consentOrLogin = {
  until: () => !!document.querySelector('ytmusic-app ytmusic-player-bar'),
}

// A pre-roll ad also plays in the video element, and the song can come up paused after it.
// Called repeatedly, so it retries playback until the song itself is playing with its title shown.
function playSong() {
  const video = document.querySelector('video')
  const adShowing = !!document.querySelector('.html5-video-player.ad-showing, .html5-video-player.ad-interrupting')
  if (video && video.paused && !adShowing) {
    video.muted = true
    void video.play()
  }
  const title = document.querySelector('.title.ytmusic-player-bar, ytmusic-player-bar .middle-controls .title')?.textContent?.trim()
  return !!video && !video.paused && !adShowing && !!title
}

// Starts the song muted, riding out a pre-roll ad. Only asks for a click if the browser blocks autoplay.
async function startPlayback(page: Page) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await page.evaluate(playSong).catch(() => false))
      return
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  await page.waitForUser('Press play on the song', { until: playSong })
}

// Skips presences that arrived before the song loaded or during an ad, which the activity sets without a state.
async function nextListening(
  next: () => Promise<PresenceData | undefined>,
  isReady: (presence: PresenceData) => boolean,
): Promise<PresenceData> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const presence = await next()
    if (presence?.type === ActivityType.Listening && isReady(presence))
      return presence
  }
  throw new Error('No listening presence arrived')
}

test('browsing the home page', async ({ page, activity }) => {
  await page.goto('https://music.youtube.com/')
  await page.waitForUser('Accept the consent screen or sign in', consentOrLogin)

  expect(await activity.next()).toMatchObject({
    type: ActivityType.Playing,
    details: expect.any(String),
    largeImageKey: expect.any(String),
  })
})

test('listening to a song', async ({ page, activity }) => {
  await page.goto('https://music.youtube.com/watch?v=dQw4w9WgXcQ')
  await page.waitForUser('Accept the consent screen or sign in', consentOrLogin)

  await startPlayback(page)

  const presence = await nextListening(() => activity.next(), p => p.smallImageKey === Assets.Play && typeof p.state === 'string')

  expect(presence).toMatchObject({
    type: ActivityType.Listening,
    details: expect.any(String),
    state: expect.any(String),
    smallImageKey: Assets.Play,
  })
  if (presence.startTimestamp !== undefined)
    expect(presence.startTimestamp).toEqual(expect.any(Number))
  if (presence.endTimestamp !== undefined)
    expect(presence.endTimestamp).toEqual(expect.any(Number))
})

test('privacy mode hides the song title', { settings: { privacy: true } }, async ({ page, activity }) => {
  await page.goto('https://music.youtube.com/watch?v=dQw4w9WgXcQ')
  await page.waitForUser('Accept the consent screen or sign in', consentOrLogin)

  await startPlayback(page)

  const title = await page.evaluate(() => {
    return document.querySelector('.title.ytmusic-player-bar, ytmusic-player-bar .middle-controls .title')
      ?.textContent
      ?.trim() ?? ''
  })
  expect(title).not.toBe('')

  const presence = await nextListening(() => activity.next(), () => true)

  expect(presence.details ?? '').not.toContain(title)
  expect(presence.state ?? '').not.toContain(title)
})
