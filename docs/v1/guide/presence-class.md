# Presence Class

The `Presence` class is the main class for creating activities. It provides methods for setting the activity data, handling events, and interacting with the PreMiD extension.

## Creating a Presence Instance

To create a new Presence instance, you need to import the `Presence` class and create a new instance with a client ID:

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})
```

The client ID is automatically generated when you create a new activity using the PreMiD CLI.

## The UpdateData Event

The `UpdateData` event is the most important event for a Presence. It is fired regularly by the PreMiD extension, and it's where you should update your activity data.

```typescript
presence.on('UpdateData', async () => {
  // Update your activity data here
})
```

## Setting Activity Data

To set the activity data, you need to create a `PresenceData` object and pass it to the `setActivity` method:

```typescript
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png',
    details: 'Browsing Example.com',
    state: 'Homepage',
    startTimestamp: Date.now()
  }

  presence.setActivity(presenceData)
})
```

## PresenceData Properties

The `PresenceData` object can have the following properties:

| Property         | Type           | Description                                                                                            |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| `details`        | `string`       | The first line of the presence                                                                         |
| `state`          | `string`       | The second line of the presence                                                                        |
| `startTimestamp` | `number`       | The time when the activity started (Unix timestamp in milliseconds)                                    |
| `endTimestamp`   | `number`       | The time when the activity will end (Unix timestamp in milliseconds)                                   |
| `largeImageKey`  | `string`       | The key of the large image. Preferably a direct URL to an image (e.g., `https://example.com/logo.png`) |
| `largeImageText` | `string`       | The text that appears when hovering over the large image                                               |
| `smallImageKey`  | `string`       | The key of the small image. Preferably a direct URL to an image (e.g., `https://example.com/icon.png`) |
| `smallImageText` | `string`       | The text that appears when hovering over the small image                                               |
| `buttons`        | `ButtonData[]` | An array of buttons (max 2)                                                                            |

## Activity Types

You can set the type of activity using the `type` property:

```typescript
presenceData.type = ActivityType.Watching
```

The available activity types are:

| Type                     | Description                    |
| ------------------------ | ------------------------------ |
| `ActivityType.Playing`   | Shows as "Playing [name]"      |
| `ActivityType.Listening` | Shows as "Listening to [name]" |
| `ActivityType.Watching`  | Shows as "Watching [name]"     |
| `ActivityType.Competing` | Shows as "Competing in [name]" |

## Buttons

You can add up to two buttons to your activity:

```typescript
presenceData.buttons = [
  {
    label: 'Visit Website',
    url: 'https://example.com'
  },
  {
    label: 'View Page',
    url: document.URL
  }
]
```

Each button has a `label` and a `url` property. The `label` is the text that appears on the button, and the `url` is the link that opens when the button is clicked.

::: warning Button Guidelines
Buttons must follow our [Guidelines](/v1/guide/guidelines#buttons). Specifically:
- Redirects to main pages are prohibited
- Promoting websites is prohibited
- They can't display information you couldn't fit in other fields
- Redirecting directly to audio/video streams is prohibited
:::

## Timestamps

You can add timestamps to show how long the user has been doing an activity or how much time is left:

```typescript
// Show elapsed time
presenceData.startTimestamp = Date.now()

// Show remaining time
presenceData.endTimestamp = Date.now() + 60000 // 1 minute from now
```

You can also use the `getTimestamps` utility function to calculate timestamps for media:

```typescript
import { getTimestamps } from 'premid'

const video = document.querySelector('video')
const timestamps = getTimestamps(video.currentTime, video.duration)

presenceData.startTimestamp = timestamps[0]
presenceData.endTimestamp = timestamps[1]
```

## Clearing Activity

If you want to clear the activity, you can use the `clearActivity` method:

```typescript
presence.clearActivity()
```

## Getting Settings

If your activity has settings, you can get their values using the `getSetting` method:

```typescript
const showButtons = await presence.getSetting<boolean>('showButtons')
const displayFormat = await presence.getSetting<number>('displayFormat')
```

## Complete Example

Here's a complete example of a Presence class implementation:

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

presence.on('UpdateData', async () => {
  // Get settings
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')

  // Get page information
  const path = document.location.pathname

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png',
    details: 'Browsing Example.com'
  }

  // Update the state based on the current page
  if (path === '/') {
    presenceData.state = 'Homepage'
  }
  else if (path.includes('/about')) {
    presenceData.state = 'Reading about us'
  }
  else if (path.includes('/contact')) {
    presenceData.state = 'Contacting us'
  }
  else {
    presenceData.state = 'Browsing'
  }

  // Add timestamp if enabled
  if (showTimestamp) {
    presenceData.startTimestamp = Date.now()
  }

  // Add buttons if enabled
  if (showButtons) {
    presenceData.buttons = [
      {
        label: 'Visit Website',
        url: 'https://example.com'
      },
      {
        label: 'View Page',
        url: document.URL
      }
    ]
  }

  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
```

## Code Guidelines

When implementing your Presence class, make sure to follow our [Guidelines](/v1/guide/guidelines#code-requirements) for code requirements. These include:

- Using native functions when available
- Supporting the primary language of the website
- Using smallImageKey and smallImageText appropriately
- Properly handling cookies and undefined values

## Next Steps

Now that you understand how to use the Presence class, you can learn more about:

- [Settings](/v1/guide/settings): Learn how to add customizable settings to your activity.
- [iFrames](/v1/guide/iframes): Learn how to gather information from iframes.
- [Slideshows](/v1/guide/slideshows): Learn how to create a slideshow that alternates between different presence data.
