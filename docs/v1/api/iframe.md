# iFrame Class

The `iFrame` class is used to gather information from iFrames on a webpage. It allows you to send data from iFrames back to the main presence script.

::: tip Important
To use iFrames in your activity, you must set both `iframe: true` and `iFrameRegExp` in your `metadata.json` file. See the [iFrames guide](/v1/guide/iframes) for more information.
:::

## Usage

To use the iFrame class, you need to create an `iframe.ts` file alongside your `presence.ts` file. The iFrame class is automatically instantiated in the iFrame context.

## Methods

### send

<!-- eslint-skip -->

```typescript
send(data: any): void;
```

Sends data from the iFrame back to the presence script.

#### Parameters

- `data`: The data to send

#### Example

```typescript
const iframe = new iFrame()

iframe.send({
  video: {
    title: document.querySelector('.video-title').textContent,
    currentTime: document.querySelector('video').currentTime,
    duration: document.querySelector('video').duration,
    paused: document.querySelector('video').paused
  }
})
```

### getUrl

<!-- eslint-skip -->

```typescript
getUrl(): Promise<string>;
```

Returns the iFrame URL.

#### Returns

- A promise that resolves to the iFrame URL

#### Example

```typescript
const url = await iframe.getUrl()
console.log(url) // "https://example.com/embed/video"
```

### on

<!-- eslint-skip -->

```typescript
on<K extends keyof IFrameEvents>(eventName: K, listener: (...args: IFrameEvents[K]) => Awaitable<void>): void;
```

Subscribes to events emitted by the extension.

#### Parameters

- `eventName`: The name of the event to subscribe to
- `listener`: The callback function for the event

#### Example

```typescript
iframe.on('UpdateData', () => {
  // Send updated data to the presence script
  iframe.send({
    video: {
      currentTime: document.querySelector('video').currentTime,
      paused: document.querySelector('video').paused
    }
  })
})
```

## Events

### UpdateData

Emitted on every tick, used to update the data sent from the iFrame.

#### Example

```typescript
iframe.on('UpdateData', () => {
  // Send updated data to the presence script
})
```

## Notes

- The `UpdateData` event is fired on every tick, so be careful not to send too much data or perform expensive operations.
- The iFrame class is only available in the iFrame context, not in the main presence script.
- Data sent from the iFrame is available in the main presence script through the `iFrameData` event.
