# SyncScriptContext

The `SyncScriptContext` is the main object sync script developers interact with when building Watch Party sync scripts. It provides methods for video synchronization, page metadata, cross-frame messaging, and party state observation.

See the [Sync Script Types](/v1/api/sync-script-types) reference for full interface definitions, and the [Watch Party Sync Scripts](/v1/guide/watch-party-sync-scripts) guide for usage patterns.

## Registration

### SyncScriptV1.register

<!-- eslint-skip -->

```typescript
SyncScriptV1.register(options: {
  setup: (ctx: SyncScriptContext) => (() => void) | void
  onNavigate?: (ctx: SyncScriptContext, url: string) => void
}): SyncScriptHandle
```

Registers a sync script with the PreMiD extension. The `setup` function is called once when the sync script is initialized. Return a cleanup function from `setup` to dispose of resources when the script is torn down.

#### Parameters

| Parameter            | Type                                               | Description                                                                                |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `options.setup`      | `(ctx: SyncScriptContext) => (() => void) \| void` | Called once on initialization. Receives the context object. May return a cleanup function. |
| `options.onNavigate` | `(ctx: SyncScriptContext, url: string) => void`    | Called when the user navigates to a new page within the same site.                         |

#### Returns

A `SyncScriptHandle` for managing the registered script.

#### Example

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
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

Declares which sync features this script supports. Must be called before using any feature-specific APIs such as `video`.

#### Parameters

| Parameter         | Type      | Description                    |
| ----------------- | --------- | ------------------------------ |
| `features.video`  | `boolean` | Enable video synchronization.  |
| `features.cursor` | `boolean` | Enable cursor synchronization. |
| `features.scroll` | `boolean` | Enable scroll synchronization. |

::: warning
You must call `features()` before accessing `video.attach()` or `video.takeControl()`. Calling video methods without declaring video support will throw an error.
:::

#### Example

<!-- eslint-skip -->

```typescript
ctx.features({ video: true, cursor: true })
```

## Video

### video.attach

<!-- eslint-skip -->

```typescript
video.attach(element: HTMLMediaElement | string): AutoVideoHandle
```

Attaches to a standard HTML media element for automatic video synchronization. PreMiD will automatically manage play, pause, seek, and playback rate events on the element.

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
| `options.onPlay`         | `() => void`             | Called when the party requests playback to start.                                             |
| `options.onPause`        | `() => void`             | Called when the party requests playback to pause.                                             |
| `options.onSeek`         | `(time: number) => void` | Called when the party requests a seek to a specific time in seconds.                          |
| `options.onRate`         | `(rate: number) => void` | Called when the party requests a playback rate change.                                        |
| `options.pauseAfterSeek` | `boolean \| number`      | If `true`, pauses after seeking. If a number, pauses after a delay of that many milliseconds. |

#### Returns

A `ManualVideoHandle` with the following methods:

- `reportPlayback(state)` -- Reports current playback state (time, duration, paused, rate) to the party.
- `onSyncCommand(handler)` -- Registers a handler called on sync commands. Returns an unsubscribe function.
- `reportAd(isInAd)` -- Reports whether an ad is currently playing.
- `reportBuffering(isBuffering)` -- Reports whether the video is buffering.
- `release()` -- Releases manual control and stops synchronization.

#### Example

<!-- eslint-skip -->

