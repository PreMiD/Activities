# iFrames

Many websites use iFrames to embed content from other sources, such as videos, music players, or interactive elements. This guide will show you how to gather information from iFrames and use it in your activity.

## What are iFrames?

iFrames (Inline Frames) are HTML elements that allow you to embed another HTML document within the current document. They are commonly used to embed content from other websites, such as YouTube videos, SoundCloud players, or advertisements.

![iFrame Communication Diagram](https://placehold.co/800x400?text=iFrame+Communication+Diagram)

## When to Use iFrames

You should use iFrames in your activity when:

1. The website you're creating an activity for uses iFrames to display important content
2. The information you need to gather is inside an iFrame
3. You need to interact with elements inside an iFrame

Common examples include:

- Video streaming websites that embed videos in iFrames
- Music streaming websites that embed players in iFrames
- Websites that embed content from other platforms

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
    "en": "Example is a website that embeds videos in iFrames."
  },
  "url": "example.com",
  "version": "1.0.0",
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "category": "videos",
  "tags": ["example", "video"],
  "iframe": true
}
```

You **must** also specify the `iFrameRegExp` property to define which iFrames your activity should target:

```json
{
  "iframe": true,
  "iFrameRegExp": "example\\.com/embed/.*"
}
```

This regular expression pattern determines which iFrames the script will be injected into. The `iFrameRegExp` property is required when using iFrames, as it prevents your activity from unnecessarily injecting code into all iFrames on a page, which could cause performance issues or conflicts with other activities.

## Creating an iframe.ts File

When you set `iframe: true` in your `metadata.json` file, you need to create an `iframe.ts` file alongside your `presence.ts` file. This file will contain the code that runs inside the iFrames.

Here's a basic example of an `iframe.ts` file:

```typescript
import { getTimestamps } from 'premid'

const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  // Get the video element
  const video = document.querySelector('video')

  if (video) {
    // Send video information to the presence script
    iframe.send({
      video: {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        title: document.querySelector('.video-title')?.textContent
      }
    })
  }
})
```

## Receiving Data from iFrames

In your `presence.ts` file, you need to listen for the `iFrameData` event to receive data from the iFrames:

![iFrame Data Flow](https://placehold.co/800x400?text=iFrame+Data+Flow)

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
}

// Store iFrame data
let iFrameData: {
  video?: {
    paused?: boolean
    currentTime?: number
    duration?: number
    title?: string
  }
} = {}

// Listen for iFrame data
presence.on('iFrameData', (data) => {
  iFrameData = data
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  // Check if we have video data from the iFrame
  if (iFrameData.video) {
    const { paused, currentTime, duration, title } = iFrameData.video

    presenceData.details = title || 'Watching a video'

    if (paused) {
      presenceData.state = 'Paused'
    }
    else {
      presenceData.state = 'Playing'

      // Calculate timestamps if we have currentTime and duration
      if (currentTime && duration) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
      }
    }
  }
  else {
    presenceData.details = 'Browsing'
    presenceData.startTimestamp = browsingTimestamp
  }

  // Set the activity
  presence.setActivity(presenceData)
})
```

## Getting the iFrame URL

You can get the URL of the iFrame using the `getUrl` method:

```typescript
const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  // Get the iFrame URL
  const url = await iframe.getUrl()

  // Send the URL to the presence script
  iframe.send({
    url
  })
})
```

This can be useful for determining which iFrame is sending the data or for extracting information from the URL.

## Handling Multiple iFrames

If the website has multiple iFrames, you can identify them by their URL:

```typescript
const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  // Get the iFrame URL
  const url = await iframe.getUrl()

  // Handle different types of iFrames
  if (url.includes('youtube.com')) {
    // Handle YouTube iFrame
    const video = document.querySelector('video')

    if (video) {
      iframe.send({
        youtube: {
          paused: video.paused,
          currentTime: video.currentTime,
          duration: video.duration,
          title: document.querySelector('.ytp-title-link')?.textContent
        }
      })
    }
  }
  else if (url.includes('soundcloud.com')) {
    // Handle SoundCloud iFrame
    const playButton = document.querySelector('.playButton')
    const isPlaying = playButton?.classList.contains('playing') || false

    iframe.send({
      soundcloud: {
        playing: isPlaying,
        title: document.querySelector('.soundTitle__title')?.textContent
      }
    })
  }
})
```

In your `presence.ts` file, you can handle the different types of data:

