# PortSwigger Web Security Academy — PreMiD activity research

Date: 2026-11-20
Branch: `feat/portswigger-academy`
Scope: investigation only. No product code, presence files, metadata files or commits were changed.

## 0. Method and primary sources

All site facts below come from the live official site at `https://portswigger.net` and from this repository's own guidelines and reference activities. No blog summaries were used.

Evidence gathered from:

- Full page fetches of the Academy home, topic index, topic page, subtopic page, all-labs, learning paths, dashboard, getting-started, certification, Hall of Fame, mystery lab, and a concrete lab page.
- Raw HTML of the same pages (saved under `/tmp/opencode/psa-*.html` during research).
- The site's own first-party bundles `main.js` and `web-security.js`.
- The site's own first-party JSON endpoint `POST https://portswigger.net/api/widgets`, called anonymously (no `Cookie`, no `Authorization`).
- `curl` status checks of the lab launch endpoint.
- `grep` over the whole `activities` repo for `portswigger`.

## 1. URL structure and page types

Everything of interest lives on the apex domain `portswigger.net`. `www.portswigger.net` 301-redirects to the apex (`curl -sI https://www.portswigger.net/web-security` → `301 Location: https://portswigger.net/web-security`), so one `url` value in metadata is enough.

### 1.1 Top-level Academy routes

| Route | Page type | Evidence |
|---|---|---|
| `/web-security` | Academy home / landing | `https://portswigger.net/web-security` |
| `/web-security/all-topics` | Topic index, grouped into Server-side / Client-side / Advanced | `https://portswigger.net/web-security/all-topics` |
| `/web-security/all-materials` | All learning materials index | `<title>All learning materials \| Web Security Academy</title>` at `https://portswigger.net/web-security/all-materials` |
| `/web-security/all-labs` | All labs index, grouped by topic, lab rows injected by widgets | `https://portswigger.net/web-security/all-labs` |
| `/web-security/learning-paths` | Learning paths index, one widget `academy-available-learning-paths` | `/tmp/opencode/psa-learning-paths.html:168`; `https://portswigger.net/web-security/learning-paths` |
| `/web-security/dashboard` | User dashboard ("Your learning progress") | `https://portswigger.net/web-security/dashboard` |
| `/web-security/hall-of-fame` | Public leaderboard | `<title>Hall of Fame - Web Security Academy</title>` at `https://portswigger.net/web-security/hall-of-fame` |
| `/web-security/getting-started` | Beginner guide | `<title>Getting started \| Web Security Academy - PortSwigger</title>` at `https://portswigger.net/web-security/getting-started` |
| `/web-security/certification` and `/web-security/certification/*` | BSCP exam info | `https://portswigger.net/web-security/certification` |
| `/web-security/mystery-lab-challenge` | Randomized lab challenge entry | `<title>Mystery lab challenge \| Web Security Academy - PortSwigger</title>` at `https://portswigger.net/web-security/mystery-lab-challenge` |
| `/web-security/lab-telemetry-privacy-notice` | Privacy notice | `https://portswigger.net/web-security/lab-telemetry-privacy-notice` |

### 1.2 Topic and subtopic routes

Topic pages use a flat slug directly under `/web-security/`, e.g. `/web-security/sql-injection`, `/web-security/cross-site-scripting`, `/web-security/ssrf`, `/web-security/llm-attacks`, `/web-security/web-cache-deception`, `/web-security/api-testing`, `/web-security/nosql-injection`. Source: the "All topics" list at `https://portswigger.net/web-security`.

Subtopics nest under the topic slug, e.g.:

- `/web-security/sql-injection/union-attacks` — `<title>SQL injection UNION attacks | Web Security Academy</title>`
- `/web-security/sql-injection/blind`
- `/web-security/sql-injection/examining-the-database`
- `/web-security/sql-injection/cheat-sheet`

Source: side navigation on `https://portswigger.net/web-security/sql-injection`.

Lab pages also nest under the topic slug:

- `/web-security/sql-injection/lab-retrieve-hidden-data`
- `<title>Lab: SQL injection vulnerability in WHERE clause allowing retrieval of hidden data | Web Security Academy</title>`

Source: `https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data` and `/tmp/opencode/psa-lab.html:7`.

