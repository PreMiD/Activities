# Best Practices

This guide provides best practices for creating PreMiD Activities. Following these practices will help you create high-quality activities that are easy to maintain and provide a good user experience.

## Code Quality

### Use TypeScript Properly

TypeScript is required for all PreMiD Activities. Make sure you're using TypeScript's features properly to get the most benefit from it:

```typescript
// Good - Using proper type annotations
const presence = new Presence({
  clientId: 'your_client_id'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
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

// Bad - Missing type annotations, not using enum for assets
const presence = new Presence({
  clientId: 'your_client_id'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  // Missing PresenceData type annotation
  const presenceData = {
    largeImageKey: 'https://example.com/logo.png',
    details: 'Browsing Example.com',
    state: 'Homepage',
    startTimestamp: browsingTimestamp
  }

  presence.setActivity(presenceData)
})
```

### Handle Errors

Always check if elements exist before trying to access their properties. This will prevent your activity from crashing if the page structure changes.

```typescript
// Good
const videoTitle = document.querySelector('.video-title')?.textContent || 'Unknown video'

// Bad
const videoTitle = document.querySelector('.video-title').textContent
```

### Use Destructuring

Use destructuring to access object properties for cleaner and more readable code.

```typescript
// Good
const { pathname, hostname, href } = document.location

// Bad
const pathname = document.location.pathname
const hostname = document.location.hostname
const href = document.location.href
```

### Use Constants

Define constants for repeated values to make your code more maintainable. Always define constants outside of the UpdateData event for better performance. Use the `enum` keyword to define constants for assets.

```typescript
// Good
const SLIDESHOW_TIMEOUT = 5000 // 5 seconds

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
}

slideshow.addSlide('slide1', {
  details: 'Browsing Example.com',
  state: 'Homepage',
  largeImageKey: ActivityAssets.Logo
}, SLIDESHOW_TIMEOUT)

// Bad
slideshow.addSlide('slide1', {
  details: 'Browsing Example.com',
  state: 'Homepage',
  largeImageKey: 'https://example.com/logo.png'
}, 5000)
```

### Comment Your Code

Add meaningful comments to explain complex logic, non-obvious decisions, or important context. Avoid commenting on self-explanatory code.

```typescript
// Good
// Process video content when available and ready
const video = document.querySelector('video')
if (video && video.readyState > 0) {
  const title = document.querySelector('.video-title')?.textContent || 'Unknown video'
  const author = document.querySelector('.video-author')?.textContent || 'Unknown author'
  const isPlaying = !video.paused

  // Set activity data for video content
  presenceData.type = ActivityType.Watching
  presenceData.details = title
  presenceData.state = `By ${author}`
}

// Bad - No comments for complex logic
const video = document.querySelector('video')
if (video && video.readyState > 0) {
  const title = document.querySelector('.video-title')?.textContent || 'Unknown video'
  const author = document.querySelector('.video-author')?.textContent || 'Unknown author'
  const isPlaying = !video.paused
  presenceData.type = ActivityType.Watching
  presenceData.details = title
  presenceData.state = `By ${author}`
}

// Also Bad - Excessive comments for obvious code
// Create a variable to store the video element
const video = document.querySelector('video')
// Check if the video exists and is ready
if (video && video.readyState > 0) {
  // Get the title of the video
  const title = document.querySelector('.video-title')?.textContent || 'Unknown video'
  // Get the author of the video
  const author = document.querySelector('.video-author')?.textContent || 'Unknown author'
  // Check if the video is playing
  const isPlaying = !video.paused
  // Set the activity type to watching
  presenceData.type = ActivityType.Watching
  // Set the details to the title
  presenceData.details = title
  // Set the state to the author
  presenceData.state = `By ${author}`
}
```

### Follow the Style Guide

Use consistent formatting and naming conventions. This makes your code easier to read and maintain.

