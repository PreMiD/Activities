# PortSwigger Academy Presentation Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the PortSwigger Academy presence with a static application label, default Playing type, HTB Academy-style `details`/`state`, and icon tooltips.

**Architecture:** Edit the existing `UpdateData` switch in place. Keep all DOM readers, settings, privacy handling, and clamping unchanged. Change only the strings, the `largeImageText` value, the `smallImageText` additions, and the removed `type` field.

**Tech Stack:** TypeScript, PreMiD Presence API (`premid`, `Assets`), `premid/test` e2e tests.

**Spec:** `docs/superpowers/specs/2026-11-20-portswigger-academy-presentation-revision.md`

## Global Constraints

- `largeImageText` is always `PortSwigger Academy`, including in privacy mode.
- No `type` field anywhere; `ActivityType` import removed; `Assets` import kept.
- Every page that sets `smallImageKey` also sets `smallImageText`.
- `details` and `state` remain clamped to 128 characters.
- Privacy mode still deletes `state`, `startTimestamp`, `smallImageKey`, `smallImageText`, and `buttons`.
- No metadata `service` change; folder stays `websites/P/PortSwigger Web Security Academy`.

## Review Focus

- Privacy mode with account stats present: username and rank must not leak into `state`. Test: `privacy mode hides lab details` plus a new dashboard privacy assertion.
- Anonymous account: `ANONYMOUS` must never appear in `state`. Test: `hall of fame omits username when anonymous` gains a `state` assertion.
- Long lab title after quote removal: `details` must still clamp to 128. Test: `long lab title is clamped`.
- Every icon has a tooltip. Test: new `all presence icons have tooltips` assertion over all page kinds.
- Default Playing type: `type` must be absent from the emitted activity. Test: new `activity type is default playing` assertion on a lab page.

---

### Task 1: Restyle presence strings, labels, and tooltips

**Files:**
- Modify: `websites/P/PortSwigger Web Security Academy/presence.ts:1-255`
- Modify: `websites/P/PortSwigger Web Security Academy/presence.test.ts:17-187`

**Interfaces:**
- Consumes: existing exports `clamp`, `getPageKind`, `readSettings`, `getAccountStats`, `getLabTitle`, `getLabDifficulty`, `isLabSolved`, `getTopic`, `getHeading`.
- Produces: same exported signatures; `presenceData` emitted with `type` absent, `largeImageText: 'PortSwigger Academy'`, and `smallImageText` on every small image.

- [ ] **Step 1: Update test expectations to the new copy**

In `presence.test.ts`, change these assertions:
- lab details: `Solving Lab: '${title}'` → `Solving Lab: ${title}` (both the equality and `nextPresence` predicate at lines 31-33 and 185).
- index: `Browsing: All labs` → `Browsing all labs` (line 48).
- learning paths index: `Browsing: Learning paths` → `Browsing learning paths` (line 64).
- anonymous dashboard: `Browsing dashboard` → `Browsing the dashboard` (line 117).
- hall of fame: `details` → `Looking at the Hall of Fame`; keep the `state` rank assertion (lines 143-144).

Add these tests:
```ts
test('activity label and tooltips', async ({ page, activity }) => {
  for (const [url, tooltip] of [
    [LAB_URL, 'Solving'],
    ['https://portswigger.net/web-security/sql-injection/union-attacks', 'Reading'],
    ['https://portswigger.net/web-security/all-labs', 'Browsing'],
  ]) {
    await page.goto(url)
    const presence = await activity.next()
    expect(presence?.largeImageText).toBe('PortSwigger Academy')
    expect(presence?.smallImageText).toBe(tooltip)
    expect(presence?.type).toBeUndefined()
  }
})

test('dashboard puts username in state', { settings: { showUsername: true } }, async ({ page, activity }) => {
  await page.goto('https://portswigger.net/web-security/dashboard')
  await page.evaluate((html) => {
    document.body.insertAdjacentHTML('beforeend', html)
  }, '<div id="ajaxUserStatus">You\'re showing as tester1</div>')
  activity.clear()

  const presence = await activity.next()
  expect(presence?.details).toBe('Browsing the dashboard')
  expect(presence?.state).toContain('Username: tester1')
})

test('privacy mode hides dashboard identity', { settings: { privacyMode: true } }, async ({ page, activity }) => {
  await page.goto('https://portswigger.net/web-security/dashboard')
  await page.evaluate((html) => {
    document.body.insertAdjacentHTML('beforeend', html)
  }, ACCOUNT_WIDGET)
  activity.clear()

  const presence = await activity.next()
  expect(presence?.details).toBe('Browsing PortSwigger Academy')
  expect(presence?.state).toBeUndefined()
  expect(presence?.smallImageText).toBeUndefined()
})
```

- [ ] **Step 2: Run static checks to confirm the tests changed cleanly**

Run:
```bash
npx tsc --noEmit -p "websites/P/PortSwigger Web Security Academy/tsconfig.json"
npx eslint "websites/P/PortSwigger Web Security Academy"
```
Expected: PASS. Local e2e cannot run without PreMiD developer mode; CI runs `presence.test.ts`.

- [ ] **Step 3: Apply the presentation changes in `presence.ts`**

- Import only `Assets` from `premid`.
- Delete `type: ActivityType.Watching` from `presenceData`.
- Set `largeImageText: 'PortSwigger Academy'`.
- Set `smallImageText` beside each `smallImageKey`: `Solving` for `Assets.Play`, `Reading` for `Assets.Reading`, `Browsing` for `Assets.Viewing`.
- Replace `details` strings: lab `Solving Lab: ${title}` (no quotes), index `Browsing <lowercase name>` from `INDEX_NAMES`, learning paths index `Browsing learning paths`, dashboard `Browsing the dashboard`, hall of fame `Looking at the Hall of Fame`.
- Move dashboard and hall-of-fame username out of `details` and into the `state` parts array, behind `settings.showUsername`.
- Keep article, learning path, lab difficulty, solved state, and privacy mode logic unchanged.

- [ ] **Step 4: Re-run static checks**

Run:
```bash
npx tsc --noEmit -p "websites/P/PortSwigger Web Security Academy/tsconfig.json"
npx eslint "websites/P/PortSwigger Web Security Academy"
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "websites/P/PortSwigger Web Security Academy/presence.ts" "websites/P/PortSwigger Web Security Academy/presence.test.ts" "docs/superpowers/specs/2026-11-20-portswigger-academy-presentation-revision.md" "docs/superpowers/plans/2026-11-20-portswigger-academy-presentation-revision.md"
git commit -m "style(PortSwigger Academy): restyle rich presence copy and tooltips"
```
