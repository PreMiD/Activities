# SyncScriptContext

The `SyncScriptContext` is the main object sync script developers interact with when building Watch Party sync scripts. It provides methods for video synchronization, page metadata, main world messaging, and party state observation.

See the [Sync Script Types](/v1/api/sync-script-types) reference for full interface definitions, and the [Watch Party Sync Scripts](/v1/guide/watch-party-sync-scripts) guide for usage patterns.

## Registration

### SyncScript.register

<!-- eslint-skip -->

```typescript
SyncScript.register(options: {
  setup: (ctx: SyncScriptContext) => (() => void) | void
  onNavigate?: (ctx: SyncScriptContext, url: string) => void
}): SyncScriptHandle
```

Registers a sync script with the PreMiD extension. The `setup` function is called each time the sync script is activated, for example when a party starts on the page or the controller navigates. Return a cleanup function from `setup` to dispose of resources when the script is deactivated.

#### Parameters

| Parameter            | Type                                               | Description                                                                                            |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `options.setup`      | `(ctx: SyncScriptContext) => (() => void) \| void` | Called on activation. Receives the context object. May return a cleanup function.                      |
| `options.onNavigate` | `(ctx: SyncScriptContext, url: string) => void`    | Called on a follower when the controller's navigation arrives, before the tab has loaded the new page. |

#### Returns

A `SyncScriptHandle` for managing the registered script.

#### Example

<!-- eslint-skip -->

```typescript
SyncScript.register({
  setup(ctx) {
    ctx.features({ video: true })

    const handle = ctx.video.attach('video')

    ctx.setPageInfo({
      title: document.querySelector('.title')?.textContent ?? 'Unknown',
    })

    return () => {
      handle.detach()
    }
  },
  onNavigate(ctx, url) {
    ctx.setPageInfo({
      title: document.querySelector('.title')?.textContent ?? 'Unknown',
    })
  },
})
```

## Features

### features

<!-- eslint-skip -->

```typescript
features(features: { video?: boolean, cursor?: boolean, scroll?: boolean }): void
```

Tells PreMiD that the sync script handles this page, and which sync features it supports. Every feature is on by default, so pass `false` to turn one off. Call it at the start of `setup`.

#### Parameters

| Parameter         | Type      | Description                                                                                             |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `features.video`  | `boolean` | Set to `false` to turn off video synchronization, including PreMiD's own video detection for this page. |
| `features.cursor` | `boolean` | Set to `false` to stop sharing the controller's cursor.                                                 |
| `features.scroll` | `boolean` | Set to `false` to stop sharing the controller's scroll position.                                        |

#### Example

<!-- eslint-skip -->

```typescript
ctx.features({ cursor: false, scroll: false })
```

## Video

### video.attach

<!-- eslint-skip -->

```typescript
video.attach(element: HTMLMediaElement | string): AutoVideoHandle
```

Attaches to a standard HTML media element for automatic video synchronization. PreMiD will automatically manage play, pause, seek, and playback rate events on the element, and reports its position periodically while the controller is playing.

#### Parameters

| Parameter | Type                         | Description                                                                             |
| --------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| `element` | `HTMLMediaElement \| string` | A direct reference to the media element, or a CSS selector string that resolves to one. |

#### Returns

An `AutoVideoHandle` with the following methods:

- `detach()` -- Stops synchronization and removes all event listeners.
- `onSyncCommand(handler)` -- Registers a handler called when the party sends a sync command. Returns an unsubscribe function.
- `reportAd(isInAd)` -- Reports whether an ad is currently playing.
- `reportBuffering(isBuffering)` -- Reports whether the video is buffering.

#### Example

<!-- eslint-skip -->

```typescript
const handle = ctx.video.attach('video.main-player')

handle.onSyncCommand((command) => {
  console.log('Received sync command:', command)
})

// Later, when cleaning up
handle.detach()
```

### video.takeControl

<!-- eslint-skip -->

```typescript
video.takeControl(options: TakeControlOptions): ManualVideoHandle
```