### 1.3 Learning path routes

Paths use `/web-security/learning-paths/<path-slug>` and deep lesson routes of the form `/web-security/learning-paths/<path-slug>/<step>/<topic>/<page>`. Examples extracted from the first-party widget response: `/web-security/learning-paths/sql-injection`, `/web-security/learning-paths/server-side-vulnerabilities-apprentice`, `/web-security/learning-paths/api-testing`, `/web-security/learning-paths/llm-attacks`.

Source: anonymous `POST /api/widgets` with `Widget-Source: /web-security/learning-paths` and body `[{"widgetId":"academy-available-learning-paths","additionalData":{}}]`, plus `<title>SQL injection - PortSwigger</title>` and `<title>Server-side vulnerabilities - PortSwigger</title>` from direct fetches. A sample deep lesson URL returned `Error - PortSwigger` on direct anonymous fetch, so deep lesson routes are **unverified** and should not be a primary detection case.

### 1.4 Launch route (external lab environment)

`GET /academy/labs/launch/<64-hex-lab-id>?referrer=<url-encoded source path>` — this is the "ACCESS THE LAB" action rendered by the `academy-launchlab` widget. It is a redirect, not a content page. See section 3.

## 2. Rendering model and route detection

**Verdict: server-rendered, conventional full-page navigation. Not a SPA.**

Evidence:

- Every URL returns its own complete HTML document with its own `<title>`, `<link rel="canonical" ...>` and `<body>` (e.g. `/tmp/opencode/psa-lab.html:7`, `/tmp/opencode/psa-all-labs.html:7,23`).
- Only classic script bundles are loaded: `/bundles/static-content/public/scripts/main.js?v=...` and `/bundles/static-content/public/scripts/web-security.js?v=...` (`/tmp/opencode/psa-lab.html:312-313`). No `__NEXT_DATA__`, no `ng-`, no `vue`, no React root/hydration marker was found in the raw HTML.
- Both bundles contain no `pushState`, `replaceState` or `popstate` usage (grep over `/tmp/opencode/psa-main.js` and `/tmp/opencode/psa-web-security.js` returned no matches). `web-security.js` is sticky-sidebar code; `main.js` runs on `DOMContentLoaded`.
- Content is present in the initial HTML for normal pages: `<h1 class="heading-2">` on topic/lab/index pages (`/tmp/opencode/psa-lab.html:257`, `/tmp/opencode/psa-all-labs.html:271`), and `ul.breadcrumb-list` with `itemprop="name"` breadcrumbs (`/tmp/opencode/psa-lab.html:255`).

Implication for PreMiD: `presence.on('UpdateData', ...)` reading `document.location.pathname` is sufficient. No hash-based router and no SPA navigation hook are required. Note that index/lab **lists** are hydrated after `DOMContentLoaded` via the widget API (section 4), so DOM reads of list rows must tolerate a brief empty state or fall back to URL/title.

## 3. PUBLIC vs LOGIN-ONLY — verdict with evidence

### 3.1 What is public (no login)

Anonymous fetches (no cookies supplied) succeeded for:

- Academy home, `/all-topics`, `/all-materials`, `/all-labs`, `/getting-started`, `/dashboard`, `/hall-of-fame`, `/certification`, `/mystery-lab-challenge`, topic pages, subtopic pages, cheat sheets, and individual lab pages.
- Full article text and worked "Solution" blocks on lab pages. Example: `/tmp/opencode/psa-lab.html:267-278` contains a three-step solution in the initial HTML, available anonymously.
- Lab title, difficulty and lab URL from the first-party widget API, anonymously.

The home page states the model explicitly: "You can access everything (for free) and track your progress by creating an account" — `https://portswigger.net/web-security`.

### 3.2 What requires login

**Launching/solving labs requires login.** Anonymous `GET` of the launch URL returned:

```
302 https://portswigger.net/users?returnurl=%2Facademy%2Flabs%2Flaunch%2F...
```

Repeated after first visiting the lab page with a cookie jar (`curl -c` then `curl -b`): still `302` to `/users`. Source: `curl` checks against `https://portswigger.net/academy/labs/launch/d9a071d8264e85184722707ff5747bbbd77963967d1d01f1b22f5dd8252f9767?referrer=%2fweb-security%2fsql-injection%2flab-retrieve-hidden-data`.

