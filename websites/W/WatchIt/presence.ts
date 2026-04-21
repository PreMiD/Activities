import { Assets } from 'premid'

// Initialize Discord Rich Presence client with WatchIt application ID
const presence = new Presence({
  clientId: '1416223846909870100',
})
// Capture the initial time when the user starts browsing the website
const browsingTimestamp = Math.floor(Date.now() / 1000)

// Define asset URLs, such as the WatchIt logo, used in the Rich Presence
enum ActivityAssets {
  Logo = 'https://i.ibb.co/8LF7HY6g/Watchit-1.jpg',
}

// Helper function to convert time strings (e.g., "1:20:30" or "45:00") into total seconds
function parseTime(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+:)?\d+:\d+/);
  if (!match) return 0;
  const parts = match[0].split(':').map(Number);
  if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  return 0;
}

// Listen for the 'UpdateData' event to periodically update the presence status
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  // Attempt to locate DOM elements containing media information
  const titleElement = document.querySelector('.content-title');
  const descriptionElement = document.querySelector('.content-description');
  const videoElement = document.querySelector('video');
  const currentTimeElement = document.querySelector('.vjs-current-time-display');

  // Extract text content from the located elements and determine playback state
  let title = titleElement ? titleElement.textContent?.trim() : '';
  const description = descriptionElement ? descriptionElement.textContent?.trim() : '';
  const isPlaying = window.location.hash.includes('/play') || !!videoElement;
  const isPaused = videoElement ? videoElement.paused : false;

  // Fallback: If playing but no title element found, try extracting from the document's title
  if (isPlaying && !title) {
    title = document.title.replace('WatchiT', '').replace('-', '').trim() || 'Video';
  }

  // If we have a title or know media is playing, populate detailed presence data
  if (title || isPlaying) {
    presenceData.details = title || 'Watching a Video';
    
    if (description) {
      presenceData.state = description;
    }

    // Update small image icon based on playback state (Paused/Playing)
    if (isPaused) {
      presenceData.smallImageKey = Assets.Pause;
      presenceData.smallImageText = 'Paused';
    } else {
      presenceData.smallImageKey = Assets.Play;
      presenceData.smallImageText = 'Playing';
    }

    // Determine the current playback time in seconds
    let currentSeconds = currentTimeElement ? parseTime(currentTimeElement.textContent || '') : 0;
    
    if (videoElement && !isNaN(videoElement.currentTime)) {
        currentSeconds = videoElement.currentTime;
    }

    // Calculate start timestamp for the Discord presence timer to show elapsed time
    if (currentSeconds > 0 && !isPaused) {
      const nowEpoch = Math.floor(Date.now() / 1000);
      presenceData.startTimestamp = nowEpoch - Math.floor(currentSeconds);
    } else if (!isPaused) {
      presenceData.startTimestamp = browsingTimestamp;
    }

  } else {
    // Fallback for when the user is just browsing the site and not playing anything
    presenceData.details = 'Browsing WatchIt';
    presenceData.startTimestamp = browsingTimestamp;
  }

  presence.setActivity(presenceData)
})