Takes manual control of video synchronization for custom players that do not use a standard `HTMLMediaElement`. You provide callbacks that are invoked when the party sends sync commands.

#### Parameters

| Parameter                | Type                     | Description                                                                                   |
| ------------------------ | ------------------------ | --------------------------------------------------------------------------------------------- |
| `options.onPlay`         | `(time: number) => void` | Called when the party requests playback to start at `time` seconds.                           |
| `options.onPause`        | `(time: number) => void` | Called when the party requests playback to pause at `time` seconds.                           |
| `options.onSeek`         | `(time: number) => void` | Called when the party requests a seek to a specific time in seconds.                          |
| `options.onRate`         | `(rate: number) => void` | Optional. Called when the party requests a playback rate change, and used to nudge drift.     |
| `options.pauseAfterSeek` | `boolean \| number`      | After a paused follower is moved, pause again after 200ms (`true`) or the given milliseconds. |

#### Returns

A `ManualVideoHandle` with the following methods:

- `reportPlayback(status)` -- Reports current playback state (`playing`, `currentTime`, `duration`, `playbackRate`). Call it about once a second, on the controller and on followers.
- `onSyncCommand(handler)` -- Registers a handler called on sync commands. Returns an unsubscribe function.
- `reportAd(isInAd)` -- Reports whether an ad is currently playing.
- `reportBuffering(isBuffering)` -- Reports whether the video is buffering.
- `release()` -- Releases manual control and stops synchronization.

#### Example

<!-- eslint-skip -->

```typescript
const player = getCustomPlayer()

const handle = ctx.video.takeControl({
  onPlay: (time) => {
    player.seekTo(time)
    player.play()
  },
  onPause: (time) => {
    player.pause()
    player.seekTo(time)
  },
  onSeek: time => player.seekTo(time),
  onRate: rate => player.setPlaybackRate(rate),
  pauseAfterSeek: 200,
})

// Report playback state periodically
setInterval(() => {
  handle.reportPlayback({
    playing: player.isPlaying(),
    currentTime: player.getCurrentTime(),
    duration: player.getDuration(),
    playbackRate: player.getPlaybackRate(),
  })
}, 1000)

// Later, when cleaning up
handle.release()
```

### video.reportAd

<!-- eslint-skip -->

```typescript
video.reportAd(isInAd: boolean): void
```

Convenience shortcut for reporting ad state directly from the context. Notifies the party that the user is viewing an ad so synchronization can be paused.

| Parameter | Type      | Description                         |
| --------- | --------- | ----------------------------------- |
| `isInAd`  | `boolean` | Whether an ad is currently playing. |

::: tip
Ad-exit transitions (`false`) have a 500ms debounce to prevent flickering when ads change rapidly between segments.
:::

#### Example

<!-- eslint-skip -->

```typescript
adObserver.on('adStart', () => ctx.video.reportAd(true))
adObserver.on('adEnd', () => ctx.video.reportAd(false))
```

### video.reportBuffering

<!-- eslint-skip -->

```typescript
video.reportBuffering(isBuffering: boolean): void
```

Convenience shortcut for reporting buffering state directly from the context. Notifies the party that the video is buffering so synchronization can account for it.

| Parameter     | Type      | Description                               |
| ------------- | --------- | ----------------------------------------- |
| `isBuffering` | `boolean` | Whether the video is currently buffering. |

::: tip
Buffering-exit transitions (`false`) have a 500ms debounce to prevent flickering during brief rebuffers.
:::

#### Example

<!-- eslint-skip -->

```typescript
video.addEventListener('waiting', () => ctx.video.reportBuffering(true))
video.addEventListener('playing', () => ctx.video.reportBuffering(false))
```

## Page Info

### setPageInfo

<!-- eslint-skip -->

```typescript
setPageInfo(info: PageInfo): void
```

Sets metadata about the current page. The title and subtitle are shown at the top of the Watch Party overlay on this tab.

#### Parameters