```typescript
// Store iFrame data
let iFrameData: {
  youtube?: {
    paused?: boolean
    currentTime?: number
    duration?: number
    title?: string
  }
  soundcloud?: {
    playing?: boolean
    title?: string
  }
} = {}

// Listen for iFrame data
presence.on('iFrameData', (data) => {
  // Merge the new data with the existing data
  iFrameData = { ...iFrameData, ...data }
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  // Check if we have YouTube data
  if (iFrameData.youtube) {
    // Handle YouTube data
  }

  // Check if we have SoundCloud data
  if (iFrameData.soundcloud) {
    // Handle SoundCloud data
  }

  // Set the activity
  presence.setActivity(presenceData)
})
```

## Best Practices

1. **Always specify iFrameRegExp**: The `iFrameRegExp` property is **required** when using iFrames. Make sure to define a specific pattern that only matches the iFrames you need to target.
2. **Import getTimestamps from PreMiD**: Always use `import { getTimestamps } from 'premid'` instead of creating your own implementation.
3. **Manage browsing timestamps correctly**: Initialize browsing timestamps outside the UpdateData event and only update them when changing back to a browsing state, not on every UpdateData event. This ensures consistent elapsed time display.
4. **Use destructuring for timestamps**: Use the pattern `[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)` for cleaner code.
5. **Only use iFrames when necessary**: iFrames add complexity to your activity, so only use them when you need to gather information from iFrames.

## Complete Example

Here's a complete example of an activity that uses iFrames to gather information from embedded YouTube videos:

### metadata.json

```json
{
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "Example",
  "description": {
    "en": "Example is a website that embeds YouTube videos."
  },
  "url": "example.com",
  "version": "1.0.0",
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "category": "videos",
  "tags": ["example", "video"],
  "iframe": true,
  "iFrameRegExp": "youtube\\.com/embed/.*"
}
```

### iframe.ts

```typescript
const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  // Get the video element
  const video = document.querySelector('video')

  if (video) {
    // Send video information to the presence script
    iframe.send({
      video: {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        title: document.querySelector('.ytp-title-link')?.textContent
      }
    })
  }
})
```

### presence.ts

```typescript
import { getTimestamps, Assets } from 'premid'

const presence = new Presence({
  clientId: 'your_client_id'
})

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
}

// Define the type for iFrame data
interface IFrameData {
  video?: {
    paused?: boolean
    currentTime?: number
    duration?: number
    title?: string
  }
}

// Store iFrame data
let iFrameData: IFrameData = {}

// Create timestamps outside of UpdateData to maintain consistent browsing time
let browsingTimestamp = Math.floor(Date.now() / 1000)
// Track whether we were watching a video in the previous update
let wasWatchingVideo = false

// Listen for iFrame data
presence.on('iFrameData', (data: IFrameData) => {
  iFrameData = data
})

presence.on('UpdateData', async () => {
  // Get settings
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  // Check if we have video data from the iFrame
  if (iFrameData.video) {
    const { paused, currentTime, duration, title } = iFrameData.video

    // Set the activity type to Watching
    presenceData.type = ActivityType.Watching

    // Set the details and state
    presenceData.details = title || 'Watching a video'

    if (paused) {
      presenceData.state = 'Paused'
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
    else {
      presenceData.state = 'Playing'
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      // Add timestamps if enabled and we have currentTime and duration
      if (showTimestamp && currentTime && duration) {
        // Use destructuring assignment for timestamps
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(currentTime, duration)
      }
    }

    // Add buttons if enabled
    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Watch Video',
          url: document.location.href
        }
      ]
    }
  }
  else {
    // No video data, user is browsing the website

    // If we were watching a video before but now we're browsing,
    // reset the browsing timestamp to the current time
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
    }

    presenceData.details = 'Browsing'
    presenceData.startTimestamp = browsingTimestamp
  }

  // Update wasWatchingVideo state for the next update
  if (iFrameData.video) {
    wasWatchingVideo = true
  }

  // Set the activity
  presence.setActivity(presenceData)
})
```

## Next Steps

Now that you understand how to use iFrames in your activity, you can learn more about:

- [Slideshows](/v1/guide/slideshows): Learn how to create a slideshow that alternates between different presence data.
- [Localization](/v1/guide/localization): Learn how to add support for multiple languages to your activity.
- [Best Practices](/v1/guide/best-practices): Learn best practices for creating activities.
