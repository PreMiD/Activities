# PortSwigger Web Security Academy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a PreMiD activity for `portswigger.net/web-security` that shows the current study page and, when logged in, the user's own lab/account statistics.

**Architecture:** One self-contained activity folder with `metadata.json`, `presence.ts`, and `presence.test.ts`. `presence.ts` classifies `document.location.pathname`, reads public DOM first, then reads the site's injected account/lab widgets when present. All fields are clamped to 128 characters and gated by settings. No cache and no writes to the site.

**Tech Stack:** TypeScript, PreMiD Activity API (`premid`), `premid/test` with `vitest`, ESLint.

**Spec:** `docs/superpowers/specs/2026-11-20-portswigger-academy-design.md`

## Global Constraints

- Activity directory: `websites/P/PortSwigger Web Security Academy/`.
- Files: `metadata.json`, `presence.ts`, `presence.test.ts` only.
- `$schema`: `https://schemas.premid.app/metadata/1.17`; `apiVersion`: `1`.
- `url`: `portswigger.net`; `regExp`: `^https?[:][/][/](?:www[.])?portswigger[.]net[/]web-security`.
- `version`: `1.0.0`; `color`: `#FF6633`; `category`: `other`.
- Tags: `web-security`, `cybersecurity`, `learning` (lowercase, no spaces).
- Logo must be square 512x512. Images hosted on `cdn.rcd.gg/PreMiD/...` or `i.imgur.com`.
- Use `document.location`, never `window.location` or bare `location`.
- Clamp `details` and `state` to 128 characters.
- Remove disabled fields with `delete`, never assign `undefined`.
- Read-only: no POST, no lab launch, no DOM modification, no "show yourself" toggle.
- Buttons: at most one, pointing to `document.location.href`; never the bare homepage.
- Never display solution text, lab host, lab session ID, or another user's rank.
- `npx pmd test` needs the PreMiD browser extension running in developer mode. If that is unavailable in this environment, fall back to `npm run lint` plus a manual DOM check on the live site, and say so in the commit report.

## Review Focus

- Widget not yet injected: activity must still show public page context, not crash or blank fields. Test: Task 1, anonymous lab page with no widget DOM.
- Logged-out visitor: no account fields appear and no request is made. Test: Task 1, anonymous dashboard page.
- `privacyMode` on a lab page: `state`, `startTimestamp`, and `buttons` all removed. Test: Task 1, lab page with `{ settings: { privacyMode: true } }`.
- Username unavailable or `ANONYMOUS`: field omitted, never rendered as empty string or `undefined`. Test: Task 2, inject `#ajaxUserStatus` with `ANONYMOUS`.
- Long lab title: both `details` and `state` stay within 128 characters. Test: Task 1, set `document.title` to a 200-character title.

---

### Task 1: Scaffold activity and public page routing

**Files:**
- Create: `websites/P/PortSwigger Web Security Academy/metadata.json`
- Create: `websites/P/PortSwigger Web Security Academy/presence.ts`
- Create: `websites/P/PortSwigger Web Security Academy/presence.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces in `presence.ts`:
  - `type PageKind = 'home' | 'lab' | 'article' | 'index' | 'learningPath' | 'dashboard' | 'hallOfFame' | 'other'`
  - `interface ActivitySettings` with `showTimestamp`, `showButtons`, `privacyMode`, `showRank`, `showProgress`, `showLevel`, `showUsername`, `showDifficulty`, all `boolean`
  - `function clamp(value: string, max?: number): string`
  - `function getPageKind(pathname: string): PageKind`
  - `function getTopic(): string | null`
  - `function getLabTitle(): string | null`
  - `async function readSettings(): Promise<ActivitySettings>`

- [ ] **Step 1: Create `metadata.json` with the exact Global Constraints values**

Include `settings` entries for all eight ids from `ActivitySettings`, with `showTimestamp: true`, `showButtons: true`, `privacyMode: false`, `showRank: true`, `showProgress: true`, `showLevel: true`, `showUsername: true`, `showDifficulty: false`. Use icon strings from Font Awesome 6 (`fa-solid fa-clock`, `fa-solid fa-link`, `fa-solid fa-user-lock`, `fa-solid fa-ranking-star`, `fa-solid fa-chart-simple`, `fa-solid fa-award`, `fa-solid fa-user`, `fa-solid fa-signal`).

- [ ] **Step 2: Add failing tests for public pages and privacy**

In `presence.test.ts`, add tests using `premid/test`:
- `test('browsing the academy home', ...)` — goto `https://portswigger.net/web-security`, expect `details: 'Browsing PortSwigger Academy'`.
- `test('browsing a lab anonymously', ...)` — goto `https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data`, expect `details` to start with `Solving Lab: ` and contain the page title after stripping the `Lab: ` prefix and the ` | Web Security Academy` suffix.
- `test('reading a topic article', ...)` — goto `https://portswigger.net/web-security/sql-injection/union-attacks`, expect `details` to start with `Reading: `.
- `test('browsing an index page', ...)` — goto `https://portswigger.net/web-security/all-labs`, expect `details` to be `Browsing: All labs`.
- `test('following a learning path', ...)` — goto `https://portswigger.net/web-security/learning-paths/sql-injection`, expect `details` to start with `Following learning path: `.
- `test('privacy mode hides lab details', { settings: { privacyMode: true } }, ...)` — goto the lab page, expect `details: 'Browsing PortSwigger Academy'`, `state` absent, `buttons` absent, `startTimestamp` absent.
- `test('long lab title is clamped', ...)` — use `page.evaluate` to set `document.title` to a 200-character string ending in ` | Web Security Academy`, then expect `details.length <= 128` and, if present, `state.length <= 128`.
- `test('buttons can be disabled', { settings: { showButtons: false } }, ...)` — goto the lab page, expect `buttons` absent.

