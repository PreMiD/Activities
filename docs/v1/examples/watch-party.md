# Watch Party Sync Script Example

This page provides complete working examples of Watch Party sync scripts for common scenarios.

## Simple Video Sync (Auto Mode)

The simplest sync script — for sites with a standard `<video>` element:

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true })

    const video = document.querySelector('video')
    if (!video) return

    const handle = ctx.video.attach(video)

    const title = document.querySelector('h1')?.textContent
    if (title) {
      ctx.setPageInfo({ title })
    }

    return () => {
      handle.detach()
    }
  },

  onNavigate(ctx, url) {
    // SPA navigation — re-attach to the new video element
    const video = document.querySelector('video')
    if (video) {
      ctx.video.attach(video)

      const title = document.querySelector('h1')?.textContent
      if (title) {
        ctx.setPageInfo({ title })
      }
    }
  },
})
```

## Custom Player Sync (Manual Mode)

For sites with a proprietary JavaScript player API (e.g., the player isn't a standard `<video>` element):

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true })

    // Assume the site exposes a global player object
    const player = (window as any).sitePlayer
    if (!player) return

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
      onRate(rate) {
        player.setPlaybackRate(rate)
      },
    })

    // Report playback state every second
    const interval = setInterval(() => {
      handle.reportPlayback({
        playing: player.isPlaying(),
        currentTime: player.getCurrentTime(),
        duration: player.getDuration(),
        playbackRate: player.getPlaybackRate(),
      })
    }, 1000)

    ctx.setPageInfo({
      title: player.getTitle(),
      subtitle: player.getEpisodeName(),
      thumbnail: player.getThumbnailUrl(),
    })

    return () => {
      clearInterval(interval)
      handle.release()
    }
  },
})
```

## Handling Ads

Detect and report advertisements using a MutationObserver:

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true })

    const video = document.querySelector('video')
    if (!video) return

    const handle = ctx.video.attach(video)

    // Watch for ad overlay appearance
    const observer = new MutationObserver(() => {
      const adOverlay = document.querySelector('.ytp-ad-player-overlay')
      const adText = document.querySelector('.ytp-ad-text')
      const isInAd = !!(adOverlay || adText)
      handle.reportAd(isInAd)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      handle.detach()
    }
  },
})
```

::: tip
Ad exit has a 500ms debounce built in, so rapid transitions between ad segments won't cause the party to constantly pause and resume.
:::

## iFrame Video Player

When the video is embedded in an iframe (common for sites using third-party players):

### Content Script (`content.ts`)

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true })

    // Request current state from the iframe
    ctx.iframe.onMessage('playback-update', (data, frameId) => {
      const { title, episode } = data as { title: string, episode: string }
      ctx.setPageInfo({ title, subtitle: episode })
    })

    return () => {}
  },
})
```

### iFrame Script (`iframe.ts`)

<!-- eslint-skip -->

```typescript
SyncIframeScriptV1.register({
  setup(ctx) {
    const video = document.querySelector('video')
    if (!video) return

    // Attach to the iframe's video element
    const handle = ctx.video.attach(video)

    // Send metadata to the content script
    const title = document.querySelector('.player-title')?.textContent ?? ''
    const episode = document.querySelector('.episode-info')?.textContent ?? ''
    ctx.content.send('playback-update', { title, episode })

    return () => {
      handle.detach()
    }
  },
})
```

## Blocked State Reporting

Detect login walls or geo-restrictions and report them:

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true })

    function checkAccess() {
      const loginWall = document.querySelector('.login-gate, .paywall, .geo-block')
      if (loginWall) {
        const reason = loginWall.querySelector('.message')?.textContent || 'Content unavailable'
        ctx.reportBlocked(reason)
      } else {
        ctx.reportUnblocked()

        const video = document.querySelector('video')
        if (video) {
          ctx.video.attach(video)
        }
      }
    }

    checkAccess()

    // Re-check when the page content changes
    const observer = new MutationObserver(checkAccess)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  },
})
```

## Reacting to Party State Changes

Adapt sync script behavior based on role and party state:

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true, cursor: true })

    const video = document.querySelector('video')
    if (!video) return

    const handle = ctx.video.attach(video)

    // Show a visual indicator based on role
    const unsubRole = ctx.party.onRoleChange((role) => {
      if (role === 'controller') {
        showNotification('You now have control')
      } else {
        showNotification('Following the host')
      }
    })

    // React to party pause/resume
    const unsubPause = ctx.party.onPauseChange((paused) => {
      if (paused) {
        // Party is paused — you might want to show a "Paused" overlay
        showPauseOverlay()
      } else {
        hidePauseOverlay()
      }
    })

    return () => {
      unsubRole()
      unsubPause()
      handle.detach()
    }
  },
})
```

## Custom Data Between Participants

Synchronize custom settings across party members:

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true })

    const video = document.querySelector('video')
    if (!video) return

    const handle = ctx.video.attach(video)

    // Controller sends subtitle preference to all followers
    if (ctx.party.role === 'controller') {
      const subtitleTrack = video.textTracks[0]
      if (subtitleTrack) {
        ctx.sendCustomData('subtitles', {
          lang: subtitleTrack.language,
          enabled: subtitleTrack.mode === 'showing',
        })
      }
    }

    // All participants receive subtitle commands
    const unsub = ctx.onCustomData('subtitles', (data) => {
      const { lang, enabled } = data as { lang: string, enabled: boolean }
      for (const track of video.textTracks) {
        if (track.language === lang) {
          track.mode = enabled ? 'showing' : 'hidden'
        }
      }
    })

    return () => {
      unsub()
      handle.detach()
    }
  },
})
```

## Related

- [Sync Script Guide](/v1/guide/watch-party-sync-scripts) — Step-by-step integration guide
- [Sync Behavior](/v1/guide/watch-party-behavior) — How drift correction, desync detection, and coordination work
- [SyncScriptContext API](/v1/api/sync-script-context) — Full API reference
- [Sync Script Types](/v1/api/sync-script-types) — All TypeScript interfaces
