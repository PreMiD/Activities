# Basic Activity Example

This page provides a basic example of a PreMiD Activity. This example shows how to create a simple activity that displays what the user is doing on a website.

## Basic Structure

A basic activity consists of two files:

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
  "service": "Example",
  "description": {
    "en": "Example is a website that does something cool."
  },
  "url": "example.com",
  "version": "1.0.0",
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "tag"]
}
```

### presence.ts

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'logo'
  }

  // Get the current URL path
  const path = document.location.pathname

  // Set the details based on the current page
  if (path === '/') {
    presenceData.details = 'Browsing the homepage'
    presenceData.state = 'Home'
  }
  else if (path.includes('/about')) {
    presenceData.details = 'Reading about us'
    presenceData.state = 'About page'
  }
  else if (path.includes('/contact')) {
    presenceData.details = 'Contacting us'
    presenceData.state = 'Contact page'
  }
  else {
    presenceData.details = 'Browsing'
    presenceData.state = 'Unknown page'
  }

  // Add a timestamp to show how long the user has been on the page
  presenceData.startTimestamp = Date.now()

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

1. We create a new `Presence` instance with a client ID.
2. We listen for the `UpdateData` event, which is fired regularly by the PreMiD extension.
3. We create a `PresenceData` object with a `largeImageKey` property, which is the name of the logo file.
4. We get the current URL path using `document.location.pathname`.
5. Based on the path, we set the `details` and `state` properties of the `PresenceData` object.
6. We add a `startTimestamp` to show how long the user has been on the page.
7. Finally, we set the activity using `presence.setActivity()`.

## Testing

To test this activity:

1. Make sure the PreMiD extension is installed in your browser.
2. Enable developer mode in the extension settings.
3. Add your local activity to the extension.
4. Visit the website you created the activity for.
5. Check your Discord status to see if it's showing the activity.

## Next Steps

This is a very basic example. You can enhance it by:

- Adding buttons to link to the current page
- Using the `smallImageKey` and `smallImageText` properties to show additional information
- Adding settings to allow users to customize the activity
- Using the `getPageVariable` method to get information from the page

Check out the other examples in this section for more advanced usage:

- [Media Activity](/v1/examples/media): Shows how to create an activity for media websites
- [Activity with Settings](/v1/examples/settings): Shows how to add customizable settings to your activity
- [Activity with iFrames](/v1/examples/iframes): Shows how to gather information from iFrames
- [Activity with Slideshow](/v1/examples/slideshow): Shows how to create a slideshow that alternates between different presence data
