# Watch Party Sync Behavior

This page explains how the Watch Party synchronization system works under the hood. Understanding these behaviors helps you write sync scripts that handle edge cases gracefully.

## Role System

Every Watch Party has two roles:

| Role           | Description                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Controller** | The participant whose playback is the source of truth. When the controller plays, pauses, or seeks, all followers mirror the action. |
| **Follower**   | Receives sync commands from the controller and applies them locally.                                                                 |

The **host** (party creator) starts as the controller but can transfer control to another participant. The host can also reclaim control at any time, and control returns to the host when the controller leaves.

The sync script receives role information via `ctx.party.role` and can listen for changes with `ctx.party.onRoleChange()`.

::: tip
If the sync script needs to behave differently by role (for example, only the controller should send custom data), check `ctx.party.role`. Keep calling `reportPlayback()` in both roles: a follower ignores sync commands until its first report.
:::

## Drift Correction

Even with synchronized commands, network latency causes playback positions to drift apart over time. The extension runs a drift correction algorithm on followers to keep them aligned with the controller.

### How It Works

The corrector compares the follower's local playback position against the controller's reported position (adjusted for latency) and applies one of three actions:

| Drift        | Action     | What Happens                                                    |
| ------------ | ---------- | --------------------------------------------------------------- |
| < 0.15s      | Ignore     | Within acceptable tolerance, no correction needed               |
| 0.15s - 1.0s | Rate nudge | Slightly speeds up or slows down playback to gradually converge |
| > 1.0s       | Hard seek  | Jumps directly to the correct position                          |

Rate nudging adjusts the follower's playback rate by a small amount (up to ±0.03x) to catch up or slow down. Once the drift falls below the tolerance threshold, the original playback rate is restored. After a hard seek, the corrector waits 2 seconds before it seeks again.

### Latency Estimation

The extension estimates network latency using two methods:

1. **Server timestamps + clock offset** — The server attaches a timestamp to the messages it relays, and the extension measures the offset between its clock and the server's with periodic pings.
2. **Capture timestamps** — When the controller captures a playback event, it records the local timestamp. If there is no server timestamp, the follower uses the difference between now and that timestamp as a rough latency estimate.

### Gentle-Seek Mode

When rate nudging isn't available, the corrector uses gentle-seek mode: drift under 0.5s is ignored, anything larger is corrected with a seek, and seeks are at least 3 seconds apart. This is the mode used in [manual video mode](/v1/guide/watch-party-video#manual-video-mode) when `takeControl()` is called without an `onRate` callback.

### Buffering Suspension

Drift correction is automatically suspended while the follower is buffering. This prevents the corrector from repeatedly seeking into an unloaded portion of the video.

## Ad Coordination

When a participant encounters an ad, the party can coordinate to prevent desynchronization.

### How It Works

1. The sync script calls `reportAd(true)` when an ad starts
2. The extension sends the ad state to all participants
3. Based on the party's **ad behavior setting**, participants may pause and wait

### Ad Behavior Settings

The party host configures how ads are handled:

| Setting      | Behavior                                                         |
| ------------ | ---------------------------------------------------------------- |
| **Everyone** | All participants pause when anyone is in an ad                   |
| **Host**     | Participants only pause when the controller is in an ad          |
| **No one**   | Ads don't affect synchronization — participants continue playing |

### Debouncing

Ad exit has a 500ms debounce to prevent flapping. If a site rapidly transitions between ad segments (common on YouTube), the debounce ensures the party doesn't constantly pause and resume.

## Buffering Coordination

Buffering coordination works identically to ad coordination:

1. The sync script calls `reportBuffering(true)` when the player starts buffering
2. The party can pause and wait based on the **buffering behavior setting**
3. Buffering exit has a 500ms debounce

The same three settings apply: wait for everyone, wait for the host, or wait for no one.

::: tip
In auto video mode, buffering is detected automatically via the element's `waiting` and `playing` events. You only need to report buffering manually if the site's player doesn't fire standard media events.
:::

### Deadlock Prevention

To prevent a deadlock where everyone is waiting for everyone else to stop buffering, the extension ensures that `not-buffering` status is always sent even when the party is in a buffer-pause state. This allows the coordination to resolve once the buffering participant catches up.

## Navigation Sync

When the controller navigates to a new page, the extension synchronizes the URL across all followers.

### Controller Side

The extension detects navigation from the controller's active tab, including both standard page loads and SPA navigations (pushState/replaceState). Duplicate navigate messages for the same URL within 2 seconds are deduplicated.

### Follower Side

When a follower receives a navigation command:

