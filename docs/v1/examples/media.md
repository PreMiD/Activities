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
  "logo": "https://i.imgur.com/XXXXXXX.png",
  "thumbnail": "https://i.imgur.com/YYYYYYY.png",
  "color": "#FF0000",
  "category": "videos",
  "tags": ["video", "music", "media"]
}
```

### presence.ts

<!-- eslint-skip -->

```typescript
import { Assets, getTimestampsFromMedia } from 'premid'

// Define custom assets enum
enum ActivityAssets {
  Logo = 'https://i.imgur.com/XXXXXXX.png', // Will be replaced with CDN URL after review
  Play = 'https://i.imgur.com/YYYYYYY.png',
  Pause = 'https://i.imgur.com/ZZZZZZZ.png',
  Live = 'https://i.imgur.com/WWWWWWW.png'
}

const presence = new Presence({
  clientId: 'your_client_id'
})

// Create browsing timestamp outside UpdateData to maintain consistent timing
let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatchingVideo = false

presence.on('UpdateData', async () => {
  // Use destructuring for document.location
  const { pathname, hostname, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo
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
      // Set the small image key and text for playing state
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      // Calculate timestamps using destructuring
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
    }
    else {
      // Set the small image key and text for paused state
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }

    // Add buttons
    presenceData.buttons = [
      {
        label: 'Watch Video',
        url: document.URL
      },
      {
        label: 'Visit Channel',
        url: document.querySelector('.channel-link')?.getAttribute('href') || document.URL
      }
    ]
  }
  else {
    // User is browsing the website
    // Only update browsing timestamp when changing from watching to browsing
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
    }

    presenceData.details = 'Browsing'
    presenceData.state = 'Looking for videos'
    presenceData.startTimestamp = browsingTimestamp
  }

  // Update wasWatchingVideo state for the next update
  if (video && video.readyState > 0 && !video.paused) {
    wasWatchingVideo = true
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

1. We import the `getTimestampsFromMedia` and `Assets` from the `premid` package.
2. We define an `ActivityAssets` enum for custom assets used in our activity.
3. We create a new `Presence` instance with a client ID.
4. We initialize a `browsingTimestamp` variable outside the UpdateData event to maintain consistent timing.
5. We listen for the `UpdateData` event, which is fired regularly by the PreMiD extension.
6. We use destructuring to access document.location properties: `const { pathname, hostname, href } = document.location`.
7. We create a `PresenceData` object with a `largeImageKey` property using our ActivityAssets enum.
8. We get the video element using `document.querySelector("video")`.
9. If a video is found and it's ready to play:
   - We get the video title and author from the page.
   - We set the activity type to `ActivityType.Watching`.
   - We set the details and state to show the video title and author.
   - We set the large image text to the name of the service.
   - If the video is playing:
     - We set the small image key to `Assets.Play` to indicate that the video is playing.
     - We calculate timestamps using destructuring: `[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)`.
   - If the video is paused:
     - We set the small image key to `Assets.Pause` to indicate that the video is paused.
   - We add buttons to link to the video and the channel.
10. If no video is found or it's not ready to play:
    - We only update the browsing timestamp when changing from watching to browsing.
    - We set the details and state to indicate that the user is browsing the website.
    - We use the consistent browsing timestamp to show how long the user has been browsing.
11. We update the `wasWatchingVideo` state for the next update cycle.
12. Finally, we set the activity using `presence.setActivity()`.

## Handling Different Media Types

You can modify this example to handle different types of media:

### For Audio

```typescript
// Set the activity type to Listening
presenceData.type = ActivityType.Listening

// Set the details and state
// For music, put the song title in details and artist in state
presenceData.details = title
presenceData.state = artist

// Set the small image key to show the playing state
presenceData.smallImageKey = Assets.Play
presenceData.smallImageText = 'Playing'
```

### For Live Streams

```typescript
// Set the activity type to Watching for live streams
presenceData.type = ActivityType.Watching

// For live streams, only use startTimestamp
presenceData.startTimestamp = browsingTimestamp // Use the existing browsingTimestamp
delete presenceData.endTimestamp

// Set the details and state
presenceData.details = title
presenceData.state = 'Live'

// Use the Live asset for small image
presenceData.smallImageKey = Assets.Live
presenceData.smallImageText = 'Live'
```

### For TV Shows with Seasons and Episodes

```typescript
// Set the activity type to Watching for TV shows
presenceData.type = ActivityType.Watching

// Set the details and state
presenceData.details = showTitle
presenceData.state = `S${seasonNumber}:E${episodeNumber} ${episodeTitle}`

// Use the special season and episode formatting in largeImageText
// This will display a special season and episode indicator in Discord (S2E5 format)
presenceData.largeImageText = `Season ${seasonNumber}, Episode ${episodeNumber}`

// Set timestamps if available
[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
```

When implemented correctly, Discord will display a special season and episode indicator like this:

![Season and Episode Indicator Example](https://placehold.co/800x400?text=Season+and+Episode+Indicator+Example)

*Note: This image shows how Discord displays the special season and episode indicator (S1E2) when using the correct formatting pattern. The pattern must be "word digit, digit" but Discord will display it as "S1E2".*

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
