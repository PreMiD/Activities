# Utility Functions

PreMiD provides several utility functions to help with common tasks when developing activities. These functions are available as standalone imports from the `premid` package.

## getTimestamps

```typescript
import { getTimestamps } from 'premid';

function getTimestamps(elementTime: number, elementDuration: number): [number, number]
```

Converts time and duration integers into snowflake timestamps.

### Parameters

- `elementTime`: Current element time in seconds
- `elementDuration`: Element duration in seconds

### Returns

- An array with two timestamps: `[startTimestamp, endTimestamp]`

### Example

```typescript
import { getTimestamps } from 'premid';

const video = document.querySelector('video');
const timestamps = getTimestamps(video.currentTime, video.duration);

const presenceData: PresenceData = {
  details: "Watching a video",
  state: "Video Title",
  startTimestamp: timestamps[0],
  endTimestamp: timestamps[1]
};
```

## getTimestampsFromMedia

```typescript
import { getTimestampsFromMedia } from 'premid';

function getTimestampsFromMedia(media: HTMLMediaElement): [number, number]
```

Similar to `getTimestamps` but takes in a media element and returns snowflake timestamps.

### Parameters

- `media`: Media object (e.g., `<video>` or `<audio>` element)

### Returns

- An array with two timestamps: `[startTimestamp, endTimestamp]`

### Example

```typescript
import { getTimestampsFromMedia } from 'premid';

const video = document.querySelector('video');
const timestamps = getTimestampsFromMedia(video);

const presenceData: PresenceData = {
  details: "Watching a video",
  state: "Video Title",
  startTimestamp: timestamps[0],
  endTimestamp: timestamps[1]
};
```

## timestampFromFormat

```typescript
import { timestampFromFormat } from 'premid';

function timestampFromFormat(format: string): number
```

Converts a string with format `HH:MM:SS` or `MM:SS` or `SS` into an integer (Does not return snowflake timestamp).

### Parameters

- `format`: The formatted string

### Returns

- The time in seconds

### Example

```typescript
import { timestampFromFormat } from 'premid';

const timeString = "01:30:45"; // 1 hour, 30 minutes, 45 seconds
const timeInSeconds = timestampFromFormat(timeString); // 5445
```

## Using Utility Functions in Activities

These utility functions are particularly useful for media-related activities, where you need to calculate timestamps for videos or audio.

### Example: Video Activity

```typescript
import { getTimestampsFromMedia } from 'premid';

const presence = new Presence({
  clientId: "123456789012345678"
});

presence.on("UpdateData", async () => {
  const video = document.querySelector('video');
  const presenceData: PresenceData = {
    largeImageKey: "logo"
  };

  if (video && video.readyState > 0) {
    const title = document.querySelector('.video-title')?.textContent;
    
    presenceData.details = "Watching a video";
    presenceData.state = title || "Unknown video";
    
    if (video.paused) {
      presenceData.smallImageKey = "pause";
      presenceData.smallImageText = "Paused";
    } else {
      presenceData.smallImageKey = "play";
      presenceData.smallImageText = "Playing";
      
      const timestamps = getTimestampsFromMedia(video);
      presenceData.startTimestamp = timestamps[0];
      presenceData.endTimestamp = timestamps[1];
    }
  } else {
    presenceData.details = "Browsing";
    presenceData.startTimestamp = Date.now();
  }

  presence.setActivity(presenceData);
});
```

### Example: Custom Time Format

```typescript
import { timestampFromFormat } from 'premid';

const presence = new Presence({
  clientId: "123456789012345678"
});

presence.on("UpdateData", async () => {
  const currentTimeElement = document.querySelector('.current-time');
  const totalTimeElement = document.querySelector('.total-time');
  
  const presenceData: PresenceData = {
    largeImageKey: "logo",
    details: "Listening to music",
    state: document.querySelector('.song-title')?.textContent
  };

  if (currentTimeElement && totalTimeElement) {
    const currentTime = timestampFromFormat(currentTimeElement.textContent);
    const totalTime = timestampFromFormat(totalTimeElement.textContent);
    
    const timestamps = getTimestamps(currentTime, totalTime);
    presenceData.startTimestamp = timestamps[0];
    presenceData.endTimestamp = timestamps[1];
  } else {
    presenceData.startTimestamp = Date.now();
  }

  presence.setActivity(presenceData);
});
```

## Notes

- These utility functions are available as standalone imports from the `premid` package, which is more efficient than using the deprecated methods on the `Presence` class.
- The `getTimestamps` and `getTimestampsFromMedia` functions return timestamps that can be used directly with the `startTimestamp` and `endTimestamp` properties of the `PresenceData` interface.
- The `timestampFromFormat` function is useful for parsing time strings in various formats, but it does not return a timestamp that can be used directly with `PresenceData`. You need to use `getTimestamps` to convert the seconds to a proper timestamp.
