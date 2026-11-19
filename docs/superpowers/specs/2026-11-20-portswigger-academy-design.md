# PortSwigger Web Security Academy — activity design

Date: 2026-11-20
Branch: `feat/portswigger-academy`
Status: awaiting approval

## Intent

Add a PreMiD activity for `https://portswigger.net/web-security`. Show what the user is studying, and when logged in, show account statistics. Mirror the shape of the existing HackTheBox activity rather than inventing a new presence language.

## Goals

- Show the exact lab being worked on: `Solving Lab: '<title>'`, matching HackTheBox's `Solving Challenge: '<nama>'`.
- Show level, solved counts, completion percent, Hall of Fame rank, and username where the site exposes them.
- Work anonymously: public page context still works without an account.
- Give the user switches for timestamp, buttons, privacy mode, and each account field.

## Non-goals

- No lab solution text. It is answer content and does not fit a 128-character field.
- No lab host, lab session URL, or launch link. Those identify a live lab instance.
- No new login flow. PreMiD reads the DOM of the page the user is already on.
- No writes to PortSwigger: no POSTs, no "show yourself" toggle, no lab launch.
- No badges or rank from other users. Only the current user's own row.

## Constraints

- Files: `metadata.json` + `presence.ts` only, under `websites/P/PortSwigger Web Security Academy/`.
- Use `document.location`, never `window.location`.
- Clamp `details` and `state` to 128 characters.
- Read the DOM after widget injection; tolerate an empty widget on first tick.
- Images must be hosted on `i.imgur.com` or `cdn.rcd.gg/PreMiD/...`, 512x512.
- `url` has no protocol and no query. `version` starts at `1.0.0`.
- Buttons must not point only to the homepage.

## Approaches considered

| Approach | Trade-off | Verdict |
|---|---|---|
| A — HackTheBox parity | Stats live where the site exposes them; no cross-page cache | Chosen |
| B — Persistent account strip | Needs `localStorage` cache; can go stale | Rejected |
| C — Lab-only focus | Drops the account stats the user asked for | Rejected |

Chosen: **A**. It matches the user's "sama seperti di HTB" requirement and needs no cache.

## Verified data sources

All selectors below were checked against authenticated page HTML and the site's own `POST /api/widgets` responses on 2026-11-20. Widget HTML is injected after `DOMContentLoaded`.

| Field | Page | Selector / source | Example value |
|---|---|---|---|
| Page title | all | `document.title` | `Lab: SQL injection vulnerability ... \| Web Security Academy` |
| Topic | topic, lab | `ul.breadcrumb-list span[itemprop="name"]` | `SQL injection` |
| Heading | article, index | `h1.heading-2` | `SQL injection` |
| Lab title | lab | `document.title`, strip `Lab: ` prefix | `SQL injection vulnerability in WHERE clause ...` |
| Lab difficulty | lab | `p.widget-container-labelevel span` | `APPRENTICE` |
| Solved state | lab | `.widgetcontainer-lab-status.is-solved` / `span.lab-status-icon` | `Solved` |
| Completion percent | dashboard | `#AcademyAccountStatusWidget .progress-with-percent text` | `3%` |
| Solved counts | dashboard | `.apprentice-progress .radial-text-element__progress`, `.practitioner-progress ...`, `.expert-progress ...` | `2`, `7`, `0` |
| Level | dashboard | `.lab-level-display__newbie` etc. | `NEWBIE` |
| Rank | hall of fame | `#currentUserRank` | `Your rank: # 383107` |
| Username | hall of fame | `#ajaxUserStatus` | `You're showing as ANONYMOUS` or `You're showing as <name>` |

Notes:

- PortSwigger has no XP field. Use level + total solved instead.
- Username is only present on Hall of Fame, and only when the user has chosen to show it. Current value is `ANONYMOUS`. Omit the field when unavailable.
- `academy-accountstatus` is injected only on `/dashboard`; `academy-labinfo` only on lab pages; `#currentUserRank` only on `/hall-of-fame`. Do not cache them.

## Presence fields by page kind

| Page kind | `details` | `state` |
|---|---|---|
| Lab | `Solving Lab: '<title>'` | `Solved` or `In progress`; optional `<Difficulty> · ` prefix |
| Topic / subtopic / article | `Reading: <topic>` | `<heading>` |
| All labs / all topics / all materials | `Browsing: <page name>` | omitted |
| Learning path | `Following learning path: <name>` | lesson heading when present |
| Dashboard | `Username: <name>` when visible, else `Browsing dashboard` | `Rank: #383107 \| Level: NEWBIE \| Solved: 9 \| 3%` |
| Hall of Fame | `Viewing Hall of Fame` | `Your rank: #383107` |
| Home / unknown | `Browsing PortSwigger Academy` | omitted |

## Settings

| id | Default | Effect |
|---|---|---|
| `showTimestamp` | true | Adds elapsed browsing timestamp |
| `showButtons` | true | Adds one "View page" button to `document.location.href` |
| `privacyMode` | false | Collapses to `Browsing PortSwigger Academy`, deletes `state`, `startTimestamp`, `buttons` |
| `showRank` | true | Rank on Hall of Fame |
| `showProgress` | true | Solved counts and percent on dashboard |
| `showLevel` | true | Level name on dashboard |
| `showUsername` | true | Username when available |
| `showDifficulty` | false | Lab difficulty prefix, off because widget-generated |

## Metadata values

- `service`: `PortSwigger Web Security Academy`
- `url`: `portswigger.net`
- `regExp`: `^https?[:][/][/](?:www[.])?portswigger[.]net[/]web-security`
- `color`: `#FF6633`, from the official Academy logo SVG
- `category`: `other`
- `tags`: `web-security`, `cybersecurity`, `learning`
- `version`: `1.0.0`
- Logo and thumbnail: official Academy artwork rehosted as square 512x512 PNGs

## Left to the builder

- Exact copy strings and which CDN path to use for assets.
- Clamp helper and selector guard implementation.
- Any small selector adjustments found during local browser testing.

## Security note

The session cookie for this account was pasted into the chat transcript. After this work is done, log out of `portswigger.net` and log back in to invalidate that session. No cookie file is kept in the repo or in `/tmp/opencode`.