```typescript
// Good
const presence = new Presence({
  clientId: 'your_client_id'
})

const SLIDESHOW_TIMEOUT = 5000

function getVideoInfo() {
  const video = document.querySelector('video')
  return {
    title: document.querySelector('.video-title')?.textContent || 'Unknown video',
    author: document.querySelector('.video-author')?.textContent || 'Unknown author',
    isPlaying: video ? !video.paused : false
  }
}

// Bad
const presence = new Presence({ clientId: 'your_client_id' })
const slideshow_timeout = 5000
function get_video_info() {
  const video = document.querySelector('video')
  return { title: document.querySelector('.video-title')?.textContent || 'Unknown video', author: document.querySelector('.video-author')?.textContent || 'Unknown author', isPlaying: video ? !video.paused : false }
}
```

## Performance

### Minimize DOM Queries

Cache DOM elements that you use multiple times to avoid unnecessary DOM queries.

```typescript
// Good
const video = document.querySelector('video')
const title = document.querySelector('.video-title')?.textContent || 'Unknown video'
const author = document.querySelector('.video-author')?.textContent || 'Unknown author'

if (video && video.readyState > 0) {
  presenceData.details = title
  presenceData.state = `By ${author}`

  if (!video.paused) {
    // Use video
  }
}

// Bad
if (document.querySelector('video') && document.querySelector('video').readyState > 0) {
  presenceData.details = document.querySelector('.video-title')?.textContent || 'Unknown video'
  presenceData.state = `By ${document.querySelector('.video-author')?.textContent || 'Unknown author'}`

  if (!document.querySelector('video').paused) {
    // Use video
  }
}
```

### Use Efficient Selectors

Use efficient selectors to find elements on the page. IDs are the fastest, followed by classes, then tag names. However, for elements that are typically unique on a page (like video or audio elements), using tag selectors can be appropriate.

```typescript
// Good
const videoWithId = document.getElementById('video') // Best if ID exists
const title = document.querySelector('.video-title') // Using class selector
const video = document.querySelector('video') // Good for pages with a single video

// Less preferred
const title = document.getElementsByClassName('video-title')[0] // Works but querySelector is more consistent
const videos = document.querySelectorAll('video') // Unnecessary if you only need the first video
const firstVideo = videos[0]
```

### Avoid Heavy Computations

Avoid heavy computations in the `UpdateData` event, as it is fired regularly. If you need to perform heavy computations, cache the results.

```typescript
// Good
let cachedData = null
let lastComputation = 0

presence.on('UpdateData', async () => {
  const now = Date.now()

  // Only compute data every 5 seconds
  if (!cachedData || now - lastComputation > 5000) {
    cachedData = computeHeavyData()
    lastComputation = now
  }

  // Use cachedData
})

// Bad
presence.on('UpdateData', async () => {
  const data = computeHeavyData()

  // Use data
})
```

## User Experience

### Provide Clear Information

Make sure the information displayed in your activity is clear and easy to understand.

```typescript
// Good
presenceData.type = ActivityType.Watching
presenceData.details = 'The Title of the Video' // No need for 'Watching:' prefix when type is set
presenceData.state = 'By: The Author of the Video'

// Bad
presenceData.details = 'Video'
presenceData.state = 'Author'

// Also Bad
presenceData.details = 'Watching: The Title of the Video' // Redundant with ActivityType.Watching
```

### Use Appropriate Activity Types

Use the appropriate activity type for your activity. For example, use `ActivityType.Watching` for video content and `ActivityType.Listening` for audio content.

```typescript
// Good
if (document.querySelector('video')) {
  presenceData.type = ActivityType.Watching
}
else if (document.querySelector('audio')) {
  presenceData.type = ActivityType.Listening
}

// Bad
presenceData.type = ActivityType.Playing
```

### Add Timestamps

Add timestamps to show how long the user has been doing an activity or how much time is left.