The site says so itself, in HTML returned by its own widget API: "Sign in or create a free account to access our interactive, deliberately vulnerable labs, and track your learning progress." Source: anonymous `POST /api/widgets`, `Widget-Source: /web-security/learning-paths`, body `[{"widgetId":"academy-available-learning-paths","additionalData":{}}]`.

**Progress tracking requires login.** The anonymous `/web-security/dashboard` renders the heading "Your learning progress" but no progress data — `https://portswigger.net/web-security/dashboard`. The "Getting started" page frames progress as an account feature: "Progress from Apprentice to Expert level, and track your rank on our Hall of Fame" — `https://portswigger.net/web-security/getting-started`.

**Practical reading:** reading material, lab descriptions, lab solutions, lab titles and lab difficulty are public. Logging in is needed to actually launch a lab environment and to record progress. A privacy-first rich-presence activity therefore does **not** need login — it must simply never read or display progress/solved state.

## 4. Concrete, stable facts a presence could display

### 4.1 DOM-extractable (from initial HTML)

| Fact | Selector / source | Stability | Notes |
|---|---|---|---|
| Full page title | `document.title` | High | Suffix varies: `\| Web Security Academy` on topic/home pages, `\| Web Security Academy - PortSwigger` on learning-path/getting-started pages. Strip both suffixes. |
| Page heading | `h1.heading-2` | Medium-high | Plain semantic class, not hashed. Present on home/index/topic/lab pages (`/tmp/opencode/psa-lab.html:257`). |
| Breadcrumb trail | `ul.breadcrumb-list li span[itemprop="name"]` | High | Schema.org markup; e.g. `Web Security Academy` → `SQL injection` → `Lab` (`/tmp/opencode/psa-lab.html:255`). Ideal for topic name without parsing slugs. |
| Topic-group headings | `h2` inside `#all-labs` | Medium-high | e.g. `SQL injection` (`/tmp/opencode/psa-all-labs.html:278`). |
| Sidebar section labels | `aside.nav-lhs`, `a` text | Medium-high | Stable class name (`/tmp/opencode/psa-lab.html:151`). |
| Article body / solution | `div.section`, `details > summary` | Medium-high | Not needed for presence; avoid quoting solutions. |

### 4.2 DOM-extractable after widget hydration (client-side)

| Fact | Selector / source | Stability | Notes |
|---|---|---|---|
| Lab title (all-labs list) | `[widget-id="academy-labstatus"] a` text | Medium | Vendor-generated HTML from first-party API. Class `widgetcontainer-lab-link`, inner `a`. Text has no `Lab: ` prefix. |
| Lab difficulty (all-labs list) | `[widget-id="academy-labstatus"] span.label-light-green-small` | Medium | Uppercase label, e.g. `APPRENTICE`. |
| Lab difficulty (lab page) | `[widget-id="academy-labinfo"] .widget-container-labelevel span` | Medium | Same uppercase level label. |
| Learning path names | `[widget-id="academy-available-learning-paths"]` contents | Medium | Contains login-banner text plus cards with `h5` path names. |

Evidence (anonymous `POST /api/widgets`, `Widget-Source: /web-security/all-labs`, body requesting `academy-labstatus` for lab id `D9A071D8...`) returned:

```html
<div class="widgetcontainer-lab-link " id=d9a071d...>
  <span>LAB</span>
  <div class="flex-columns">
    <span class="label-light-green-small">APPRENTICE</span>
    <a href="/web-security/sql-injection/lab-retrieve-hidden-data">SQL injection vulnerability in WHERE clause allowing retrieval of hidden data</a>
  </div>
</div>
```

And for `academy-labinfo` on the lab page:

```html
<p class="widget-container-labelevel">
  <span class="label-light-green-small">APPRENTICE</span>
</p>
```

Level names are documented by the site as a progression "from Apprentice to Expert level" (`https://portswigger.net/web-security/getting-started`). The widget returns an uppercase label (e.g. `APPRENTICE`); title-casing it locally is safe.