```typescript
const player = getCustomPlayer()

const handle = ctx.video.takeControl({
  onPlay: () => player.play(),
  onPause: () => player.pause(),
  onSeek: (time) => player.seekTo(time),
  onRate: (rate) => player.setPlaybackRate(rate),
  pauseAfterSeek: 200,
})

// Report playback state periodically
setInterval(() => {
  handle.reportPlayback({
    time: player.getCurrentTime(),
    duration: player.getDuration(),
    paused: player.isPaused(),
    rate: player.getPlaybackRate(),
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

Sets metadata about the current page that is displayed to other party members.

#### Parameters

| Parameter        | Type     | Description                            |
| ---------------- | -------- | -------------------------------------- |
| `info.title`     | `string` | The title of the content being viewed. |
| `info.subtitle`  | `string` | A subtitle or secondary description.   |
| `info.thumbnail` | `string` | A URL to a thumbnail image.            |

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

Reports that the user is blocked from viewing the content. Use this for login walls, geo-restrictions, or paywalls so other party members understand why synchronization has stopped.

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

Sends arbitrary data to other party members. Useful for syncing application-specific state that is not covered by the built-in APIs.

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

Subscribes to custom data sent by other party members for the given key.

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

## Iframe Messaging

The `iframe` namespace provides methods for communicating between the content script and iframes on the page.

### iframe.send

<!-- eslint-skip -->

```typescript
iframe.send(frameId: string, key: string, data?: unknown): void
```

Sends a one-way message to a specific iframe.

#### Parameters

| Parameter | Type      | Description                          |
| --------- | --------- | ------------------------------------ |
| `frameId` | `string`  | The identifier of the target iframe. |
| `key`     | `string`  | The message key.                     |
| `data`    | `unknown` | Optional data payload.               |

#### Example

<!-- eslint-skip -->

```typescript
ctx.iframe.send('player-frame', 'toggle-captions', { enabled: true })
```

### iframe.request

<!-- eslint-skip -->

```typescript
iframe.request<T>(frameId: string, key: string, data?: unknown): Promise<T>
```

Sends a request to an iframe and waits for a response.

#### Parameters

| Parameter | Type      | Description                          |
| --------- | --------- | ------------------------------------ |
| `frameId` | `string`  | The identifier of the target iframe. |
| `key`     | `string`  | The request key.                     |
| `data`    | `unknown` | Optional request payload.            |

#### Returns

A `Promise` that resolves with the response data from the iframe.

::: warning
Requests have a 10-second timeout. If the iframe does not respond within that window, the promise will reject.
:::

#### Example

<!-- eslint-skip -->

```typescript
const currentTime = await ctx.iframe.request<number>('player-frame', 'get-time')
```

### iframe.onMessage

<!-- eslint-skip -->

```typescript
iframe.onMessage(key: string, handler: (data: unknown) => void): () => void
```

Listens for one-way messages from iframes.

#### Parameters

| Parameter | Type                      | Description                                           |
| --------- | ------------------------- | ----------------------------------------------------- |
| `key`     | `string`                  | The message key to listen for.                        |
| `handler` | `(data: unknown) => void` | Called when a message with the given key is received. |

#### Returns

An unsubscribe function.

#### Example

<!-- eslint-skip -->

```typescript
const unsubscribe = ctx.iframe.onMessage('player-state', (data) => {
  console.log('Player state:', data)
})
```

### iframe.onRequest

<!-- eslint-skip -->

```typescript
iframe.onRequest(key: string, handler: (data: unknown) => unknown): () => void
```

Listens for requests from iframes and provides a response.

#### Parameters

| Parameter | Type                         | Description                                                                       |
| --------- | ---------------------------- | --------------------------------------------------------------------------------- |
| `key`     | `string`                     | The request key to listen for.                                                    |
| `handler` | `(data: unknown) => unknown` | Called when a request is received. The return value is sent back as the response. |

#### Returns

An unsubscribe function.

#### Example

<!-- eslint-skip -->

```typescript
const unsubscribe = ctx.iframe.onRequest('get-page-title', () => {
  return document.title
})
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
party.role: string
```

The current user's role in the party (e.g., `"host"`, `"viewer"`). Read-only.

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
party.onRoleChange(handler: (role: string) => void): () => void
```

Subscribes to role changes.

#### Parameters

| Parameter | Type                     | Description                          |
| --------- | ------------------------ | ------------------------------------ |
| `handler` | `(role: string) => void` | Called when the user's role changes. |

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