1. If the new URL is on the same site as the follower's party tab, the extension navigates that tab to it
2. If it is on a different site, the follower is asked whether to follow. Choosing to follow also follows the controller's next navigations for 5 minutes without asking again
3. If no party tab exists yet (first navigation after joining), the extension uses the focused tab when it is already on that page, and opens a new tab otherwise
4. If the tab update fails (e.g., browser error), it falls back to creating a new tab

::: tip
If a guest or member closes their party tab, they **automatically leave the party**. When the host closes it, the party stays open. A host who is the controller picks a new tab with the "Move party here" button, and followers wait until then.
:::

The sync script's `onNavigate` callback fires once per address, on the controller and on a follower's own in-page navigation as well as when the controller's navigation arrives. On a follower it fires at the same moment the extension starts moving the tab. The new page may not have loaded yet, and a full page load runs `setup` again on the new page, so look for player elements in `setup` and use `onNavigate` only for work that has to happen when the controller moves on.

On the controller, a change of the page address (including SPA navigation) restarts the sync script: the cleanup function runs and `setup` runs again. Repeats of the same address within 2 seconds are ignored.

### Navigation Settling Window

After a follower navigates, there's a **5-second settling window** where URL changes from the follower's tab are not treated as desyncs. This prevents false desync detection from:

- Server-side redirects (e.g., locale redirects like `/en-us/title/123`)
- Authentication redirects
- CDN routing

## Desync Detection

The extension monitors whether followers are actually on the same page as the controller.

### URL Comparison

When a follower's URL changes outside of a sync-initiated navigation, the extension compares it against the expected URL using several normalization steps:

1. **www-stripping** — `www.netflix.com` and `netflix.com` are treated as the same host
2. **Locale prefix stripping** — `/nl/title/123` and `/en-us/title/123` are treated as the same path (strips a leading language segment such as `/nl`, `/en-us` or `/zh-hans`)
3. **Sync script service matching** — If both URLs match the same sync script (by service name), they're considered the same site even with different hostnames. This is useful for regional domains like `anime-site.jp` and `anime-site.com`. Note that this only bypasses the hostname check — the pathname is still compared. If two regional domains use different URL structures for the same content (e.g., `/anime/123` on one domain vs `/watch/123` on another), desync will still be flagged. This is intentional: the system errs toward flagging desyncs rather than silently allowing mismatched content.
4. **Content identity** — On sites that keep the video in the query string, such as YouTube's `v` parameter, a different video counts as a different page even when the path matches
5. **Canonical URL fallback** — If the path comparison fails, the extension asks the content script for the page's canonical URL (`<link rel="canonical">`) and retries the comparison, except when the content identity differs

### What Triggers Desync

A desync is reported when:

- The follower manually navigates to a different site
- The follower's URL doesn't match after locale and canonical normalization
- A URL fails to parse entirely

### Fallback Timeout

If a follower's page never finishes loading (no `status: 'complete'` event), a 15-second fallback timeout triggers a desync check to ensure followers aren't stuck indefinitely.

### Desync Status

When desync is detected, the follower sends a `desynced` status. The Watch Party overlay shows this to other participants, and the follower can click to re-sync.

## Status States

The extension tracks each participant's status:

| Status          | Meaning                                                 |
| --------------- | ------------------------------------------------------- |
| `ready`         | Synchronized and watching normally                      |
| `navigating`    | Currently navigating to a new page                      |
| `in-ad`         | Watching an advertisement                               |
| `buffering`     | Player is buffering content                             |
| `not-buffering` | Buffering has ended                                     |
| `desynced`      | On a different page than the controller                 |
| `blocked`       | Cannot access the content (login wall, geo-restriction) |

Status messages are deduplicated — sending the same status twice in a row is suppressed to reduce WebSocket traffic.

## Heartbeats and Throttling

### Heartbeats

The controller periodically sends heartbeat messages containing the current playback position, rate, and paused state. Followers use these to run drift correction even when no explicit play/pause/seek events occur. Without a sync script, the interval adapts to the drift between participants, from every second when drift is large to every 3 seconds when everyone is in step.

Identical consecutive heartbeats (same currentTime rounded to 0.1s, same playbackRate, same paused state) are deduplicated to reduce network traffic, but are sent again after 5 seconds so a newcomer or a reloaded follower still gets one.

### Sync Throttling

High-frequency sync messages (cursor position, scroll position and heartbeats) are throttled to a 100ms flush interval. The extension buffers the latest event per sync type and flushes them all at once, preventing network saturation during rapid interaction.

Only the controller's cursor and scroll are sent. A sync script can turn them off for its site with `ctx.features({ cursor: false, scroll: false })`.

### Participant Count Optimization

When only one person is in the party, high-frequency sync messages (cursor, scroll, playback heartbeats and custom data) are not sent at all. This avoids unnecessary WebSocket traffic when there's no one to receive the data.
