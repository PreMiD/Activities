import { expect, test } from 'premid/test'

test('fails', async ({ page, activity }) => {
  await page.goto('https://example.com/')
  expect(await activity.next()).toEqual({ details: 'Hello' })
  throw new Error('boom')
})