**Flag:** `label-light-green-small`, `widgetcontainer-lab-link` and `widget-container-labelevel` are vendor-authored but *semantic* (not hashed CSS-in-JS). They can change without notice because they are injected by a JSON endpoint. Prefer `document.title` and breadcrumbs as primary sources; treat widget selectors as optional enhancement with a fallback.

### 4.3 URL-derived values

| Fact | Derivation | Stability |
|---|---|---|
| Page kind (`home`, `all-topics`, `all-labs`, `topic`, `subtopic`, `lab`, `learning-path`, `dashboard`, `other`) | First and second path segments under `/web-security` | High |
| Topic slug → human label | Known slug map, or prefer breadcrumb `span[itemprop="name"]` | High for slugs; breadcrumb better |
| Lab slug → title | Last path segment, e.g. `lab-retrieve-hidden-data` → "Retrieve hidden data" | Medium; prefer `document.title` |
| Learning path slug | Second segment after `learning-paths` | High |

### 4.4 Explicitly do NOT display

- Solved / unsolved state, completed-page checkboxes, XP, rank, streak, list progress. Dashboard progress is account-gated, and the `academy-labstatus` widget returned no solved marker anonymously. Repo pattern for the analogous case is to hide profile-identifying data behind a setting (`websites/Y/YesWeHack Dojo/dist/presence.js:2`, source map `hideProfileName`).
- The lab solution text, even though public. It is answer content, not presence context.
- Lab environment hostnames / session identifiers from `academy-launchlab`.

## 5. Repo conventions relevant to this activity

From `.github/CONTRIBUTING.md`:

- Activity must relate to the website and must not be low-context/logo-only (`.github/CONTRIBUTING.md:16,27`).
- Use `document.location`, not `window.location` (`:225`). Prefer native helpers over custom getter functions (`:227`, `:26`).
- File structure is exactly `metadata.json` + `presence.ts` (+ optional `iframe.ts`) (`:36-51`).
- All metadata images must be on `i.imgur.com`; using site-hosted images is not permitted (`:125`). Logo must be square 512×512 (`:172-173`); assets 512×512 (`:226`).
- `url` has no protocol and no query string (`:160-164`). Version starts at `1.0.0` (`:168`). At least one lowercase, no-space tag (`:186-188`). Category must match content (`:190-193`).
- Omit fields that use default values (`:123`).
- HTTP requests allowed only to `premid.app` or the activity website's own API (`:231`) — `/api/widgets` would be in scope, but DOM-only reading is simpler and avoids a request.
- Use `delete` rather than assigning `undefined` (`:232`).
- Buttons must not just redirect to the main page and must not promote the site (`:236-240`).
- Activity directory sorts under `P` for `PortSwigger ...` (`:301`).
- Screenshots required: side-by-side profile + site, plus settings screenshots (`:286-287`).

Reference presences:

- `websites/H/HTB Academy/presence.ts:1-61` — minimal `Presence`, `document.location.pathname`, `pathname.includes(...)` branches, `document.querySelector(...).textContent`, single `largeImageKey` CDN asset. `metadata.json:8-22` uses `service`, `url`, `regExp`, `version`, `logo`, `thumbnail`, `color`, `category: other`, two tags, no settings.
- `websites/H/HackTheBox/presence.ts:1-237` — central `ASSETS` map (`:11-23`), settings read via `Promise.all` (`:101-112`), path segmentation (`:114-117`), smallImage icon per page type, single `setActivity` at the end (`:236`). `metadata.json:14-47` shows boolean settings with `id`/`title`/`icon`/`value`.

Privacy-first pattern from recent YesWeHack Dojo PR (built artifact `websites/Y/YesWeHack Dojo/dist/presence.js:1-2`, original source embedded in the source map on line 2):

- settings `showTimestamp`, `showButtons`, `privacyMode`, `hideProfileName`;
- `clamp(value, max = 128)` applied to both `details` and `state`;
- `delete presenceData.startTimestamp` when timestamp disabled;
- `privacyMode` collapses everything to a generic "Browsing Dojo";
- `shouldShowButton()` suppresses the "View page" button in privacy mode or on profile pages;
- no account-name/profile reads by default.

The 128-character cap is also noted directly in-repo at `websites/H/HeiwaStream/presence.ts:25-26`.

