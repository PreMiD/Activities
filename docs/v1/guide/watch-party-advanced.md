# Advanced Sync Script Features

This page covers mainworld communication, custom data exchange between participants, and reading party state.

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
SyncMainworldScript.register({
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
Mainworld scripts run in the page's JavaScript context, not the extension's. They can read the DOM and the page's own globals (such as `window.netflix`), but have no extension APIs and no `SyncScriptContext`: reporting playback, page info and blocking all go through the content script. Communication with the content script happens exclusively via `ctx.content`.

Because the page's own code runs alongside it, wrap every tick and every command in `try`/`catch`. The bundled Netflix and Disney+ scripts count failures and, after three in a row, send the content script a `broken` message once, which calls `ctx.reportBlocked` so the party sees why sync stopped.
:::

### When to Use Mainworld Scripts

Use a mainworld script when:

- The site exposes a player API on `window` that isn't accessible from the content script
- You need to intercept or call page-level JavaScript functions
- The site uses a custom player that can only be controlled through its JS API

## Custom Data

Send arbitrary data from the controller to the followers:

<!-- eslint-skip -->

```typescript
// Controller sends subtitle selection
ctx.sendCustomData('subtitle-lang', { lang: 'en', enabled: true })

// Followers receive it
const unsub = ctx.onCustomData('subtitle-lang', (data) => {
  const { lang, enabled } = data as { lang: string, enabled: boolean }
  player.setSubtitles(lang, enabled)
})

// Clean up
return () => unsub()
```

Only the controller can send custom data, and only followers receive it. It is not sent while the controller is alone in the party, and a message larger than 1 KB once serialized is dropped. Custom data sent from a follower is ignored.

Custom data is delivered once and not stored: followers who join later, and every follower while the party is paused, miss it. Send state that followers need again when it changes and every few seconds, see [Custom Data Between Participants](/v1/examples/watch-party#custom-data-between-participants). It shares the party server's limit of 40 sync messages per second with playback and the other sync messages, and messages over the limit are dropped.

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

| Event            | Fires when                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `onRoleChange`   | The host transfers control to this user, or reclaims it. Also fires when the controller leaves and control returns to the host. |
| `onHostChange`   | The host role moves to someone else. Only with the `hostChange` capability, so call it as `ctx.party.onHostChange?.(...)`.      |
| `onPauseChange`  | The host pauses or resumes the party (party-wide pause, not individual video pause).                                            |
| `onActiveChange` | The Watch Party starts or ends. Note: when the party ends, the cleanup function also runs, so this is rarely needed.            |

::: tip
`ctx.party.role`, `ctx.party.paused`, etc. are always up-to-date — they can be read at any time, not just in callbacks. The callbacks are for reacting to changes, not for initial state.
:::

### Messaging Timeout

`ctx.mainworld.request()` has a 10-second timeout. If the mainworld script doesn't respond within that time, the promise rejects. Make sure the mainworld script is loaded and has a matching `onRequest` handler registered before making requests.

A handler that throws or rejects rejects the caller's `request()` straight away, on both sides, so catch it:

<!-- eslint-skip -->

```typescript
const state = await ctx.mainworld.request('get-player-state', null).catch(() => null)
```
