# Activity with Slideshow Example

This page provides an example of a PreMiD Activity that uses the Slideshow class to alternate between different sets of presence data at specific intervals. This is useful for displaying multiple pieces of information in rotation.

## Basic Structure

An activity with a slideshow consists of two files:

- `metadata.json`: Contains information about the activity
- `presence.ts`: Contains the code for the activity, including the slideshow logic

### metadata.json

```json
{
  "apiVersion": 1,
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "SlideshowExample",
  "description": {
    "en": "SlideshowExample is a website that demonstrates the slideshow feature."
  },
  "url": "slideshowexample.com",
  "version": "1.0.0",
  "logo": "https://slideshowexample.com/logo.png",
  "thumbnail": "https://slideshowexample.com/thumbnail.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "slideshow"]
}
```

### presence.ts

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

// Create a slideshow
const slideshow = presence.createSlideshow()

// Define a constant for slideshow timeout
const SLIDESHOW_TIMEOUT = 5000 // 5 seconds

// Track which slideshow keys we've registered to avoid duplicates
const registeredSlideshowKeys = new Set<string>()

// Helper function to register slideshow keys and avoid duplicates
function registerSlideshowKey(key: string): void {
  if (!registeredSlideshowKeys.has(key)) {
    registeredSlideshowKeys.add(key)
  }
}

presence.on('UpdateData', async () => {
  // Base presence data that will be common across slides
  const presenceData: PresenceData = {
    largeImageKey: 'logo',
    startTimestamp: Date.now()
  }

  // Get page information
  const pageTitle = document.title
  const path = document.location.pathname

  // Determine what page we're on
  if (path.includes('/gallery/')) {
    // Gallery page with images
    const images = document.querySelectorAll('.gallery img')

    // Register a unique key for this gallery page
    const galleryPage = document.querySelector('.pagination-active')?.textContent || '1'
    registerSlideshowKey(`gallery-page-${galleryPage}`)

    // Clear previous slides if we have a new set of images
    slideshow.deleteAllSlides()

    // Add each image as a slide
    for (const [index, image] of images.entries()) {
      const imageTitle = image.getAttribute('alt') || `Image ${index + 1}`

      slideshow.addSlide(
        `image-${index}`,
        {
          ...presenceData,
          details: 'Viewing gallery',
          state: `${imageTitle} (${index + 1}/${images.length})`,
          largeImageKey: image.src,
          smallImageKey: 'search',
          smallImageText: 'Browsing images'
        },
        SLIDESHOW_TIMEOUT
      )
    }
  }
  else if (path.includes('/profile/')) {
    // Profile page
    presenceData.details = 'Viewing profile'
    presenceData.state = document.querySelector('.username')?.textContent || 'Unknown user'

    // Add user stats slide
    slideshow.addSlide(
      'profile-main',
      {
        ...presenceData,
        smallImageKey: 'user',
        smallImageText: 'User profile'
      },
      SLIDESHOW_TIMEOUT
    )

    // Add user level slide
    const userLevel = document.querySelector('.user-level')?.textContent || 'Unknown level'
    slideshow.addSlide(
      'profile-level',
      {
        ...presenceData,
        details: `Level: ${userLevel}`,
        state: `User: ${document.querySelector('.username')?.textContent || 'Unknown user'}`,
        smallImageKey: 'star',
        smallImageText: 'User level'
      },
      SLIDESHOW_TIMEOUT
    )

    // Add achievements if available
    const achievements = document.querySelectorAll('.achievement')
    if (achievements.length > 0) {
      slideshow.addSlide(
        'profile-achievements',
        {
          ...presenceData,
          details: 'Achievements',
          state: `${achievements.length} unlocked`,
          smallImageKey: 'trophy',
          smallImageText: 'User achievements'
        },
        SLIDESHOW_TIMEOUT
      )
    }
  }
  else {
    // Homepage or other pages
    presenceData.details = 'Browsing SlideshowExample'
    presenceData.state = pageTitle

    // Just use a single slide for the homepage
    slideshow.addSlide('homepage', presenceData, SLIDESHOW_TIMEOUT)

    // Remove any other slides that might exist from previous pages
    for (const slide of slideshow.getSlides()) {
      if (slide.id !== 'homepage') {
        slideshow.deleteSlide(slide.id)
      }
    }
  }

  // Add buttons to all slides if needed
  const showButtons = await presence.getSetting<boolean>('showButtons')
  if (showButtons) {
    for (const slide of slideshow.getSlides()) {
      const data = slide.data
      data.buttons = [
        {
          label: 'Visit Website',
          url: document.URL
        }
      ]
      slide.updateData(data)
    }
  }

  // Set the activity with the slideshow
  presence.setActivity(slideshow)
})
```

## How It Works

### Creating a Slideshow

In the `presence.ts` file, we:

1. Create a new `Presence` instance
2. Create a slideshow using `presence.createSlideshow()`
3. Define a constant for the slideshow timeout (5000ms)
4. Create a helper function to track registered slideshow keys

### Managing Slides Based on Page Context

The example demonstrates three different approaches to managing slides based on the current page:

1. **Gallery Page**: Creates a dynamic set of slides for each image

   - Clears all previous slides with `slideshow.deleteAllSlides()`
   - Creates a new slide for each image with unique IDs
   - Uses the spread operator (`...presenceData`) to maintain common properties

2. **Profile Page**: Creates multiple slides showing different aspects of the profile

   - One slide for basic profile info
   - One slide for user level
   - One conditional slide for achievements (only if they exist)

3. **Homepage**: Uses a single slide
   - Adds a simple slide for the homepage
   - Removes any other slides that might exist from previous pages

### Tracking Slideshow Keys

The `registerSlideshowKey` function and `registeredSlideshowKeys` Set are used to track which slideshow configurations we've already set up. This is useful when:

- Moving between pages with similar content
- Avoiding duplicate slide creation
- Managing slideshow state across page navigation

### Modifying All Slides at Once

The example shows how to modify all slides at once based on user settings:

```typescript
const showButtons = await presence.getSetting<boolean>('showButtons')
if (showButtons) {
  for (const slide of slideshow.getSlides()) {
    const data = slide.data
    data.buttons = [
      {
        label: 'Visit Website',
        url: document.URL
      }
    ]
    slide.updateData(data)
  }
}
```

This pattern is useful for applying common modifications to all slides based on user preferences.

## Testing

To test this activity with a slideshow:

1. Make sure the PreMiD extension is installed in your browser.
2. Enable developer mode in the extension settings.
3. Add your local activity to the extension.
4. Visit the website you created the activity for.
5. Check your Discord status to see if it's showing the activity and cycling through the slides.

## Notes

- The minimum interval between slides is defined by the `MIN_SLIDE_TIME` constant, which is 5000 milliseconds (5 seconds).
- Slideshows are useful for displaying different information in rotation, but be careful not to add too many slides or set the intervals too short, as it can be distracting for users.
- Each slide can have completely different presence data, including different images, timestamps, and buttons.

## Next Steps

This example shows how to create an activity with a basic slideshow. You can enhance it by:

- Adding more types of slides based on different page states
- Combining the slideshow with settings to allow users to customize what slides are shown
- Using iFrame data in slides to show information from embedded content
- Creating more complex slide logic based on user interactions

Check out the other examples in this section for more advanced usage:

- [Basic Activity](/v1/examples/): Shows how to create a simple activity
- [Media Activity](/v1/examples/media): Shows how to create an activity for media websites
- [Activity with Settings](/v1/examples/settings): Shows how to add customizable settings to your activity
- [Activity with iFrames](/v1/examples/iframes): Shows how to gather information from iFrames
