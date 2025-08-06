# Slideshows

Slideshows allow you to alternate between different sets of presence data at specific intervals. This is useful for displaying multiple pieces of information in rotation, such as different images, content details, or user information.

![Slideshow in Action](https://placehold.co/800x400?text=Slideshow+in+Action)

## When to Use Slideshows

Slideshows are useful when:

1. You want to display more information than can fit in a single presence
2. You want to alternate between different types of information
3. You want to show multiple images in rotation
4. You want to create a more dynamic presence

Common examples include:

- Alternating between showing the current page and user information
- Rotating through multiple images from a gallery
- Showing different statistics or metrics in rotation

## Creating a Slideshow

To create a slideshow, you need to use the `createSlideshow` method of the `Presence` class:

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

const slideshow = presence.createSlideshow()
```

## Adding Slides

Once you've created a slideshow, you can add slides to it using the `addSlide` method:

```typescript
slideshow.addSlide('slide1', {
  details: 'Browsing Example.com',
  state: 'Homepage',
  largeImageKey: ActivityAssets.Logo,
  startTimestamp: browsingTimestamp
}, 5000) // 5 seconds
```

The `addSlide` method takes three parameters:

1. `id`: A unique identifier for the slide
2. `data`: The presence data for the slide
3. `interval`: The time in milliseconds before moving to the next slide (minimum 5000ms)

## Updating Slides

You can update an existing slide using the `updateSlide` method:

```typescript
slideshow.updateSlide('slide1', {
  details: 'Updated details',
  state: 'Updated state',
  largeImageKey: ActivityAssets.Logo,
  startTimestamp: browsingTimestamp
})
```

You can also update just the interval:

```typescript
slideshow.updateSlide('slide1', undefined, 10000) // 10 seconds
```

## Deleting Slides

You can delete a slide using the `deleteSlide` method:

```typescript
slideshow.deleteSlide('slide1')
```

You can also delete all slides using the `deleteAllSlides` method:

```typescript
slideshow.deleteAllSlides()
```

## Checking if a Slide Exists

You can check if a slide exists using the `hasSlide` method:

```typescript
if (slideshow.hasSlide('slide1')) {
  // Slide exists
}
```

## Getting All Slides

You can get all slides using the `getSlides` method:

```typescript
const slides = slideshow.getSlides()

// You can then modify all slides at once
for (const slide of slides) {
  const data = slide.data
  data.buttons = [
    {
      label: 'Visit Website',
      url: document.location.href
    }
  ]
  slide.updateData(data)
}
```

## Setting the Activity with a Slideshow

To set the activity with a slideshow, you pass the slideshow to the `setActivity` method:

```typescript
presence.setActivity(slideshow)
```

## Real-World Examples

![Slideshow Example](https://placehold.co/800x400?text=Slideshow+Example+in+Discord)

### Basic Slideshow

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
  Clock = 'https://example.com/clock.png'
}

const slideshow = presence.createSlideshow()

presence.on('UpdateData', async () => {
  // Add slides with different information
  slideshow.addSlide('info1', {
    details: 'Browsing the website',
    state: document.title,
    largeImageKey: ActivityAssets.Logo,
  }, 5000) // 5 seconds

  slideshow.addSlide('info2', {
    details: 'Current time',
    state: new Date().toLocaleTimeString(),
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Clock
  }, 5000) // 5 seconds

  // Set the activity with the slideshow
  presence.setActivity(slideshow)
})
```

### Dynamic Image Slideshow

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

const slideshow = presence.createSlideshow()
const SLIDESHOW_TIMEOUT = 5000 // 5 seconds

presence.on('UpdateData', async () => {
  const presenceData = {
    details: 'Viewing gallery',
    largeImageKey: 'https://example.com/logo.png'
  }

  // Get all images on the page
  const images = document.querySelectorAll('.gallery img')

  // Clear previous slides if needed
  slideshow.deleteAllSlides()

  // Add each image as a slide
  for (const [index, image] of images.entries()) {
    slideshow.addSlide(
      `image-${index}`,
      {
        ...presenceData,
        state: `Image ${index + 1} of ${images.length}`,
        largeImageKey: image.src
      },
      SLIDESHOW_TIMEOUT
    )
  }

  // Set the activity with the slideshow
  presence.setActivity(slideshow)
})
```

### Conditional Slides

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
  User = 'https://example.com/user.png'
}

const slideshow = presence.createSlideshow()

presence.on('UpdateData', async () => {
  const presenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp
  }

  // Always add the main slide
  slideshow.addSlide('main', {
    ...presenceData,
    details: 'Browsing the website',
    state: document.title
  }, 5000)

  // Only add user info slide if user is logged in
  const username = document.querySelector('.username')?.textContent
  if (username) {
    slideshow.addSlide('user', {
      ...presenceData,
      details: `Logged in as ${username}`,
      state: 'Viewing profile',
      smallImageKey: ActivityAssets.User
    }, 5000)
  }
  else if (slideshow.hasSlide('user')) {
    // Remove the user slide if it exists and user is no longer logged in
    slideshow.deleteSlide('user')
  }

  // Set the activity with the slideshow
  presence.setActivity(slideshow)
})
```

### Slideshow with Settings

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
  Clock = 'https://example.com/clock.png'
}

