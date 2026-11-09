import { expect, test } from 'premid/test'

test('passes', async ({ page, activity }) => {
  await page.goto('https://example.com/')
  expect(await activity.next()).toEqual({ details: 'Hello' })
})
