# Presence Class

The `Presence` class is the main class for creating activities. It provides methods for setting the activity data, handling events, and interacting with the PreMiD extension.

## Constructor

<!-- eslint-skip -->

```typescript
constructor(presenceOptions: PresenceOptions);
```

Creates a new Presence instance.

### Parameters

- `presenceOptions`: An object containing the following properties:
  - `clientId`: The Discord application client ID
  - `injectOnComplete` (optional): If true, the UpdateData event will only be fired when the page has fully loaded

### Example

```typescript
const presence = new Presence({
  clientId: '123456789012345678'
})
```

## Methods

### setActivity

<!-- eslint-skip -->

```typescript
setActivity(data?: PresenceData | Slideshow): Promise<void>;
```

Sets the presence activity and sends it to the application.

#### Parameters

- `data` (optional): The presence data to set, or a Slideshow instance

#### Example

```typescript
presence.setActivity({
  details: 'Reading documentation',
  state: 'Learning about the Presence class',
  largeImageKey: ActivityAssets.Logo,
  startTimestamp: browsingTimestamp
})
```

### clearActivity

<!-- eslint-skip -->

```typescript
clearActivity(): void;
```

Clears the activity shown in Discord.

#### Example

```typescript
presence.clearActivity()
```

### getStrings

<!-- eslint-skip -->

```typescript
getStrings<T extends { [K: string]: string }>(strings: T): Promise<T>;
```

Gets translations from the extension.

#### Parameters

- `strings`: An object with keys being the key for the string, and values being the string value

#### Example

```typescript
const strings = await presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused'
})

console.log(strings.play) // "Playing"
console.log(strings.pause) // "Paused"
```

### getPageVariable

<!-- eslint-skip -->

```typescript
getPageVariable<T extends Record<string, any> = Record<string, unknown>>(...variables: string[]): Promise<T>;
```

Gets variables from the web page. Supports nested variables using dot notation.

#### Parameters

- `variables`: The variables to get

#### Example

```typescript
const {
  normalVariable,
  'variable.with.deep': deepVariable,
} = await presence.getPageVariable<{
  'normalVariable': string
  'variable.with.deep': string
}>(
  'normalVariable',
  'variable.with.deep'
)
```

### execInPage

