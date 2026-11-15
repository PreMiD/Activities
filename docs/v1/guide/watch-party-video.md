# Video Synchronization

This page covers how to synchronize video playback in Watch Party sync scripts, including auto mode for standard `<video>` elements and manual mode for custom players.

## Auto Video Mode

For sites with standard `<video>` or `<audio>` elements, use auto mode:

<!-- eslint-skip -->

```typescript
setup(ctx) {
  ctx.features({ video: true })

  // Pass an element or CSS selector
  const handle = ctx.video.attach(document.querySelector('.player video')!)
  // or: ctx.video.attach('.player video')

  return () => handle.detach()
}
```

Auto mode automatically:

- Listens to `play`, `pause`, `seeked`, `ratechange` events
- Reports playback status to the party
- Applies sync commands (play/pause/seek) from the party controller
- Reports the playback position periodically while the controller is playing, so followers can run drift correction
- Runs drift correction on followers to keep them aligned

### AutoVideoHandle

The handle returned by `attach()` provides:

| Method                         | Description                                            |
| ------------------------------ | ------------------------------------------------------ |
| `detach()`                     | Stop managing the element                              |
| `onSyncCommand(handler)`       | Listen to incoming sync commands (returns unsubscribe) |
| `reportAd(isInAd)`             | Report ad playback state                               |
| `reportBuffering(isBuffering)` | Report buffering state                                 |

In auto mode, `onSyncCommand` fires **after** the command has already been applied to the element. This is useful for reacting to sync events (e.g., updating UI) without needing to apply them yourself. The commands that fire are:

| Command                         | When it fires                                                               |
| ------------------------------- | --------------------------------------------------------------------------- |
| `play`                          | The controller started playback — element was seeked and played             |
| `pause`                         | The controller paused — element was paused and seeked                       |
| `seek`                          | The controller seeked to a new position                                     |
| `rate`                          | The controller changed playback rate                                        |
| Heartbeat (`isHeartbeat: true`) | Periodic position update from the controller — drift correction was applied |

### Re-attaching After Navigation

Many sites destroy and recreate their video player during navigation. `setup` runs again whenever the controller's page address changes, and on followers a full page load does the same, so attaching in `setup` covers navigation.

If a site replaces its player without changing the address, watch for it and attach again:

<!-- eslint-skip -->

```typescript
SyncScript.register({
  setup(ctx) {
    ctx.features({ video: true })
    let handle: AutoVideoHandle | undefined
    let current: HTMLVideoElement | null = null

    const observer = new MutationObserver(() => {
      const video = document.querySelector('video')
      if (video === current)
        return
      handle?.detach()
      current = video
      handle = video ? ctx.video.attach(video) : undefined
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      handle?.detach()
    }
  },
})
```

## Manual Video Mode

For custom players that don't use standard `<video>` elements (canvas-based players, Flash wrappers, or sites with proprietary player APIs), use manual mode.

### The Take-Control Pattern

Claim the page early, but take control only once the player exists:

1. **Claim the page with `fallback: false`** as soon as the URL is a watch page, before the player loads. Without it, PreMiD's own video detection may find the raw `<video>` first and drive it directly, which on players such as Netflix's stops playback with an error. Extensions before 2.15 ignore `fallback`.
2. **Call `takeControl()` only when the player reports a position.** A follower ignores sync commands until its first report, and extensions before 2.15 give up on a managed page that has reported nothing for 10 seconds. Call `features()` again when you take control, so a page an older extension gave up on is claimed again.
3. **Release the handle** when the player has been gone for a second or two (an episode change, or leaving the watch page). Measure it in time, not in missed messages, since reports are not sent at a fixed rate.

<!-- eslint-skip -->

```typescript
setup(ctx) {
  let handle: ManualVideoHandle | null = null
  let lastSeenAt = 0

  if (location.pathname.startsWith('/watch/'))
    ctx.features({ cursor: false, scroll: false, video: true, fallback: false })

  const options: SyncScriptTakeControlOptions = {
    onPlay(timeSeconds) {
      const player = getPlayer()
      if (!player)
        return
      // A follower that is more than a second off has to be at the party's position first.
      if (Math.abs(player.getCurrentTime() - timeSeconds) > 1)
        player.seekTo(timeSeconds)
      player.play()
    },
    onPause(timeSeconds) {
      const player = getPlayer()
      if (!player)
        return
      if (Math.abs(player.getCurrentTime() - timeSeconds) > 1)
        player.seekTo(timeSeconds)
      player.pause()
    },
    onSeek(timeSeconds) {
      getPlayer()?.seekTo(timeSeconds)
    },
    pauseAfterSeek: true,
  }
  // onRate also makes the runtime correct small drift with rate nudges such as 1.02.
  // Only pass it when the player accepts any rate.
  if (ctx.runtime)
    options.onRate = rate => getPlayer()?.setPlaybackRate(rate)

  const interval = setInterval(() => {
    const player = getPlayer()
    if (!player) {
      if (handle && Date.now() - lastSeenAt > 2000) {
        handle.release()
        handle = null
      }
      return
    }
    lastSeenAt = Date.now()

    if (!handle) {
      ctx.features({ cursor: false, scroll: false, video: true, fallback: false })
      handle = ctx.video.takeControl(options)
    }

    handle.reportPlayback({
      playing: player.isPlaying(),
      currentTime: player.getCurrentTime(),
      duration: player.getDuration(),
      playbackRate: player.getPlaybackRate(),
    })
  }, 250)

  return () => {
    clearInterval(interval)
    handle?.release()
  }
}
```