| Parameter        | Type     | Description                                    |
| ---------------- | -------- | ---------------------------------------------- |
| `info.title`     | `string` | The title of the content being viewed.         |
| `info.subtitle`  | `string` | A subtitle or secondary description.           |
| `info.thumbnail` | `string` | A URL to a thumbnail image. Not displayed yet. |

#### Example

<!-- eslint-skip -->

```typescript
ctx.setPageInfo({
  title: 'Episode 5 - The Final Chapter',
  subtitle: 'Season 2',
  thumbnail: 'https://example.com/thumb.jpg',
})
```

## Blocking

### reportBlocked

<!-- eslint-skip -->

```typescript
reportBlocked(reason: string): void
```

Reports that the user is blocked from viewing the content. Use this for login walls, geo-restrictions, or paywalls so other party members understand why synchronization has stopped. Reports from the controller are ignored.

#### Parameters

| Parameter | Type     | Description                                            |
| --------- | -------- | ------------------------------------------------------ |
| `reason`  | `string` | A human-readable description of why access is blocked. |

#### Example

<!-- eslint-skip -->

```typescript
if (!isLoggedIn) {
  ctx.reportBlocked('Login required to watch this content')
}
```

### reportUnblocked

<!-- eslint-skip -->

```typescript
reportUnblocked(): void
```

Reports that the user is no longer blocked. Call this after a previously reported block has been resolved.

#### Example

<!-- eslint-skip -->

```typescript
onLogin(() => {
  ctx.reportUnblocked()
})
```

## Custom Data

### sendCustomData

<!-- eslint-skip -->

```typescript
sendCustomData(key: string, data: unknown): void
```

Sends arbitrary data from the controller to the followers. Useful for syncing application-specific state that is not covered by the built-in APIs. Calls on a follower are ignored, as are payloads over 1 KB once serialized.

#### Parameters

| Parameter | Type      | Description                                                                                                      |
| --------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`  | A unique key identifying the data type. Must be 1-32 characters, alphanumeric with hyphens and underscores only. |
| `data`    | `unknown` | The data to send. Must be serializable.                                                                          |

#### Example

<!-- eslint-skip -->

```typescript
ctx.sendCustomData('subtitle-lang', { language: 'en', enabled: true })
```

### onCustomData

<!-- eslint-skip -->

```typescript
onCustomData(key: string, handler: (data: unknown) => void): () => void
```

Subscribes to custom data sent by the controller for the given key. Only followers receive it.

#### Parameters

| Parameter | Type                      | Description                                                                                     |
| --------- | ------------------------- | ----------------------------------------------------------------------------------------------- |
| `key`     | `string`                  | The key to listen for. Must be 1-32 characters, alphanumeric with hyphens and underscores only. |
| `handler` | `(data: unknown) => void` | Called when data is received for this key.                                                      |

#### Returns

An unsubscribe function. Call it to stop receiving data.

::: warning
The `key` parameter must be 1-32 characters long and can only contain alphanumeric characters, hyphens (`-`), and underscores (`_`).
:::

#### Example

<!-- eslint-skip -->

```typescript
const unsubscribe = ctx.onCustomData('subtitle-lang', (data) => {
  const { language, enabled } = data as { language: string, enabled: boolean }
  setSubtitleLanguage(language, enabled)
})

