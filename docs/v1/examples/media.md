# Media Activity Example

This page provides an example of a PreMiD Activity for a media website. This example shows how to create an activity that displays what the user is watching or listening to, including media controls and timestamps.

## Basic Structure

A media activity consists of two files:

- `metadata.json`: Contains information about the activity
- `presence.ts`: Contains the code for the activity

### metadata.json

```json
{
  "apiVersion": 1,
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "MediaExample",
  "description": {
    "en": "MediaExample is a website for watching videos and listening to music."
  },
  "url": "mediaexample.com",
  "version": "1.0.0",
  "logo": "https://i.imgur.com/example.png",
  "thumbnail": "https://i.imgur.com/thumbnail.png",
  "color": "#FF0000",
  "category": "videos",
  "tags": ["video", "music", "media"]
}
```

### presence.ts

```typescript
import { getTimestampsFromMedia, browsingTimestamp, Assets, ActivityType } from 'premid'

const presence = new Presence({
  clientId: 'your_client_id'
})

presence.on('UpdateData', async () => {
  // Use destructuring for document.location
  const { href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/example.png'
  }

  // Get the video element
  const video = document.querySelector('video')

  if (video && video.readyState > 0) {
    // Get video information
    const title = document.querySelector('.video-title')?.textContent || 'Unknown video'
    const author = document.querySelector('.video-author')?.textContent || 'Unknown author'
    const isPlaying = !video.paused

    // Set the activity type to Watching
    presenceData.type = ActivityType.Watching

    // Set the details and state
    presenceData.details = title
    presenceData.state = `By ${author}`

    // Set the large image text
    presenceData.largeImageText = 'MediaExample'

    if (isPlaying) {
      // Set the small image key and text for playing state using Assets enum
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      // Calculate timestamps using recommended destructuring assignment
      [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
    else {
      // Set the small image key and text for paused state using Assets enum
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }

    // Add buttons
    presenceData.buttons = [
      {
        label: 'Watch Video',
        url: href
      },
      {
        label: 'Visit Channel',
        url: document.querySelector('.channel-link')?.getAttribute('href') || href
      }
    ]
  }
  else {
    // User is browsing the website
    presenceData.details = 'Browsing'
    presenceData.state = 'Looking for videos'
    presenceData.startTimestamp = browsingTimestamp
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

## How It Works

1. We import the necessary utilities and enums from the `premid` package: `getTimestampsFromMedia`, `browsingTimestamp`, `Assets`, and `ActivityType`.
2. We create a new `Presence` instance with a client ID.
3. We listen for the `UpdateData` event, which is fired regularly by the PreMiD extension.
4. We use destructuring to get the `href` from `document.location`.
5. We create a `PresenceData` object with a `largeImageKey` property, which is a direct URL to the logo image on imgur.
6. We get the video element using `document.querySelector("video")`.
7. If a video is found and it's ready to play:
   - We get the video title and author from the page.
   - We set the activity type to `ActivityType.Watching`.
   - We set the details and state to show the video title and author.
   - We set the large image text to the name of the service.
   - If the video is playing:
     - We set the small image key using the `Assets.Play` enum value.
     - We calculate timestamps using the `getTimestampsFromMedia` function and assign them directly using destructuring: `[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)`.
   - If the video is paused:
     - We set the small image key using the `Assets.Pause` enum value.
   - We add buttons to link to the video and the channel, using the `href` variable.
8. If no video is found or it's not ready to play:
   - We set the details and state to indicate that the user is browsing the website.
   - We use the `browsingTimestamp` constant to show how long the user has been browsing.
9. Finally, we set the activity using `presence.setActivity()`.

## Handling Different Media Types

You can modify this example to handle different types of media:

### For Audio

```typescript
// Set the activity type to Listening
presenceData.type = ActivityType.Listening

// Set the details and state
presenceData.details = 'Listening to'
presenceData.state = `${title} by ${artist}`
```

### For Live Streams

```typescript
// For live streams, only use startTimestamp
presenceData.startTimestamp = Date.now()
delete presenceData.endTimestamp

// Indicate that it's a live stream
presenceData.state = `${title} (Live)`
```

## Testing

To test this activity:

1. Make sure the PreMiD extension is installed in your browser.
2. Enable developer mode in the extension settings.
3. Add your local activity to the extension.
4. Visit a media website that has video or audio elements.
5. Check your Discord status to see if it's showing the activity.

## Next Steps

This example shows how to create a basic media activity. You can enhance it by:

- Adding support for playlists or albums
- Detecting different types of content (videos, music, podcasts, etc.)
- Adding settings to allow users to customize what information is displayed
- Using iFrames to gather information from embedded media players

Check out the other examples in this section for more advanced usage:

- [Activity with Settings](/v1/examples/settings): Shows how to add customizable settings to your activity
- [Activity with iFrames](/v1/examples/iframes): Shows how to gather information from iFrames
- [Activity with Slideshow](/v1/examples/slideshow): Shows how to create a slideshow that alternates between different presence data
