# Watch Party Sync Behavior

This page explains how the Watch Party synchronization system works under the hood. Understanding these behaviors helps you write sync scripts that handle edge cases gracefully.

## Role System

Every Watch Party has two roles:

| Role           | Description                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Controller** | The participant whose playback is the source of truth. When the controller plays, pauses, or seeks, all followers mirror the action. |
| **Follower**   | Receives sync commands from the controller and applies them locally.                                                                 |

The **host** (party creator) starts as the controller but can transfer control to another participant. The host can also reclaim control at any time.

The sync script receives role information via `ctx.party.role` and can listen for changes with `ctx.party.onRoleChange()`.

::: tip
If the sync script needs to behave differently based on role (e.g., only the controller should report playback), check `ctx.party.role` before sending data.
:::

## Drift Correction

Even with synchronized commands, network latency causes playback positions to drift apart over time. The extension runs a drift correction algorithm on followers to keep them aligned with the controller.

### How It Works

The corrector compares the follower's local playback position against the controller's reported position (adjusted for latency) and applies one of three actions:

| Drift          | Action     | What Happens                                                    |
| -------------- | ---------- | --------------------------------------------------------------- |
| < ~0.15s       | Ignore     | Within acceptable tolerance, no correction needed               |
| ~0.15s - ~3.0s | Rate nudge | Slightly speeds up or slows down playback to gradually converge |
| > ~3.0s        | Hard seek  | Jumps directly to the correct position                          |

Rate nudging adjusts the follower's playback rate by a small amount (up to ±0.03x) to catch up or slow down. Once the drift falls below the tolerance threshold, the original playback rate is restored.

### Latency Estimation

The extension estimates network latency using two methods:

1. **Server timestamps + clock offset** — The WebSocket server attaches a timestamp, and periodic clock synchronization establishes the offset between client and server clocks.
2. **Capture timestamps** — When the controller captures a playback event, it records the local timestamp. The follower uses the difference between now and that timestamp as a rough latency estimate.

### Gentle-Seek Mode

When rate nudging isn't available (e.g., the site doesn't support playback rate changes), the corrector uses gentle-seek mode with a wider tolerance (~0.5s) to avoid excessive seeking.

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

| Setting               | Behavior                                                         |
| --------------------- | ---------------------------------------------------------------- |
| **Wait for everyone** | All participants pause when anyone is in an ad                   |
| **Wait for host**     | Participants only pause when the controller is in an ad          |
| **Ignore**            | Ads don't affect synchronization — participants continue playing |

### Debouncing

Ad exit has a 500ms debounce to prevent flapping. If a site rapidly transitions between ad segments (common on YouTube), the debounce ensures the party doesn't constantly pause and resume.

## Buffering Coordination

Buffering coordination works identically to ad coordination:

1. The sync script calls `reportBuffering(true)` when the player starts buffering
2. The party can pause and wait based on the **buffering behavior setting**
3. Buffering exit has a 500ms debounce

The same three settings apply: wait for everyone, wait for host, or ignore.

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

1. The extension navigates the follower's tab to the new URL
2. If the follower already has an active party tab, it updates that tab
3. If no party tab exists yet (first navigation after joining), it creates a new tab
4. If the tab update fails (e.g., browser error), it falls back to creating a new tab

::: tip
If a follower closes their party tab, they **automatically leave the party**. The host's tab closure behaves differently — the party migrates to another open web tab instead.
:::

The sync script's `onNavigate` callback fires on SPA navigations so you can re-attach to new player elements.

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
2. **Locale prefix stripping** — `/nl/title/123` and `/en-us/title/123` are treated as the same path (strips prefixes matching `/xx/` or `/xx-xxxx/` patterns)
3. **Sync script service matching** — If both URLs match the same sync script (by service name), they're considered the same site even with different hostnames. This is useful for regional domains like `anime-site.jp` and `anime-site.com`. Note that this only bypasses the hostname check — the pathname is still compared. If two regional domains use different URL structures for the same content (e.g., `/anime/123` on one domain vs `/watch/123` on another), desync will still be flagged. This is intentional: the system errs toward flagging desyncs rather than silently allowing mismatched content.
4. **Canonical URL fallback** — If the path comparison fails, the extension asks the content script for the page's canonical URL (`<link rel="canonical">`) and retries the comparison

### What Triggers Desync

A desync is reported when:

- The follower manually navigates to a different site
- The follower's URL doesn't match after locale and canonical normalization
- A URL fails to parse entirely

### Fallback Timeout

If a follower's page never finishes loading (no `status: 'complete'` event), a 15-second fallback timeout triggers a desync check to ensure followers aren't stuck indefinitely.

### Desync Status

When desync is detected, the follower sends a `desynced` status with the current URL. The Watch Party overlay shows this to other participants, and the follower can click to re-sync.

## Status States

The extension tracks each participant's status:

| Status          | Meaning                                                 |
| --------------- | ------------------------------------------------------- |
| `ready`         | Synchronized and watching normally                      |
| `waiting`       | Waiting for initial sync or reconnection                |
| `navigating`    | Currently navigating to a new page                      |
| `in-ad`         | Watching an advertisement                               |
| `buffering`     | Player is buffering content                             |
| `not-buffering` | Buffering has ended (transient — resolves to `ready`)   |
| `desynced`      | On a different page than the controller                 |
| `blocked`       | Cannot access the content (login wall, geo-restriction) |

Status messages are deduplicated — sending the same status twice in a row is suppressed to reduce WebSocket traffic.

## Heartbeats and Throttling

### Heartbeats

The controller periodically sends heartbeat messages containing the current playback position, rate, and paused state. Followers use these to run drift correction even when no explicit play/pause/seek events occur.

Identical consecutive heartbeats (same currentTime rounded to 0.1s, same playbackRate, same paused state) are deduplicated to reduce network traffic.

### Sync Throttling

High-frequency sync messages (cursor position, scroll events, input events) are throttled to a 100ms flush interval. The extension buffers the latest event per sync type and flushes them all at once, preventing network saturation during rapid interaction.

### Participant Count Optimization

When only one person is in the party, high-frequency sync messages (cursor, scroll, clicks, input) are not sent at all. This avoids unnecessary WebSocket traffic when there's no one to receive the data.
