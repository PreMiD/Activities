# PortSwigger Academy — presentation revision

## Intent

Align the PortSwigger Academy presence with the presentation style used by HTB Academy. Keep the same data sources and settings. Remove the non-default activity type. Give the presence a static application label and icon tooltips.

## Scope

Small change to `websites/P/PortSwigger Web Security Academy/presence.ts` and `presence.test.ts`.

## Non-goals

- No metadata `service` rename. The Discord application name and folder name stay `PortSwigger Web Security Academy`.
- No new settings, selectors, data sources, or privacy changes.
- No refactor into a Dojo-style `classify()` function.

## Constraints

- `largeImageText` is the static string `PortSwigger Academy` on every page, including privacy mode.
- Default Playing activity: remove `type: ActivityType.Watching` and the `ActivityType` import. Keep `Assets`.
- Every page that sets a `smallImageKey` also sets `smallImageText`.
- `details` and `state` still clamp to 128 characters.
- Privacy mode still deletes `state`, `startTimestamp`, `smallImageKey`, `smallImageText`, and `buttons`.

## Approaches

1. **Edit the existing switch in place.** Change strings, add tooltips, drop `type`. Smallest diff; no behavior change outside presentation. **Chosen.**
2. Refactor into a `classify()` helper like YesWeHack Dojo. Cleaner separation, but touches control flow unrelated to the request. Rejected as out of scope.

## Mapping (HTB Academy style)

`details` is a short action phrase without quoted names. `state` carries the specific item or pipe-separated metrics.

| Page | `details` | `state` | Tooltip |
|---|---|---|---|
| Home / other | `Browsing PortSwigger Academy` | — | `Browsing` |
| Lab | `Solving Lab: <title>` | `<DIFFICULTY> · Solved` or `In progress` | `Solving` |
| Article | `Reading: <topic>` | `<heading>` | `Reading` |
| Index | `Browsing all labs` / `Browsing all topics` / `Browsing all materials` | — | `Browsing` |
| Learning path | `Following learning path: <name>` | `<heading>` | `Reading` |
| Dashboard | `Browsing the dashboard` | `Username: X \| Rank: #Y \| Level: Z \| Solved: N \| 3%` | `Browsing` |
| Hall of Fame | `Looking at the Hall of Fame` | `Username: X \| Rank: #Y` | `Browsing` |
| Privacy mode | `Browsing PortSwigger Academy` | — | none |

Lab title moves from quoted `details` to plain `details`. Account fields move from `details` to `state`. Each field stays behind its existing setting.

## Tests

Update expectations for unquoted lab titles, lowercase index phrases, dashboard wording, and username in `state`. Keep the existing privacy, clamp, and difficulty assertions.
