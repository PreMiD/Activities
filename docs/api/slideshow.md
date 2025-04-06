# Slideshow Class

The `Slideshow` class allows you to create slideshows that alternate between different sets of presence data at specific intervals. This is useful for displaying different information in rotation, such as multiple images, different content details, or various user information.

## Creating a Slideshow

You can create a slideshow using the `createSlideshow` method of the `Presence` class:

```typescript
const slideshow = presence.createSlideshow()
```

## Methods

### addSlide

<!-- eslint-skip -->
```typescript
addSlide(id: string, data: PresenceData, interval: number): SlideshowSlide;
```

Adds a slide to the queue. If a slide already exists with the given ID, it will be updated with the new values.

#### Parameters

- `id`: The slide ID (a unique identifier for the slide)
- `data`: The slide presence data (what will be displayed for this slide)
- `interval`: Interval until the next slide (in milliseconds, minimum 5000ms)

#### Returns

- A `SlideshowSlide` instance

#### Example

```typescript
slideshow.addSlide('homepage', {
  details: 'Browsing the homepage',
  state: 'example.com',
  largeImageKey: 'logo'
}, 5000) // 5 seconds
```

### deleteSlide

<!-- eslint-skip -->
```typescript
deleteSlide(id: string): void;
```

Deletes a slide from the queue.

#### Parameters

- `id`: The slide ID

#### Example

```typescript
slideshow.deleteSlide('homepage')
```

### deleteAllSlides

<!-- eslint-skip -->
```typescript
deleteAllSlides(): void;
```

Clears the queue of all slides.

#### Example

```typescript
slideshow.deleteAllSlides()
```

### updateSlide

<!-- eslint-skip -->
```typescript
updateSlide(id: string, data?: PresenceData, interval?: number): SlideshowSlide;
```

Updates a slide already in the queue. Passing `null` or `undefined` will keep the old value.

#### Parameters

- `id`: The slide ID
- `data` (optional): The slide presence data
- `interval` (optional): Interval until the next slide (in milliseconds)

#### Returns

- A `SlideshowSlide` instance

#### Example

```typescript
slideshow.updateSlide('homepage', {
  details: 'Browsing the updated homepage',
  state: 'example.com',
  largeImageKey: 'logo'
})
```

### hasSlide

<!-- eslint-skip -->
```typescript
hasSlide(id: string): boolean;
```

Returns whether a slide exists in the queue.

#### Parameters

- `id`: The slide ID

#### Returns

- `true` if the slide exists, `false` otherwise

#### Example

```typescript
if (slideshow.hasSlide('homepage')) {
  // Slide exists
}
```

### getSlides

<!-- eslint-skip -->
```typescript
getSlides(): SlideshowSlide[];
```

Returns all slides in the slideshow.

#### Returns

- An array of `SlideshowSlide` instances

#### Example

```typescript
const slides = slideshow.getSlides()

// You can then modify all slides at once
for (const slide of slides) {
  const data = slide.data
  data.buttons = [
    {
      label: 'Visit Website',
      url: document.URL
    }
  ]
  slide.updateData(data)
}
```

## SlideshowSlide Class

The `SlideshowSlide` class represents a single slide in a slideshow.

### Properties

| Property   | Type           | Description                                     |
| ---------- | -------------- | ----------------------------------------------- |
| `id`       | `string`       | The slide ID                                    |
| `data`     | `PresenceData` | The slide presence data                         |
| `interval` | `number`       | Interval until the next slide (in milliseconds) |

### Methods

#### updateData

<!-- eslint-skip -->
```typescript
updateData(data?: PresenceData): void;
```

Updates the slide presence data. Passing `null` or `undefined` will keep the original value.

##### Parameters

- `data` (optional): The slide presence data

##### Example

```typescript
slide.updateData({
  details: 'Updated details',
  state: 'Updated state'
})
```

#### updateInterval

<!-- eslint-skip -->
```typescript
updateInterval(interval?: number): void;
```

Updates the slide interval. Passing `null` or `undefined` will keep the original value.

##### Parameters

- `interval` (optional): The slide interval (in milliseconds)

##### Example

```typescript
slide.updateInterval(10000) // 10 seconds
```

## Real-World Examples

### Basic Slideshow

```typescript
const presence = new Presence({
  clientId: '123456789012345678'
})

const slideshow = presence.createSlideshow()

presence.on('UpdateData', async () => {
  // Add slides with different information
  slideshow.addSlide('info1', {
    details: 'Browsing the website',
    state: document.title,
    largeImageKey: 'logo'
  }, 5000) // 5 seconds

  slideshow.addSlide('info2', {
    details: 'Current time',
    state: new Date().toLocaleTimeString(),
    largeImageKey: 'logo',
    smallImageKey: 'clock'
  }, 5000) // 5 seconds

  // Set the activity with the slideshow
  presence.setActivity(slideshow)
})
```

### Dynamic Image Slideshow

```typescript
const presence = new Presence({
  clientId: '123456789012345678'
})

const slideshow = presence.createSlideshow()
const SLIDESHOW_TIMEOUT = 5000 // 5 seconds

presence.on('UpdateData', async () => {
  const presenceData = {
    details: 'Viewing gallery',
    largeImageKey: 'logo'
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
  clientId: '123456789012345678'
})

const slideshow = presence.createSlideshow()

presence.on('UpdateData', async () => {
  const presenceData = {
    largeImageKey: 'logo',
    startTimestamp: Date.now()
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
      smallImageKey: 'user'
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

## Notes

- The minimum interval between slides is defined by the `MIN_SLIDE_TIME` constant, which is 5000 milliseconds (5 seconds).
- Slideshows are useful for displaying different information in rotation, but be careful not to add too many slides or set the intervals too short, as it can be distracting for users.
- When you set the activity with a slideshow using `presence.setActivity(slideshow)`, the presence will automatically cycle through the slides at the specified intervals.
- Slides can be dynamically added, updated, or removed based on the current state of the page.
- You can use the same base presence data for all slides and only change specific properties for each slide.
