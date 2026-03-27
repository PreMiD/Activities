# Advanced Sync Script Features

This page covers iFrame and mainworld communication, custom data exchange between participants, and reading party state.

## iFrame Communication

When the video player lives inside an iframe, you need a separate sync script for the iframe. See the [iFrames guide](/v1/guide/iframes) for background on iframe communication in PreMiD.

### Content Script Side

<!-- eslint-skip -->

```typescript
// Send a message to iframe
ctx.iframe.send(frameId, 'set-quality', { quality: '1080p' })

// Request data from iframe (10s timeout)
const state = await ctx.iframe.request(frameId, 'get-state', {})

// Listen for messages from iframe
const unsub = ctx.iframe.onMessage('player-event', (data, frameId) => {
  console.log('Event from frame', frameId, data)
})
```

### iFrame Script Side

The iframe script registers separately and receives a [`SyncIframeContext`](/v1/api/sync-script-types#synciframecontext):

<!-- eslint-skip -->

```typescript
SyncIframeScriptV1.register({
  setup(ctx) {
    const handle = ctx.video.attach('video')

    ctx.content.onMessage('set-quality', (data) => {
      // Handle quality change
    })

    return () => handle.detach()
  },
})
```

The iframe script has access to `ctx.video.attach()` for managing video elements inside the iframe, and `ctx.content` for communicating with the content script.

### When to Use iFrame Scripts

Use an iframe script when:
- The site embeds its video player in an iframe (common for third-party players)
- You need to access DOM elements inside the iframe
- The iframe has a different origin than the main page

Don't forget to set `iframeRegExp` in the sync script's `metadata.json` to specify which iframes the script should be injected into.

## Mainworld Communication

For sites that require access to the page's JavaScript context (e.g., proprietary player APIs attached to `window`), use a mainworld script.

### Content Script Side

<!-- eslint-skip -->

```typescript
// Request data from mainworld
const playerState = await ctx.mainworld.request('get-player-state', {})

// Listen for messages from mainworld
const unsub = ctx.mainworld.onMessage('player-event', (data) => {
  // Handle event from mainworld
})
```

### Mainworld Script Side

The mainworld script registers separately and receives a [`SyncMainworldContext`](/v1/api/sync-script-types#syncmainworldcontext):

<!-- eslint-skip -->

```typescript
SyncMainworldScriptV1.register({
  setup(ctx) {
    ctx.content.onRequest('get-player-state', () => {
      return {
        playing: window.playerAPI.isPlaying(),
        currentTime: window.playerAPI.getCurrentTime(),
      }
    })

    return () => {
      // Cleanup
    }
  },
})
```

::: warning
Mainworld scripts run in the page's JavaScript context, not the extension's. They cannot access extension APIs or the DOM utilities available to content scripts. Communication with the content script happens exclusively via `ctx.content`.
:::

### When to Use Mainworld Scripts

Use a mainworld script when:
- The site exposes a player API on `window` that isn't accessible from the content script
- You need to intercept or call page-level JavaScript functions
- The site uses a custom player that can only be controlled through its JS API

## Custom Data

Send arbitrary data between party participants:

<!-- eslint-skip -->

```typescript
// Controller sends subtitle selection
ctx.sendCustomData('subtitle-lang', { lang: 'en', enabled: true })

// All participants receive it
const unsub = ctx.onCustomData('subtitle-lang', (data) => {
  const { lang, enabled } = data as { lang: string, enabled: boolean }
  player.setSubtitles(lang, enabled)
})

// Clean up
return () => unsub()
```

::: warning
Custom data keys must be 1-32 characters, using only letters, numbers, hyphens, and underscores (matching the pattern `[\w-]{1,32}`).
:::

Custom data is sent to all participants in the party. There's no built-in filtering — the receiving side should check `ctx.party.role` if it only wants to process data from the controller.

## Party State

Read the current party state and react to changes:

<!-- eslint-skip -->

```typescript
setup(ctx) {
  console.log(ctx.party.role)    // 'controller' or 'follower'
  console.log(ctx.party.paused)  // true or false
  console.log(ctx.party.active)  // true when party is active
  console.log(ctx.party.isHost)  // true if user created the party

  const unsubRole = ctx.party.onRoleChange((role) => {
    if (role === 'controller') {
      // User just became the controller
    }
  })

  const unsubPause = ctx.party.onPauseChange((paused) => {
    if (paused) {
      player.pause()
    }
  })

  return () => {
    unsubRole()
    unsubPause()
  }
}
```

All subscription methods return an unsubscribe function. Always call these in your cleanup.

### When Do State Changes Fire?

| Event | Fires when |
|-------|-----------|
| `onRoleChange` | The host transfers control to this user, or reclaims it. Also fires if the current controller leaves and control is reassigned. |
| `onPauseChange` | The host pauses or resumes the party (party-wide pause, not individual video pause). |
| `onActiveChange` | The Watch Party starts or ends. Note: when the party ends, the cleanup function also runs, so this is rarely needed. |

::: tip
`ctx.party.role`, `ctx.party.paused`, etc. are always up-to-date — they can be read at any time, not just in callbacks. The callbacks are for reacting to changes, not for initial state.
:::

### Messaging Timeout

Both `ctx.iframe.request()` and `ctx.mainworld.request()` have a 10-second timeout. If the target doesn't respond within that time, the promise rejects. Make sure the target script is loaded and has a matching `onRequest` handler registered before making requests.
