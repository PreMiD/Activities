import { test } from 'premid/test'

test('skips', async ({ page }) => {
  await page.goto('https://example.com/')
  await page.waitForUser('Log in first')
})