::: tip Requires extension 2.14+
`execInPage` was added in extension **2.14**. Activities run on every installed version, so guard the call with the bundled [`supports`](/v1/api/utility-functions#supports) helper — on older extensions the method is missing, and feature-detecting lets it degrade gracefully instead of throwing.
:::

<!-- eslint-skip -->

```typescript
execInPage<T = unknown, A extends unknown[] = unknown[]>(fn: (...args: A) => T | Promise<T>, ...args: A): Promise<T>;
execInPage<T = unknown>(spec: ExecInPageSpec): Promise<T>;
```

Runs code in the **web page's own realm** and resolves with its return value. Unlike [`getPageVariable`](#getpagevariable), which only reads a variable, `execInPage` runs a function _inside the page_ — so you can call the page's own functions and reshape the result before it is sent back to the activity.

The return value must be **JSON-serializable**. Strip non-serializable parts (DOM nodes, streams, circular references) inside the function before returning.

::: warning The closure is isolated
The function is serialized and re-evaluated in the page, so it **cannot reference activity-side variables** (imports, closures, module scope). Pass any values it needs as trailing arguments — they are forwarded to the function with their types preserved.
:::

#### Function form

##### Parameters

- `fn`: A function executed in the page. Receives `...args` and returns a serializable value (or a promise of one).
- `args`: Serializable values forwarded to `fn` as arguments.

##### Example

```typescript
import { supports } from 'premid'

if (supports(presence, 'execInPage')) {
  const track = await presence.execInPage((userId) => {
    const state = window.spotifyPlayer.getCurrentState()
    return { userId, title: state.track.name, paused: state.paused }
  }, currentUserId)
}
```

#### Declarative form (`ExecInPageSpec`)

For pages whose Content-Security-Policy blocks `eval`, pass a declarative spec instead of a closure. It reads a value or calls a page function by dot-path — no code evaluation, so it works under strict CSP.

| Property | Type        | Description                                                                  |
| -------- | ----------- | ---------------------------------------------------------------------------- |
| `get`    | `string`    | Dot-path to a value on `window` to read (e.g. `'player.track.name'`).        |
| `call`   | `string`    | Dot-path to a page function to invoke (e.g. `'spotifyPlayer.getState'`).     |
| `args`   | `unknown[]` | Arguments passed to the `call` function (must be serializable).              |
| `pick`   | `string[]`  | Keep only these keys of the result. Dot-paths allowed (e.g. `'track.name'`). |
| `omit`   | `string[]`  | Drop these keys from the result. Dot-paths allowed (e.g. `'track.art'`).     |

##### Example

```typescript
// Read a nested value
const title = await presence.execInPage<string>({ get: 'player.track.name' })

// Call a page function and keep only some fields of the result
const state = await presence.execInPage({
  call: 'spotifyPlayer.getState',
  pick: ['paused', 'position'],
})

// Dot-paths pull nested fields out of a call result
const track = await presence.execInPage({
  call: 'spotifyPlayer.getState',
  pick: ['track.name', 'track.artist'],
}) // → { track: { name, artist } }
```

### onRequest

::: tip Requires extension 2.14+
`onRequest` was added in extension **2.14**. Guard the call with the bundled [`supports`](/v1/api/utility-functions#supports) helper so it degrades gracefully on older extensions.
:::

<!-- eslint-skip -->

```typescript
onRequest(filter: RequestFilter, callback: (request: InterceptedRequest) => void): () => void;
```

**Reads** (never modifies) requests the page makes via `fetch` or `XMLHttpRequest`, including requests made inside the activity's iframes. Use it to pull data straight from a site's own API responses instead of scraping the DOM.

Interception runs from `document_start`. Requests that complete **before** your activity registers a filter are replayed to the callback with request metadata only — no `responseBody`.

#### Parameters

- `filter` (`RequestFilter`): Which requests to match. Omitting a field matches everything for that field.

  | Property | Type                 | Description                                                     |
  | -------- | -------------------- | --------------------------------------------------------------- |
  | `url`    | `string \| RegExp`   | Match the request URL — substring (string) or pattern (RegExp). |
  | `method` | `string \| string[]` | Match the HTTP method (case-insensitive). One or many.          |

- `callback`: Invoked with an `InterceptedRequest` for each matching request.

#### Returns

An **unsubscribe** function. Call it to stop receiving requests (e.g. when the relevant page section is gone).

#### InterceptedRequest

A read-only snapshot of the request and its response passed to the callback:

| Property          | Type                     | Description                                               |
| ----------------- | ------------------------ | --------------------------------------------------------- |
| `url`             | `string`                 | Request URL                                               |
| `method`          | `string`                 | HTTP method                                               |
| `requestHeaders`  | `Record<string, string>` | Request headers                                           |
| `requestBody`     | `string \| null`         | Request body, if any                                      |
| `status`          | `number`                 | Response status code                                      |
| `statusText`      | `string`                 | Response status text                                      |
| `ok`              | `boolean`                | `true` for 2xx responses                                  |
| `responseHeaders` | `Record<string, string>` | Response headers                                          |
| `responseBody`    | `string \| null`         | Response body (`null` for requests replayed at page load) |
| `frameUrl`        | `string`                 | URL of the frame the request originated from              |
| `timestamp`       | `number`                 | When the request completed (Unix ms)                      |

#### Example

```typescript
import { supports } from 'premid'

if (supports(presence, 'onRequest')) {
  const unsubscribe = presence.onRequest(
    { url: '/youtubei/v1/player', method: 'POST' },
    (request) => {
      if (!request.responseBody)
        return

      const { videoDetails } = JSON.parse(request.responseBody)
      // videoDetails.title, videoDetails.author, videoDetails.lengthSeconds, ...
    },
  )

  // Later, to stop listening:
  // unsubscribe()
}
```

::: warning Read-only
`onRequest` can only observe requests — it cannot modify, block, or replay them. It is intended for reading data the page already fetches, not for making your own requests.
:::

### getSetting

<!-- eslint-skip -->

```typescript
getSetting<T extends string | boolean | number>(setting: string): Promise<T>;
```

Gets a setting from the presence metadata.

#### Parameters

- `setting`: The ID of the setting as defined in metadata

#### Example

```typescript
const showButtons = await presence.getSetting<boolean>('showButtons')
```

### hideSetting

<!-- eslint-skip -->

```typescript
hideSetting(settings: string | string[]): Promise<void>;
```

Hides a setting.

#### Parameters

- `settings`: The ID of the setting or an array of setting IDs

#### Example

```typescript
presence.hideSetting('showTimestamp')
```

### showSetting

<!-- eslint-skip -->

```typescript
showSetting(settings: string | string[]): Promise<void>;
```

Shows a setting.

#### Parameters

- `settings`: The ID of the setting or an array of setting IDs

#### Example

```typescript
presence.showSetting('showTimestamp')
```

### getLogs

<!-- eslint-skip -->

```typescript
getLogs<T = unknown>(regExp?: RegExp, options?: { types?: ConsoleLogType[], contentOnly?: boolean }): Promise<T[] | ConsoleLog<T>[]>;
```

Returns an array of the past 100 logs, optionally filtered with a RegExp.

#### Parameters

- `regExp` (optional): Filter for the logs content
- `options` (optional): Options for the logs
  - `types`: Types of logs to get (default: `["log"]`)
  - `contentOnly`: Whether to only get the content of the logs (default: `true`)

#### Example

```typescript
const logs = await presence.getLogs(/error/i, { types: ['error', 'warn'] })
```

### getExtensionVersion

<!-- eslint-skip -->

```typescript
getExtensionVersion(onlyNumeric?: boolean): string | number;
```

Returns the extension version.

#### Parameters

- `onlyNumeric` (optional): If true, returns the version number without dots

#### Example

```typescript
const version = presence.getExtensionVersion()
console.log(version) // "2.2.0"
```

### createSlideshow

<!-- eslint-skip -->

```typescript
createSlideshow(): Slideshow;
```

Creates a slideshow that allows for alternating between sets of presence data at specific intervals.

#### Example

```typescript
const slideshow = presence.createSlideshow()
```

### on

<!-- eslint-skip -->

```typescript
on<K extends keyof PresenceEvents>(eventName: K, listener: (...args: PresenceEvents[K]) => Awaitable<void>): void;
```

Subscribes to events emitted by the extension.

#### Parameters

- `eventName`: The name of the event to subscribe to
- `listener`: The callback function for the event

#### Example

```typescript
presence.on('UpdateData', async () => {
  // Update the presence data
})
```

## Events

### UpdateData

Emitted on every tick, used to update the data displayed in the presence.

#### Example

```typescript
presence.on('UpdateData', async () => {
  // Update the presence data
})
```

### iFrameData

Emitted when data is received from the iframe.ts file.

#### Example

```typescript
presence.on('iFrameData', (data) => {
  console.log(data)
})
```

## Utility Methods

### info

<!-- eslint-skip -->

```typescript
info(message: string): void;
```

Console logs with an info message.

#### Parameters

- `message`: The log message

#### Example

```typescript
presence.info('This is an info message')
```

### success

<!-- eslint-skip -->

```typescript
success(message: string): void;
```

Console logs with a success message.

#### Parameters

- `message`: The log message

#### Example

```typescript
presence.success('This is a success message')
```

### error

<!-- eslint-skip -->

```typescript
error(message: string): void;
```

Console logs with an error message.

#### Parameters

- `message`: The log message

#### Example

```typescript
presence.error('This is an error message')
```