Use the existing `nextPresence` polling helper pattern from `websites/S/SPWN/presence.test.ts` (20 attempts) for assertions that depend on a populated field.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx pmd test "PortSwigger Web Security Academy"`
Expected: FAIL — activity has no `presence.ts` yet.

- [ ] **Step 4: Declare the Presence instance, types, and helpers**

Create `presence.ts` with `new Presence({ clientId: 'PORT SWIGGER CLIENT ID' })` as the first statement. Then add the exported `PageKind`, `ActivitySettings`, and the helpers `clamp`, `getPageKind`, `getTopic`, `getLabTitle`, `readSettings`.

`getPageKind` rules: `/web-security` → `home`; path contains `/all-topics`, `/all-labs`, `/all-materials` → `index`; contains `/learning-paths` → `learningPath`; contains `/dashboard` → `dashboard`; contains `/hall-of-fame` → `hallOfFame`; last segment starts with `lab-` → `lab`; otherwise with two or more segments → `article`; else `other`.

`getTopic` returns the second breadcrumb `ul.breadcrumb-list span[itemprop="name"]` value, or `null`.
`getLabTitle` strips a leading `Lab: ` and the trailing ` | Web Security Academy` / ` | Web Security Academy - PortSwigger` suffix from `document.title`, or returns `null` when the page is not a lab.
`readSettings` reads all eight settings with `Promise.all`.

Replace `'PORT SWIGGER CLIENT ID'` with the real Discord application id before committing.

- [ ] **Step 5: Implement the `UpdateData` handler**

In `presence.on('UpdateData', ...)`:
- build `presenceData` with `largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PortSwigger%20Web%20Security%20Academy/assets/logo.png'` and `largeImageText: 'PortSwigger Web Security Academy'`,
- set `smallImageKey` to `Assets.Reading` on `article`, `Assets.Play` on `lab`, `Assets.Viewing` on `index`/`home`,
- set `details` as follows: `article` → `Reading: <topic>` with `state` = `h1.heading-2`; `index` → `Browsing: <page name>` from a fixed map (`All labs`, `All topics`, `All materials`) with no `state`; `learningPath` → `Following learning path: <path name>` derived from the second path segment with hyphens replaced by spaces, with `state` = `h1.heading-2` when present; `home`/`other` → `Browsing PortSwigger Academy` with no `state`,
- set `startTimestamp` only when `showTimestamp` is true,
- set `buttons` to one entry labelled `View page` with `url: document.location.href` only when `showButtons` is true,
- apply `privacyMode` last by overwriting `details`, then `delete` `state`, `startTimestamp`, `smallImageKey`, `smallImageText`, and `buttons`,
- clamp both `details` and `state`, then call `presence.setActivity(presenceData)`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx pmd test "PortSwigger Web Security Academy"`
Expected: PASS for the eight Task 1 tests.

- [ ] **Step 7: Commit**

```bash
git add "websites/P/PortSwigger Web Security Academy"
git commit -m "feat(PortSwigger Academy): add activity scaffold and public page presence"
```

---

### Task 2: Add account stats and lab solved state

**Files:**
- Modify: `websites/P/PortSwigger Web Security Academy/presence.ts`
- Modify: `websites/P/PortSwigger Web Security Academy/presence.test.ts`

**Interfaces:**
- Consumes: `PageKind`, `ActivitySettings`, `clamp`, `getPageKind`, `getLabTitle` from Task 1.
- Produces:
  - `interface AccountStats { rank: string | null; percent: string | null; solved: number | null; level: string | null; username: string | null }`
  - `function getAccountStats(): AccountStats`
  - `function getLabDifficulty(): string | null`
  - `function isLabSolved(): boolean`

- [ ] **Step 1: Add failing tests with injected widget DOM**

In `presence.test.ts`, add:
- `test('dashboard shows level and solved progress', ...)` — goto `/web-security/dashboard`, then `page.evaluate` to insert `<div id="AcademyAccountStatusWidget"><div class="progress-with-percent"><text>3%</text></div><div class="apprentice-progress"><div class="radial-text-element__progress">2</div></div><div class="practitioner-progress"><div class="radial-text-element__progress">7</div></div><div class="expert-progress"><div class="radial-text-element__progress">0</div></div><div class="lab-level-display__newbie">NEWBIE</div></div>`. Expect `state` to contain `Rank` only if rank present, `Level: NEWBIE`, `Solved: 9`, and `3%`.
- `test('hall of fame shows current rank', ...)` — goto `/web-security/hall-of-fame`, inject `<h4 id="currentUserRank">Your rank: # 383107</h4>` and `<div id="ajaxUserStatus">You're showing as ANONYMOUS</div>`. Expect `state` to contain `Rank: #383107` and not to contain `ANONYMOUS`.
- `test('hall of fame omits username when anonymous', ...)` — reuse the injected DOM above; expect `details` not to contain `Username:` and not to contain the string `undefined`.
- `test('lab widget shows solved state and difficulty', ...)` — goto the lab page, inject `<p class="widget-container-labelevel"><span>APPRENTICE</span></p>` and `<div class="widgetcontainer-lab-status is-solved"><span class="lab-status-icon">Solved</span></div>`. With default settings expect `state` to contain `Solved`; with `{ settings: { showDifficulty: true } }` expect `state` to start with `APPRENTICE · `.
- `test('lab widget absent does not break presence', ...)` — goto the lab page without injecting widgets; expect `details` unchanged from Task 1 and `state` not to contain `Solved`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx pmd test "PortSwigger Web Security Academy"`
Expected: FAIL — new assertions for account fields.

- [ ] **Step 3: Implement the three DOM helpers**

- `getAccountStats()` reads `#currentUserRank` text and extracts the digits after `#`; reads `#ajaxUserStatus` text and takes the name after `You're showing as ` only when it is not `ANONYMOUS`; reads `#AcademyAccountStatusWidget .progress-with-percent text` for percent; sums `.apprentice-progress .radial-text-element__progress`, `.practitioner-progress .radial-text-element__progress`, and `.expert-progress .radial-text-element__progress` for solved; reads the text of the first element whose class starts with `lab-level-display__` for level. Return `null` for every missing value.
- `getLabDifficulty()` returns the text of `p.widget-container-labelevel span`, title-cased, or `null`.
- `isLabSolved()` returns whether `.widgetcontainer-lab-status.is-solved` exists, or whether `span.lab-status-icon` text is `Solved`.