```typescript
// Good
// Create browsing timestamp outside UpdateData
let browsingTimestamp = Math.floor(Date.now() / 1000)
let wasWatchingVideo = false

presence.on('UpdateData', async () => {
  // ...

  if (isWatchingVideo) {
    // Show remaining time for media
    const video = document.querySelector('video')
    if (video && video.readyState > 0) {
      // Use destructuring assignment
      [presenceData.startTimestamp, presenceData.endTimestamp]
        = getTimestamps(video.currentTime, video.duration)
    }
    wasWatchingVideo = true
  }
  else {
    // Only update browsing timestamp when changing state
    if (wasWatchingVideo) {
      browsingTimestamp = Math.floor(Date.now() / 1000)
      wasWatchingVideo = false
    }
    presenceData.startTimestamp = browsingTimestamp
  }
})

// Bad
// Updating browsing timestamp on every UpdateData event
presence.on('UpdateData', async () => {
  presenceData.startTimestamp = Math.floor(Date.now() / 1000) // Don't do this!
})

// Bad
// Not using destructuring with getTimestamps
const timestamps = getTimestamps(video.currentTime, video.duration)
presenceData.startTimestamp = timestamps[0]
presenceData.endTimestamp = timestamps[1]
```

### Use Settings

Add settings to allow users to customize your activity. This gives users more control over what information is displayed.

```typescript
// Good
const showButtons = await presence.getSetting<boolean>('showButtons')
const showTimestamp = await presence.getSetting<boolean>('showTimestamp')

if (showButtons) {
  presenceData.buttons = [
    {
      label: 'Visit Website',
      url: document.location.href
    }
  ]
}

if (showTimestamp) {
  presenceData.startTimestamp = Date.now()
}

// Bad
// No settings, hardcoded behavior
presenceData.buttons = [
  {
    label: 'Visit Website',
    url: document.location.href
  }
]
presenceData.startTimestamp = Date.now()
```

### Add Multilanguage Support

Add multilanguage support to your activity to provide a better experience for users who don't speak English.

```typescript
// Good
const strings = await presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browse: 'general.browsing'
})

if (video) {
  if (video.paused) {
    presenceData.details = strings.pause
  }
  else {
    presenceData.details = strings.play
  }
}
else {
  presenceData.details = strings.browse
}

// Bad
if (video) {
  if (video.paused) {
    presenceData.details = 'Paused'
  }
  else {
    presenceData.details = 'Playing'
  }
}
else {
  presenceData.details = 'Browsing'
}
```

## Maintenance

### Keep Your Activity Updated

Websites change over time, so you need to keep your activity updated to ensure it continues to work correctly.

1. **Monitor website changes**: Regularly check if the website has changed and update your activity accordingly.
2. **Update dependencies**: Keep your dependencies up to date.
3. **Respond to issues**: Respond to issues reported by users and fix them promptly.

### Write Tests

Write tests for your activity to ensure it works correctly. This will help you catch errors before they affect users.

1. **Test with different page states**: Test your activity with different page states to ensure it works correctly in all scenarios.
2. **Test with different settings**: Test your activity with different settings to ensure they work correctly.
3. **Test with different browsers**: Test your activity with different browsers to ensure it works correctly in all browsers.

### Document Your Code

Document your code to make it easier for others to understand and contribute to your activity.

1. **Add a README**: Add a README file to your activity to explain what it does and how to use it.
2. **Document complex logic**: Document complex logic to make it easier to understand.
3. **Document settings**: Document settings to explain what they do and how to use them.

## Security

### Avoid Exposing Sensitive Information

Avoid exposing sensitive information in your activity, such as user IDs, email addresses, or personal information.

```typescript
// Good
presenceData.details = 'Logged in'
presenceData.state = 'Viewing profile'

// Bad
presenceData.details = 'Logged in as user123'
presenceData.state = 'Email: user@example.com'
```

## Complete Example

Here's a complete example of an activity that follows best practices:

### metadata.json

```json
{
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "Example",
  "description": {
    "de": "Example ist eine Website, die etwas Cooles macht.",
    "en": "Example is a website that does something cool.",
    "fr": "Example est un site web qui fait quelque chose de cool."
  },
  "url": "example.com",
  "version": "1.0.0",
  "logo": "https://i.imgur.com/XXXXXXX.png",
  "thumbnail": "https://i.imgur.com/YYYYYYY.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "best-practices"],
  "settings": [
    {
      "id": "showButtons",
      "multiLanguage": true,
      "value": true
    },
    {
      "id": "showTimestamp",
      "multiLanguage": true,
      "value": true
    },
    {
      "id": "showDetails",
      "multiLanguage": true,
      "value": true
    }
  ]
}
```