// Later, when cleaning up
unsubscribe()
```

## Main World Messaging

The `mainworld` namespace provides methods for communicating with scripts running in the page's main world (outside the content script sandbox).

### mainworld.send

<!-- eslint-skip -->

```typescript
mainworld.send(key: string, data?: unknown): void
```

Sends a one-way message to the main world.

#### Parameters

| Parameter | Type      | Description            |
| --------- | --------- | ---------------------- |
| `key`     | `string`  | The message key.       |
| `data`    | `unknown` | Optional data payload. |

#### Example

<!-- eslint-skip -->

```typescript
ctx.mainworld.send('request-player-state')
```

### mainworld.request

<!-- eslint-skip -->

```typescript
mainworld.request<T>(key: string, data?: unknown): Promise<T>
```

Sends a request to the main world and waits for a response.

#### Parameters

| Parameter | Type      | Description               |
| --------- | --------- | ------------------------- |
| `key`     | `string`  | The request key.          |
| `data`    | `unknown` | Optional request payload. |

#### Returns

A `Promise` that resolves with the response data from the main world.

::: warning
Requests have a 10-second timeout. If the main world does not respond within that window, the promise will reject.
:::

#### Example

<!-- eslint-skip -->

```typescript
const playerData = await ctx.mainworld.request<PlayerData>('get-player-data')
```

### mainworld.onMessage

<!-- eslint-skip -->

```typescript
mainworld.onMessage(key: string, handler: (data: unknown) => void): () => void
```

Listens for one-way messages from the main world.

#### Parameters

| Parameter | Type                      | Description                                           |
| --------- | ------------------------- | ----------------------------------------------------- |
| `key`     | `string`                  | The message key to listen for.                        |
| `handler` | `(data: unknown) => void` | Called when a message with the given key is received. |

#### Returns

An unsubscribe function.

### mainworld.onRequest

<!-- eslint-skip -->

```typescript
mainworld.onRequest(key: string, handler: (data: unknown) => unknown): () => void
```

Listens for requests from the main world and provides a response.

#### Parameters

| Parameter | Type                         | Description                                                                       |
| --------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `key`     | `string`                     | The request key to listen for.                                                    |
| `handler` | `(data: unknown) => unknown` | Called when a request is received. The return value is sent back as the response. |

#### Returns

An unsubscribe function.

## Party State

The `party` property exposes read-only state about the current Watch Party session and methods to subscribe to changes.

### party.role

<!-- eslint-skip -->

```typescript
party.role: 'controller' | 'follower'
```

The current user's role in the party, `"controller"` or `"follower"`. Read-only.

### party.paused

<!-- eslint-skip -->

```typescript
party.paused: boolean
```

Whether party playback is currently paused. Read-only.

### party.active

<!-- eslint-skip -->

```typescript
party.active: boolean
```

Whether the Watch Party session is currently active. Read-only.

### party.isHost

<!-- eslint-skip -->

```typescript
party.isHost: boolean
```

Whether the current user is the host of the party. Read-only.

### party.onRoleChange

<!-- eslint-skip -->

```typescript
party.onRoleChange(handler: (role: 'controller' | 'follower') => void): () => void
```

Subscribes to role changes.

#### Parameters

| Parameter | Type                                         | Description                          |
| --------- | -------------------------------------------- | ------------------------------------ |
| `handler` | `(role: 'controller' \| 'follower') => void` | Called when the user's role changes. |

#### Returns

An unsubscribe function.

### party.onPauseChange

<!-- eslint-skip -->

```typescript
party.onPauseChange(handler: (paused: boolean) => void): () => void
```

Subscribes to pause state changes.

#### Parameters

| Parameter | Type                        | Description                                |
| --------- | --------------------------- | ------------------------------------------ |
| `handler` | `(paused: boolean) => void` | Called when the party pause state changes. |

#### Returns

An unsubscribe function.

### party.onActiveChange

<!-- eslint-skip -->

```typescript
party.onActiveChange(handler: (active: boolean) => void): () => void
```

Subscribes to active state changes.

#### Parameters

| Parameter | Type                        | Description                                 |
| --------- | --------------------------- | ------------------------------------------- |
| `handler` | `(active: boolean) => void` | Called when the party active state changes. |

#### Returns

An unsubscribe function.

#### Example

<!-- eslint-skip -->

```typescript
const unsubRole = ctx.party.onRoleChange((role) => {
  console.log('Role changed to:', role)
})

const unsubPause = ctx.party.onPauseChange((paused) => {
  if (paused) {
    showPauseOverlay()
  }
  else {
    hidePauseOverlay()
  }
})

const unsubActive = ctx.party.onActiveChange((active) => {
  if (!active) {
    cleanup()
  }
})

// Later, when cleaning up
unsubRole()
unsubPause()
unsubActive()
```
