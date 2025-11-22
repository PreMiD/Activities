# Presence Class

The `Presence` class is the main class for creating activities. It provides methods for setting the activity data, handling events, and interacting with the PreMiD extension.

## Creating a Presence Instance

To create a new Presence instance, you need to import the `Presence` class and create a new instance with a Discord Application ID:

```typescript
const presence = new Presence({
  clientId: '1234567890123456789' // Replace with your Discord Application ID
})
```

::: warning Important
The `clientId` is your Discord Application ID, which you must obtain from the [Discord Developer Portal](https://discord.com/developers/applications). Each activity must use its own unique client ID - do not use PreMiD's client ID.

See the [Creating Your First Activity](/v1/guide/first-activity#getting-a-discord-client-id) guide for detailed instructions on how to obtain a Discord Application ID.
:::

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
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/XXXXXXX.png', // Replace with your logo URL
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Browsing Example.com',
    state: 'Homepage',
    startTimestamp: browsingTimestamp
  }

  presence.setActivity(presenceData)
})
```

## PresenceData Properties

The `PresenceData` object can have the following properties:

| Property           | Type                | Description                                                                                            |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------ |
| `name`             | `string`            | The name of the activity                                                                               |
| `type`             | `ActivityType`      | The type of activity                                                                                   |
| `stateDisplayType` | `StatusDisplayType` | Controls which field is displayed in the user's status text in the member list                         |
| `details`          | `string`            | The first line of the activity                                                                         |
| `detailsUrl`       | `string`            | The URL the user will be redirected to when clicking the details text                                  |
| `state`            | `string`            | The second line of the activity                                                                        |
| `stateUrl`         | `string`            | The URL the user will be redirected to when clicking the state text                                    |
| `startTimestamp`   | `number`            | The time when the activity started (Unix timestamp in milliseconds)                                    |
| `endTimestamp`     | `number`            | The time when the activity will end (Unix timestamp in milliseconds)                                   |
| `largeImageKey`    | `string`            | The key of the large image. Preferably a direct URL to an image (e.g., `https://example.com/logo.png`) |
| `largeImageUrl`    | `string`            | The URL the user will be redirected to when clicking the large image                                   |
| `largeImageText`   | `string`            | The text that appears when hovering over the large image                                               |
| `smallImageKey`    | `string`            | The key of the small image. Preferably a direct URL to an image (e.g., `https://example.com/icon.png`) |
| `smallImageUrl`    | `string`            | The URL the user will be redirected to when clicking the small image                                   |
| `smallImageText`   | `string`            | The text that appears when hovering over the small image                                               |
| `buttons`          | `ButtonData[]`      | An array of buttons (max 2)                                                                            |

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

::: tip Special Season and Episode Formatting
When using `ActivityType.Watching`, you can display a special season and episode indicator by setting the `largeImageText` property to follow the pattern "word digit, digit". For example: `"Season 2, Episode 5"`. Discord will automatically detect this pattern and display it as "S2E5" in the activity.

The pattern must follow the exact structure: word, space, digit, comma, space, digit. Discord will automatically convert this to "SxEy" format regardless of what word you use.

See the [PresenceData documentation](/v1/api/presence-data#special-season-and-episode-formatting) for more details.
:::

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
    url: document.location.href
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

You can also use the `getTimestampsFromMedia` utility function to calculate timestamps for media:

<!-- eslint-skip -->

```typescript
import { getTimestampsFromMedia } from 'premid'

const video = document.querySelector('video')

[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
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

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
}

presence.on('UpdateData', async () => {
  // Get settings
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')

  // Get page information
  const { pathname } = document.location

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  // Only show activity on public pages, not private/sensitive ones
  if (pathname === '/') {
    presenceData.details = 'Browsing Example.com'
    presenceData.state = 'Homepage'
  }
  else if (pathname.includes('/about')) {
    presenceData.details = 'Reading about Example.com'
    presenceData.state = 'About page'
  }
  else if (pathname.includes('/contact')) {
    presenceData.details = 'Contacting Example.com'
    presenceData.state = 'Contact page'
  }
  else if (pathname.includes('/login') || pathname.includes('/signup') || pathname.includes('/account')) {
    // Don't show activity on private/login pages for privacy
    // details will remain undefined
  }
  else {
    presenceData.details = 'Browsing Example.com'
    presenceData.state = 'Exploring'
  }

  // Add timestamp if enabled
  if (showTimestamp) {
    presenceData.startTimestamp = browsingTimestamp
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
        url: document.location.href
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