### presence.ts

```typescript
import { Assets, getTimestamps, ActivityType } from 'premid'

enum ActivityAssets {
  Logo = 'https://i.imgur.com/logo.png',
}

const presence = new Presence({
  clientId: 'your_client_id'
})

// Constants
const browsingTimestamp = Math.floor(Date.now() / 1000)

// Cache for heavy computations
const cachedData = null
const lastComputation = 0

// Helper function to get page information
function getPageInfo() {
  const { pathname, hostname, href } = document.location
  const title = document.title

  let pageType = 'unknown'

  if (pathname === '/') {
    pageType = 'homepage'
  }
  else if (pathname.includes('/about')) {
    pageType = 'about'
  }
  else if (pathname.includes('/contact')) {
    pageType = 'contact'
  }

  return { pathname, hostname, href, title, pageType }
}

// Helper function to get video information
function getVideoInfo() {
  const video = document.querySelector('video')

  if (!video || video.readyState === 0) {
    return null
  }

  return {
    title: document.querySelector('.video-title')?.textContent || 'Unknown video',
    author: document.querySelector('.video-author')?.textContent || 'Unknown author',
    isPlaying: !video.paused,
    currentTime: video.currentTime,
    duration: video.duration
  }
}

presence.on('UpdateData', async () => {
  // Get settings using Promise.all
  const [
    showButtons,
    showTimestamp,
    showDetails
  ] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showDetails')
  ])

  // Get translations
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing'
  })

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo
  }

  // Get page information
  const { pathname, hostname, href, title, pageType } = getPageInfo()

  // Get video information (if available)
  const videoInfo = getVideoInfo()

  // Set presence data based on page type
  if (videoInfo) {
    // Video page
    presenceData.type = ActivityType.Watching

    if (showDetails) {
      presenceData.details = videoInfo.title
      presenceData.state = `By ${videoInfo.author}`
    }

    if (videoInfo.isPlaying) {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = strings.play

      if (showTimestamp) {
        [presenceData.startTimestamp, presenceData.endTimestamp]
          = getTimestamps(videoInfo.currentTime, videoInfo.duration)
      }
    }
    else {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = strings.pause
    }
  }
  else {
    // Regular page
    if (showDetails) {
      presenceData.details = strings.browse
      presenceData.state = title
    }

    if (showTimestamp) {
      presenceData.startTimestamp = browsingTimestamp
    }
  }

  // Add buttons if enabled
  if (showButtons) {
    presenceData.buttons = [
      {
        label: 'Visit Website',
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

## Validating Your Activity

Before submitting your activity to GitHub, you should validate it to ensure it meets all requirements and follows best practices:

```bash
npx pmd build "YourActivityName" --validate
```

This command will check your activity for common issues and provide feedback on what needs to be fixed.

## Conclusion

Following these best practices will help you create high-quality activities that are easy to maintain and provide a good user experience. Remember to:

1. **Write clean, maintainable code**: Use TypeScript, handle errors, use constants, comment your code, and follow the style guide.
2. **Optimize for performance**: Minimize DOM queries, use efficient selectors, and avoid heavy computations.
3. **Enhance user experience**: Provide clear information, use appropriate activity types, add timestamps, use settings, and add multilanguage support.
4. **Use proper timestamps**: Create browsing timestamps outside UpdateData, only update them when changing states, and use destructuring with getTimestamps.
5. **Use proper image URLs**: Use Imgur links for images during development, which will be transferred to the PreMiD CDN when your PR is merged.
6. **Maintain your activity**: Keep your activity updated, write tests, and document your code.
7. **Ensure security**: Avoid exposing sensitive information and validate user input.
8. **Validate before submission**: Always validate your activity with `npx pmd build "YourActivityName" --validate` before submitting it.

By following these practices, you'll create activities that users will love and that will be easy to maintain over time.