When the player lives in the page's JavaScript, read it from a [mainworld script](/v1/guide/watch-party-advanced#mainworld-communication) and post its state to the content script. The bundled Netflix and Disney+ scripts poll every 250ms and post only when something changed or a second has passed. While playing the position changes on every poll, so a playing player is still posted every 250ms.

### ManualVideoHandle

| Method                         | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| `reportPlayback(status)`       | Report current playback state to the party        |
| `onSyncCommand(handler)`       | Listen to raw sync commands (returns unsubscribe) |
| `reportAd(isInAd)`             | Report ad playback state                          |
| `reportBuffering(isBuffering)` | Report buffering state                            |
| `release()`                    | Stop manual control                               |

In manual mode, the `TakeControlOptions` callbacks fire **instead of** automatic element control:

| Callback               | When it fires                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `onPlay(timeSeconds)`  | The controller started playback. Seek to `timeSeconds` and play.                       |
| `onPause(timeSeconds)` | The controller paused. Pause and seek to `timeSeconds`.                                |
| `onSeek(timeSeconds)`  | The controller seeked. Seek to `timeSeconds`.                                          |
| `onRate(playbackRate)` | The controller changed playback rate. Set the rate. Optional — only fires if provided. |

These callbacks fire for **followers only**. The controller doesn't receive its own commands back.

### Reporting Playback

`reportPlayback()` is called by **everyone**, controller and followers alike:

- The controller's reports are sent to the party as heartbeats, so followers can run drift correction
- On a follower, sync commands are ignored until the first report arrives, and the reported position is what drift correction compares against

Report whenever the state changes, every 250ms while playing, and at least once a second while paused. Newer extensions throttle the reports and work out play, pause and seek events from them, so reporting at the player's natural rate is fine. Extensions before 2.15 send every report as is and compare against the last reported position, so a report that is a second old reads as a second of drift.

Extensions before 2.15 stop treating the page as handled by the script when it reports nothing for 10 seconds, and fall back to their own video detection. Newer extensions keep the page with the script for as long as it is active, however quiet the player is. If the script stops responding on a page that set `fallback: false`, the follower shows as blocked instead of falling back.

### pauseAfterSeek

The `pauseAfterSeek` option controls what happens after a paused follower is moved to the controller's position:

- `true` — Pause 200ms after seeking (useful for sites that auto-play on seek)
- `number` — Pause after the specified milliseconds (e.g., `500` for a 500ms delay)
- `false` or omitted — Don't pause after seeking

It applies when the controller is paused and a follower is moved to its position. It does not apply to seeks while the party is playing.

::: warning
Only one video control mode can be active at a time. Calling `takeControl()` while `attach()` is active (or vice versa) will cause unexpected behavior. Always `detach()` or `release()` the current handle first.
:::

## Page Information

Provide metadata about what the party is watching:

<!-- eslint-skip -->

```typescript
ctx.setPageInfo({
  title: 'Breaking Bad',
  subtitle: 'S5 E16 - Felina',
  thumbnail: 'https://example.com/poster.jpg',
})
```

`type` (`'video'`, `'music'`, `'live'` or `'podcast'`) and `duration` (seconds) are optional. Extensions without the `pageInfoType` capability ignore them, so it is safe to always pass them:

<!-- eslint-skip -->

```typescript
ctx.setPageInfo({ title: 'Breaking Bad', type: 'video', duration: 2940 })
```

The title and subtitle are shown at the top of the Watch Party overlay on the tab running the script. The thumbnail is not displayed.

## Reporting Ads

When the site plays advertisements, report this so the party can coordinate:

<!-- eslint-skip -->

```typescript
const observer = new MutationObserver(() => {
  const adOverlay = document.querySelector('.ad-overlay')
  handle.reportAd(!!adOverlay)
})

observer.observe(document.body, { childList: true, subtree: true })
```

Ad reporting has a 500ms debounce on exit to prevent flapping from rapid ad transitions. The party host's settings control how participants respond — see [Ad Coordination](/v1/guide/watch-party-behavior#ad-coordination) for details.

## Reporting Buffering

Report buffering state so the party can wait:

<!-- eslint-skip -->

```typescript
video.addEventListener('waiting', () => handle.reportBuffering(true))
video.addEventListener('playing', () => handle.reportBuffering(false))
```

::: tip
In auto mode, you typically don't need to report buffering manually — the attached element's events are monitored automatically. Use explicit reporting only when the default detection doesn't work for the site.
:::

## Blocked State

If the site requires authentication or has geo-restrictions, report this so other party members see a clear status:

<!-- eslint-skip -->

```typescript
const loginWall = document.querySelector('.login-required')
if (loginWall) {
  ctx.reportBlocked('Login required')
} else {
  ctx.reportUnblocked()
}
```

Other participants see that this follower is blocked. The reason is not sent to them; it is for debugging and shows in the `pmd sync-dev` terminal. Only followers can be blocked; a report from the controller is ignored.