const slideshow = presence.createSlideshow()

presence.on('UpdateData', async () => {
  // Get settings
  const showSlideshow = await presence.getSetting<boolean>('showSlideshow')
  const slideDuration = await presence.getSetting<number>('slideDuration') * 1000 // Convert to milliseconds

  const presenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Browsing Example.com',
    state: document.title,
    startTimestamp: browsingTimestamp
  }

  if (showSlideshow) {
    // Add slides
    slideshow.addSlide('main', presenceData, slideDuration)

    slideshow.addSlide('time', {
      ...presenceData,
      details: 'Current time',
      state: new Date().toLocaleTimeString(),
      smallImageKey: ActivityAssets.Clock
    }, slideDuration)

    // Set the activity with the slideshow
    presence.setActivity(slideshow)
  }
  else {
    // Set the activity with a single presence
    presence.setActivity(presenceData)
  }
})
```

## Best Practices

1. **Keep it simple**: Don't add too many slides or set the intervals too short, as it can be distracting for users.
2. **Use meaningful IDs**: Use descriptive IDs for your slides to make your code more maintainable.
3. **Check if slides exist**: Always check if a slide exists before updating or deleting it.
4. **Use the spread operator**: Use the spread operator (`...`) to maintain common properties across slides.
5. **Set a minimum interval**: The minimum interval between slides is 5000 milliseconds (5 seconds).
6. **Test thoroughly**: Test your slideshow with different combinations of slides to ensure it works correctly.

## Complete Example

Here's a complete example of an activity that uses a slideshow to alternate between different types of information:

### metadata.json

```json
{
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "Example",
  "description": {
    "en": "Example is a website that demonstrates the slideshow feature."
  },
  "url": "example.com",
  "version": "1.0.0",
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "slideshow"],
  "settings": [
    {
      "id": "showSlideshow",
      "title": "Show Slideshow",
      "icon": "fas fa-images",
      "value": true
    },
    {
      "id": "slideDuration",
      "title": "Slide Duration (seconds)",
      "icon": "fas fa-clock",
      "value": 5,
      "if": {
        "showSlideshow": true
      }
    }
  ]
}
```

### presence.ts

```typescript
import { Assets } from 'premid'

const presence = new Presence({
  clientId: 'your_client_id'
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://example.com/logo.png',
  Clock = 'https://example.com/clock.png'
}

// Create a slideshow
const slideshow = presence.createSlideshow()

// Define a constant for slideshow timeout
const DEFAULT_SLIDESHOW_TIMEOUT = 5000 // 5 seconds

// Track which slideshow keys we've registered to avoid duplicates
const registeredSlideshowKeys = new Set<string>()

// Helper function to register slideshow keys and avoid duplicates
function registerSlideshowKey(key: string): void {
  if (!registeredSlideshowKeys.has(key)) {
    registeredSlideshowKeys.add(key)
  }
}

presence.on('UpdateData', async () => {
  // Get settings
  const showSlideshow = await presence.getSetting<boolean>('showSlideshow')
  const slideDuration = await presence.getSetting<number>('slideDuration') * 1000 // Convert to milliseconds

  // Base presence data that will be common across slides
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp
  }

  // Get page information
  const path = document.location.pathname
  const pageTitle = document.title

  // Determine what page we're on
  if (path.includes('/gallery/')) {
    // Gallery page with images
    const images = document.querySelectorAll('.gallery img')

    // Register a unique key for this gallery page
    const galleryPage = document.querySelector('.pagination-active')?.textContent || '1'
    registerSlideshowKey(`gallery-page-${galleryPage}`)

    if (showSlideshow) {
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
            smallImageKey: Assets.Search,
            smallImageText: 'Browsing images'
          },
          slideDuration || DEFAULT_SLIDESHOW_TIMEOUT
        )
      }

      // Set the activity with the slideshow
      presence.setActivity(slideshow)
    }
    else {
      // Show a single presence for the gallery
      presenceData.details = 'Viewing gallery'
      presenceData.state = `${images.length} images`
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Browsing images'

      presence.setActivity(presenceData)
    }
  }
  else {
    // Homepage or other pages
    presenceData.details = 'Browsing Example.com'
    presenceData.state = pageTitle

    if (showSlideshow) {
      // Add slides for the homepage
      slideshow.addSlide('homepage', presenceData, slideDuration || DEFAULT_SLIDESHOW_TIMEOUT)

      slideshow.addSlide('time', {
        ...presenceData,
        details: 'Current time',
        state: new Date().toLocaleTimeString(),
        smallImageKey: ActivityAssets.Clock,
        smallImageText: 'Time information'
      }, slideDuration || DEFAULT_SLIDESHOW_TIMEOUT)

      // Set the activity with the slideshow
      presence.setActivity(slideshow)
    }
    else {
      // Set the activity with a single presence
      presence.setActivity(presenceData)
    }
  }
})
```

## Next Steps

Now that you understand how to use slideshows in your activity, you can learn more about:

- [Localization](/v1/guide/localization): Learn how to add support for multiple languages to your activity.
- [Best Practices](/v1/guide/best-practices): Learn best practices for creating activities.