- [ ] **Step 4: Wire the helpers into the `UpdateData` handler**

- On `dashboard`: `details` is `Username: ${username}` when `showUsername` and username exist, otherwise `Browsing dashboard`. `state` is the non-null parts of `Rank: #...`, `Level: ...`, `Solved: ...`, `...%` joined with ` | `, each part gated by its setting (`showRank`, `showLevel`, `showProgress`). Delete `state` when no parts remain.
- On `hallOfFame`: `details` is `Viewing Hall of Fame`; `state` is `Rank: #...` when `showRank` and rank exist. When `showUsername` and username exist, append it to `details` after `Username: `.
- On `lab`: `state` is `Solved` or `In progress`. When `showDifficulty` and difficulty exist, prefix with `${difficulty} · `.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx pmd test "PortSwigger Web Security Academy"`
Expected: PASS for all Task 1 and Task 2 tests.

- [ ] **Step 6: Commit**

```bash
git add "websites/P/PortSwigger Web Security Academy"
git commit -m "feat(PortSwigger Academy): show lab progress and account stats"
```

---

### Task 3: Assets, lint, and submission evidence

**Files:**
- Modify: `websites/P/PortSwigger Web Security Academy/metadata.json`

**Interfaces:**
- Consumes: `metadata.json` from Task 1.
- Produces: final image URLs used in `metadata.json` and `presence.ts`.

- [ ] **Step 1: Finalise the two image URLs**

Use `https://cdn.rcd.gg/PreMiD/websites/P/PortSwigger%20Web%20Security%20Academy/assets/logo.png` and `.../thumbnail.png`. If the reviewer requires Imgur hosting instead, replace both with the user-supplied `i.imgur.com` URLs. Keep the same URL in `metadata.json` `logo` and in `presence.ts` `largeImageKey`.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS with no new errors in the activity folder.

- [ ] **Step 3: Run the full activity tests**

Run: `npx pmd test "PortSwigger Web Security Academy"`
Expected: PASS for all tests.

- [ ] **Step 4: Capture required screenshots**

With PreMiD connected to `portswigger.net`, capture a side-by-side screenshot of the Discord profile and the site on a lab page, plus screenshots of the activity settings panel. Save them outside the repo and attach them to the PR description.

- [ ] **Step 5: Commit and verify branch state**

```bash
git add "websites/P/PortSwigger Web Security Academy/metadata.json"
git commit -m "chore(PortSwigger Academy): finalise assets and validate activity"
git status --short --branch
```

Expected: clean working tree on `feat/portswigger-academy`.

After this task, log out of `portswigger.net` and log back in to invalidate the session cookie that was shared in chat.
