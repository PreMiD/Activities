# Testing

Activity tests check that your activity shows the right presence on a real page. A test opens the page, waits for the activity to set its presence, and checks the result. Tests catch regressions when a website changes its markup or when a refactor breaks something that used to work.

Tests are optional. You don't need to add them to a pull request, but they help reviewers and future maintainers.

## Writing a Test

Put a `*.test.ts` file next to your `presence.ts`. Import `test` and `expect` from `premid/test`:

```typescript
import { Assets } from 'premid'
import { expect, test } from 'premid/test'

test('shows the playing mix', async ({ page, activity }) => {
  await page.goto('https://www.mixcloud.com/')
  await page.waitForUser('Start playing any mix', {
    until: () => {
      const audio = document.querySelector('audio')
      return !!audio && !audio.paused
    },
  })
  expect(await activity.next()).toMatchObject({
    details: expect.any(String),
    smallImageKey: Assets.Play,
  })
})
```

Each test receives two handles:

- `page` controls the test tab: `goto`, `click`, `fill`, `waitFor`, `evaluate`, and `waitForUser`.
- `activity` gives you the presence your activity sets: `activity.next()` waits for the next `setActivity` call and returns its data. It resolves to `undefined` if the activity clears its presence.

### Options

Pass an options object as the second argument to change the defaults:

```typescript
test('shows the video title', { settings: { showTitle: true }, timeout: 60_000 }, async ({ page, activity }) => {
  // ...
})
```

| Option     | Default           | Applies to                              |
| ---------- | ----------------- | --------------------------------------- |
| `settings` | Activity defaults | Activity settings applied for this test |
| `timeout`  | 120s              | The whole test                          |

Each `page.waitFor` and `activity.next()` call times out after 30s, and each `page.waitForUser` call after 300s. Pass a `timeout` to the call itself, for example `page.waitFor(selector, { timeout: 10_000 })`.

### Running Code in the Page

`until` and `page.evaluate` run inside the test tab, not in the test file. The function is serialized, so:

- Write it as an arrow function or a `function` expression. Method shorthand (`until() { ... }`) doesn't work.
- `until` takes no arguments, so it can't receive values from the test file. Only `page.evaluate` takes extra arguments, so pass any values it needs through those.
- It runs in the extension's isolated script world. Globals the website defines aren't visible, but the DOM is.

```typescript
const title = await page.evaluate((selector: string) => {
  return document.querySelector(selector)?.textContent?.trim()
}, '.video-title')
```

If the page navigates while `evaluate` is pending, for example after a login redirect or a link click, the call rejects with `Page navigated during evaluate`. `waitForUser` and `waitFor` keep polling across reloads.

### Waiting for the User

Some steps need a person, such as logging in, accepting a cookie banner, or pressing play. Use `waitForUser` for these:

```typescript
await page.waitForUser('Log in to your account', {
  until: () => !document.querySelector('.login-form'),
})
```

`pmd` prints the message in your terminal, for example:

```
⠋ shows the playing mix ⏸ waiting for you: Start playing any mix
```

A bar also appears at the top of the test tab with **Continue** and **Skip test** buttons. The wait ends when `until` returns a truthy value, when you click **Continue**, or when the timeout runs out. **Skip test** marks the test as skipped.

Sometimes `page.goto` itself ends up on a page the activity doesn't match, like a cookie consent screen or a login page on another domain. `pmd` waits up to 5 minutes for you to finish there and prints:

```
⠋ browsing the home page ⏸ waiting for you: Finish on consent.youtube.com (sign in or accept), the test continues on its own
```

Once the tab is back on a page the activity matches, the test continues.

## Running Tests

Tests run in your own browser through the PreMiD extension. You need:

1. Activity Developer Mode enabled in the extension (see [Developer Tools](/v1/guide/developer-tools)).
2. An extension version that supports tests.

Then use one of these commands from the root of the activities repository:

| Command               | What it does                                                                 |
| --------------------- | ---------------------------------------------------------------------------- |
| `pmd dev <activity>`  | Rebuilds the activity on every change and runs its tests after each build.   |
| `pmd test <activity>` | Runs the tests once and exits with `0` if they all pass, or `1` if any fail. |

While `pmd dev` runs, these keys work in the terminal:

| Key      | Action                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `p`      | Pause or resume. While paused, rebuilds are not sent to the extension and tests don't run automatically. Pausing also cancels a test run that's in progress. Resuming with `p` sends the latest build and runs the tests once. |
| `t`      | Run the tests now. This sends the latest build and runs the tests, even while paused.                                                                                                                                          |
| `Ctrl+C` | Exit.                                                                                                                                                                                                                          |

Results are grouped under the activity. In a terminal, the running test shows as a live line that turns into its result. Each test gets one line, and a summary follows:

```
Mixcloud 3 tests
   ✓ shows the playing mix 4.2s
   ↷ shows the live stream (skipped)
   ✗ shows the artist name 1.1s
     Expected ...

 Tests  1 failed · 1 passed · 1 skipped (3)
  Time  5.3s
```

If you change the code while a test run is in progress, the run is cancelled and only the newest run reports.

### Using Your Own Browser

Tests use your real browser profile, so:

- **Stay logged in.** Sites that need an account must be signed in before the test starts, or the test should use `waitForUser` to wait for you.
- **Mute media.** A test that plays audio or video makes sound in your browser. Mute the browser or the test tab before you run tests.
- **Expect the test tab to open.** Test tabs are separate from your own tabs. They don't set your Discord presence.

### Unsupported Extension

If you see this message, your extension can't run tests:

```
Your extension doesn't support tests yet, or developer mode is off
```

Update the PreMiD extension, and make sure Activity Developer Mode is on.

### Several Browsers Connected

Tests run in one browser. If more than one browser has Activity Developer Mode on, `pmd` refuses to pick one and prints:

```
More than one browser is connected to pmd. Turn off developer mode in the others so tests run in one browser.
```

Turn off Activity Developer Mode in every browser except the one you want to test in.

## Next Steps

- Learn about [Best Practices](/v1/guide/best-practices) for writing reliable presence logic that tests can check.
- See [Developer Tools](/v1/guide/developer-tools) to inspect the presence data your activity sends.