**Existing activity check:** `grep -i "portswigger"` across the whole repo returned **No matches found**. No PortSwigger activity exists in this branch.

## 6. Assets and metadata values

Official brand assets are publicly served by the site:

- Academy logo: `https://portswigger.net/web-security/images/landing-page/web-security-academy-logo.svg` — an SVG `viewBox="0 0 250.2 85"` (wide, not square) using fill `#FF6633` (source: raw SVG fetched from that URL).
- PortSwigger footer logo: `https://portswigger.net/_static-content/_ps-components/0.3.0/fragments/footer/portswigger-logo.svg` (source: footer markup at `https://portswigger.net/web-security`).
- Landing-page promo imagery and screenshots exist under `/web-security/images/landing-page/` and `/web-security/dashboard/images/` (source: `https://portswigger.net/web-security`).

Per `.github/CONTRIBUTING.md:125`, these must be re-hosted on `i.imgur.com` (or the repo's established `cdn.rcd.gg/PreMiD/...` convention seen at `websites/H/HackTheBox/metadata.json:21-22`) as 512×512 PNGs before use; the wide SVG must be padded/exported to square.

Suggested metadata values (research recommendation, not code):

- `service`: `PortSwigger Web Security Academy` (directory `websites/P/PortSwigger Web Security Academy`).
- `url`: `portswigger.net`.
- `regExp`: `^https?[:][/][/](?:www[.])?portswigger[.]net[/]web-security` (narrower than whole-domain if reviewers prefer; guideline `:24` permits narrowing when other content is unrelated).
- `color`: `#FF6633` (from the official Academy logo SVG).
- `category`: `other` (matches both reference presences: `websites/H/HackTheBox/metadata.json:24`, `websites/H/HTB Academy/metadata.json:19`).
- `tags`: `web-security`, `cybersecurity`, `learning` (lowercase, no spaces — guideline `:187`).
- `version`: `1.0.0`.
- Settings: `showTimestamp`, `showButtons`, `privacyMode`, `showTopic` (topic/breadcrumb), `showDifficulty` (lab level only).

## 7. Design options

All options clamp `details` and `state` to 128 characters, use `document.location`, read only public DOM, and never read progress/solved state.

### Option A — "Page and topic" (breadth-first, no widget dependency)

- `details`: page kind + topic from breadcrumb, e.g. `Reading: SQL injection` / `Browsing: All labs` / `Viewing lab`.
- `state`: heading or lab title from `document.title`, e.g. `Lab: SQL injection vulnerability in WHERE clause allowing retrieval of hidden data`.
- `smallImageText`: `Reading` / `Browsing` / `Lab`.
- Buttons: optional "View page" to `document.location.href`.
- Timestamp: browsing start, toggleable.
- Settings: `showTimestamp`, `showButtons`, `privacyMode`, `showTopic`.
- Privacy: no account data, no widget reads, no progress.
- User value: accurate "what are you studying" signal across every public page; most robust to site changes.
- Weakness: no difficulty signal.

### Option B — "Study session with lab level" (recommended)

Everything from Option A, plus:

- `state` on lab pages: `${difficulty} · ${labTitle}` using the widget-rendered level when present, falling back to just the title. Example: `Apprentice · SQL injection vulnerability in WHERE clause allowing retrieval of hidden data` (well under 128 chars).
- `state` on all-labs: hovered/current topic group from `h2#<slug>` when detectable; otherwise `All labs`.
- `smallImageText`: `Learning` / `Browsing` / `Challenging`.
- Settings: `showTimestamp`, `showButtons`, `privacyMode`, `showTopic`, `showDifficulty` (default off).
- Privacy: `showDifficulty` is public metadata only; no solved/completed/user data. When `privacyMode` is on, collapse to `Browsing PortSwigger Academy` and delete timestamp + buttons.
- User value: shows *what* vulnerability class and *how hard* the lab is — genuinely useful to peers and self-quantifiable, while staying public-data only.
- Weakness: difficulty comes from hydrated widget HTML, so needs a null-safe fallback.

### Option C — "Learning path navigator"

- `details`: `Following learning path: <path name>` from the path widget or URL slug.
- `state`: lesson heading from `h1`/breadcrumb, e.g. `What is SQL injection?`.
- Settings: same as B plus `showPathName`.
- Privacy: same; path names and lesson headings are public.
- User value: best for structured learners.
- Weakness: learning-path pages are the thinnest, least stable surface (widget-rendered list, deep lesson URLs returned `Error` anonymously). Should be a fallback branch, not the core.

## LOGIN REQUIRED: YES/NO

**NO — not for the proposed activity.** Every field the recommended presence reads is available anonymously: page title (`document.title`), heading (`h1.heading-2`), breadcrumbs (`ul.breadcrumb-list span[itemprop=name]`), and the public lab difficulty/title widgets (`POST /api/widgets`, or the DOM they inject). Anonymous HTTP fetches of all relevant pages succeeded, and the home page says "You can access everything (for free) and track your progress by creating an account" (`https://portswigger.net/web-security`).

**YES — only if you want to launch/solve labs or track progress.** Anonymous `GET` of `/academy/labs/launch/<id>` returns `302` to `/users` (reproduced with and without a session cookie), and the site's own learning-path widget says "Sign in or create a free account to access our interactive, deliberately vulnerable labs, and track your learning progress." The anonymous dashboard shows "Your learning progress" with no data.

Therefore: users do **not** need a PortSwigger account for this presence to work. The activity must avoid reading dashboard progress, solved state, rank, or any account-identifying data.

## Recommended design

Choose **Option B**, with the YesWeHack Dojo privacy pattern:

- `details` = page-kind label + topic from breadcrumb; `state` = lab/article title from `document.title`, optionally prefixed with `Apprentice ·` / `Practitioner ·` / `Expert ·` from the public lab-info widget when `showDifficulty` is enabled.
- Clamp both fields to 128 chars (`clamp(str, 128)`).
- Settings: `showTimestamp` (default true), `showButtons` (default true), `privacyMode` (default false), `showTopic` (default true), `showDifficulty` (default false).
- In `privacyMode`: `details = 'Browsing PortSwigger Academy'`, delete `state`, `startTimestamp` and `buttons`.
- One "View page" button only when `showButtons && !privacyMode`; never a bare homepage link.
- One `largeImageKey` (Academy logo) plus optional `smallImageKey` for Reading/Browsing/Challenging.
- Never read progress, solved/completed state, username, rank, or lab environment/session data.

Reason: it maximizes useful context (topic + exact lab + difficulty) from stable, public, first-party data, while defaulting the one widget-dependent and potentially identifying-ish signal to off and providing a hard privacy kill switch. It also matches this repo's proven HTB Academy/HackTheBox branching style and the newer YesWeHack Dojo privacy conventions.

## Source list

- `https://portswigger.net/web-security`
- `https://portswigger.net/web-security/all-topics`
- `https://portswigger.net/web-security/all-labs`
- `https://portswigger.net/web-security/all-materials`
- `https://portswigger.net/web-security/sql-injection`
- `https://portswigger.net/web-security/sql-injection/union-attacks`
- `https://portswigger.net/web-security/sql-injection/lab-retrieve-hidden-data`
- `https://portswigger.net/web-security/learning-paths`
- `https://portswigger.net/web-security/dashboard`
- `https://portswigger.net/web-security/getting-started`
- `https://portswigger.net/web-security/hall-of-fame`
- `https://portswigger.net/web-security/certification`
- `https://portswigger.net/web-security/mystery-lab-challenge`
- `https://portswigger.net/web-security/lab-telemetry-privacy-notice`
- `https://portswigger.net/api/widgets` (anonymous POSTs documented inline above)
- `https://portswigger.net/academy/labs/launch/<lab-id>` (anonymous GET status checks)
- `https://portswigger.net/web-security/images/landing-page/web-security-academy-logo.svg`
- `.github/CONTRIBUTING.md`
- `websites/H/HackTheBox/presence.ts`, `websites/H/HackTheBox/metadata.json`
- `websites/H/HTB Academy/presence.ts`, `websites/H/HTB Academy/metadata.json`
- `websites/Y/YesWeHack Dojo/dist/presence.js` (source map on line 2)
- `websites/H/HeiwaStream/presence.ts:25-26`
- repo-wide `grep -i portswigger` → no matches
