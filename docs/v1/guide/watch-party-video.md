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
- Runs drift correction to keep followers aligned

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

### Re-attaching After SPA Navigation

Many sites destroy and recreate their video player during navigation. Use `onNavigate` to re-attach:

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true })
    let handle = ctx.video.attach('video')

    return () => handle.detach()
  },

  onNavigate(ctx, url) {
    // Player was destroyed during navigation — find the new one
    const video = document.querySelector('video')
    if (video) {
      const handle = ctx.video.attach(video)
    }
  },
})
```

## Manual Video Mode

For custom players that don't use standard `<video>` elements (canvas-based players, Flash wrappers, or sites with proprietary player APIs), use manual mode:

<!-- eslint-skip -->

```typescript
setup(ctx) {
  ctx.features({ video: true })

  const handle = ctx.video.takeControl({
    onPlay(timeSeconds) {
      player.seekTo(timeSeconds)
      player.play()
    },
    onPause(timeSeconds) {
      player.pause()
      player.seekTo(timeSeconds)
    },
    onSeek(timeSeconds) {
      player.seekTo(timeSeconds)
    },
    onRate(playbackRate) {
      player.setPlaybackRate(playbackRate)
    },
    pauseAfterSeek: true,
  })

  // Report current playback state periodically
  const interval = setInterval(() => {
    handle.reportPlayback({
      playing: player.isPlaying(),
      currentTime: player.getCurrentTime(),
      duration: player.getDuration(),
      playbackRate: player.getPlaybackRate(),
    })
  }, 1000)

  return () => {
    clearInterval(interval)
    handle.release()
  }
}
```

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

`reportPlayback()` should be called periodically (every ~1s) by the **controller** so followers can run drift correction. Followers can also call it, but it's primarily used by the controller.

### pauseAfterSeek

The `pauseAfterSeek` option controls what happens after a seek command:

- `true` — Pause immediately after seeking (useful for sites that auto-play on seek)
- `number` — Pause after the specified milliseconds (e.g., `200` for a 200ms delay)
- `false` or omitted — Don't pause after seeking

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

This information is displayed in the Watch Party overlay for all participants.

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

The blocked reason is shown to other participants so they understand why someone isn't syncing.
