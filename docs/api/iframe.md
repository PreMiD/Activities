# iFrame Class

The `iFrame` class is used to gather information from iFrames on a webpage. It allows you to send data from iFrames back to the main presence script.

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

## Complete Example

Here's a complete example of how to use the iFrame class:

### iframe.ts

```typescript
const iframe = new iFrame()

iframe.on('UpdateData', () => {
  const video = document.querySelector('video')

  if (video) {
    iframe.send({
      video: {
        title: document.querySelector('.video-title')?.textContent,
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused
      }
    })
  }
})
```

### presence.ts

```typescript
const presence = new Presence({
  clientId: '123456789012345678'
})

// Store iFrame data
let iFrameData: {
  video?: {
    title?: string
    currentTime?: number
    duration?: number
    paused?: boolean
  }
} = {}

// Listen for iFrame data
presence.on('iFrameData', (data) => {
  iFrameData = data
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'logo'
  }

  // Check if we have video data from the iFrame
  if (iFrameData.video) {
    const { title, currentTime, duration, paused } = iFrameData.video

    presenceData.details = title || 'Watching a video'

    if (paused) {
      presenceData.state = 'Paused'
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
    else {
      presenceData.state = 'Playing'

      // Calculate timestamps if we have currentTime and duration
      if (currentTime && duration) {
        const timestamps = getTimestamps(currentTime, duration)
        presenceData.startTimestamp = timestamps[0]
        presenceData.endTimestamp = timestamps[1]
      }
    }
  }
  else {
    presenceData.details = 'Browsing'
    presenceData.startTimestamp = Date.now()
  }

  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})

// Helper function to calculate timestamps
function getTimestamps(currentTime: number, duration: number): [number, number] {
  const startTime = Date.now()
  const endTime = startTime + (duration - currentTime) * 1000
  return [startTime, endTime]
}
```

## Setting Up iFrames in metadata.json

To use iFrames in your activity, you need to set the `iframe` property to `true` in your `metadata.json` file:

```json
{
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "Example",
  "description": {
    "en": "Example is a website that does something cool."
  },
  "url": "example.com",
  "version": "1.0.0",
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "tag"],
  "iframe": true
}
```

If you need to target specific iFrames, you can use the `iFrameRegExp` property:

```json
{
  "iframe": true,
  "iFrameRegExp": "example\\.com/embed/.*"
}
```

This will only inject the iFrame script into iFrames that match the regular expression.

## Notes

- The iFrame class is only available in the iFrame context, not in the main presence script.
- You need to set `iframe: true` in your `metadata.json` file to use iFrames.
- The `UpdateData` event is fired on every tick, so be careful not to send too much data or perform expensive operations.
- The data sent from the iFrame is available in the main presence script through the `iFrameData` event.
