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
  largeImageKey: 'https://example.com/logo.png',
  startTimestamp: Date.now()
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
const pageVars = await presence.getPageVariable('document.title', 'window.artist')
const title = pageVars['document.title']
const artist = pageVars['window.artist']
```

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
