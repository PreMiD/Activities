# Activity with iFrames Example

This page provides an example of a PreMiD Activity that uses iFrames to gather information from embedded content. This is particularly useful for websites that embed media players or other interactive content in iFrames.

## Basic Structure

An activity with iFrames consists of three files:
- `metadata.json`: Contains information about the activity, including iFrame settings
- `presence.ts`: Contains the code for the main activity
- `iframe.ts`: Contains the code that runs inside the iFrames

### metadata.json

```json
{
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "iFrameExample",
  "description": {
    "en": "iFrameExample is a website that embeds videos from other platforms."
  },
  "url": "iframeexample.com",
  "version": "1.0.0",
  "logo": "https://iframeexample.com/logo.png",
  "thumbnail": "https://iframeexample.com/thumbnail.png",
  "color": "#FF0000",
  "tags": ["video", "iframe", "embed"],
  "category": "videos",
  "apiVersion": 1,
  "iframe": true,
  "iFrameRegExp": ".*\\.(youtube|vimeo)\\.com/.*"
}
```

### iframe.ts

```typescript
const iframe = new iFrame();

iframe.on("UpdateData", async () => {
  // Get the video element in the iframe
  const video = document.querySelector("video");
  
  if (video && video.readyState > 0) {
    // Get video information
    const title = document.querySelector(".video-title")?.textContent;
    const author = document.querySelector(".video-author")?.textContent;
    const currentTime = video.currentTime;
    const duration = video.duration;
    const paused = video.paused;
    
    // Get the iframe URL
    const iframeUrl = await iframe.getUrl();
    
    // Send data to the main presence
    iframe.send({
      video: {
        title,
        author,
        currentTime,
        duration,
        paused,
        iframeUrl
      }
    });
  }
});
```

### presence.ts

```typescript
import { getTimestamps } from 'premid';

const presence = new Presence({
  clientId: "your_client_id"
});

// Store iframe data
let iframeData: {
  video?: {
    title?: string;
    author?: string;
    currentTime?: number;
    duration?: number;
    paused?: boolean;
    iframeUrl?: string;
  };
} = {};

// Listen for iframe data
presence.on("iFrameData", (data) => {
  iframeData = data;
});

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "logo"
  };
  
  // Check if we have video data from the iframe
  if (iframeData.video) {
    const { title, author, currentTime, duration, paused, iframeUrl } = iframeData.video;
    
    // Set the activity type to Watching
    presenceData.type = ActivityType.Watching;
    
    // Set the details and state
    presenceData.details = title || "Watching a video";
    presenceData.state = author ? `By ${author}` : "Unknown author";
    
    // Set the large image text
    presenceData.largeImageText = "iFrameExample";
    
    if (paused) {
      // Set the small image key and text for paused state
      presenceData.smallImageKey = "pause";
      presenceData.smallImageText = "Paused";
    } else {
      // Set the small image key and text for playing state
      presenceData.smallImageKey = "play";
      presenceData.smallImageText = "Playing";
      
      // Calculate timestamps if we have currentTime and duration
      if (currentTime && duration) {
        const timestamps = getTimestamps(currentTime, duration);
        presenceData.startTimestamp = timestamps[0];
        presenceData.endTimestamp = timestamps[1];
      }
    }
    
    // Add buttons
    presenceData.buttons = [
      {
        label: "Watch Video",
        url: document.URL
      }
    ];
    
    // Add a second button with the iframe URL if available
    if (iframeUrl) {
      presenceData.buttons.push({
        label: "View Original",
        url: iframeUrl
      });
    }
  } else {
    // User is browsing the website
    presenceData.details = "Browsing";
    presenceData.state = "Looking for videos";
    presenceData.startTimestamp = Date.now();
  }
  
  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData);
  } else {
    presence.clearActivity();
  }
});
```

## How It Works

### Setting Up iFrames in metadata.json

In the `metadata.json` file, we:

1. Set `iframe: true` to enable iFrame support
2. Set `iFrameRegExp` to a regular expression that matches the iFrames we want to inject into (in this case, YouTube and Vimeo embeds)

### Gathering Data in iframe.ts

In the `iframe.ts` file, we:

1. Create a new `iFrame` instance
2. Listen for the `UpdateData` event
3. Get the video element and its information
4. Get the iframe URL using `iframe.getUrl()`
5. Send the data to the main presence using `iframe.send()`

### Using iFrame Data in presence.ts

In the `presence.ts` file, we:

1. Import the `getTimestamps` utility function
2. Create a new `Presence` instance
3. Define a variable to store the iframe data
4. Listen for the `iFrameData` event to receive data from the iframe
5. In the `UpdateData` event handler:
   - Check if we have video data from the iframe
   - If we do, use it to set the presence data
   - If not, show a generic browsing message
6. Set the activity using `presence.setActivity()`

## Handling Multiple iFrames

If your website has multiple iFrames, you can identify them by their URL:

```typescript
// In iframe.ts
const iframeUrl = await iframe.getUrl();

if (iframeUrl.includes("youtube.com")) {
  // Handle YouTube iframe
} else if (iframeUrl.includes("vimeo.com")) {
  // Handle Vimeo iframe
}
```

## Testing

To test this activity with iFrames:

1. Make sure the PreMiD extension is installed in your browser.
2. Enable developer mode in the extension settings.
3. Add your local activity to the extension.
4. Visit a website that embeds videos in iFrames.
5. Check your Discord status to see if it's showing the activity with information from the iFrames.

## Troubleshooting

If you're not receiving data from iFrames, check:

1. That `iframe: true` is set in your `metadata.json`
2. That your `iFrameRegExp` pattern matches the iFrames you want to inject into
3. That the iFrames are from the same origin or have appropriate CORS headers
4. That the selectors in your `iframe.ts` file match the elements in the iFrame

## Next Steps

This example shows how to create an activity that uses iFrames to gather information from embedded content. You can enhance it by:

- Supporting more types of embedded content
- Adding settings to customize what information is displayed
- Using the Slideshow class to alternate between different iFrame data
- Implementing more complex logic to handle different types of iFrames

Check out the other examples in this section for more advanced usage:

- [Basic Activity](/v1/examples/): Shows how to create a simple activity
- [Media Activity](/v1/examples/media): Shows how to create an activity for media websites
- [Activity with Settings](/v1/examples/settings): Shows how to add customizable settings to your activity
- [Activity with Slideshow](/v1/examples/slideshow): Shows how to create a slideshow that alternates between different presence data
