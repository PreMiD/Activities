# Activity with Settings Example

This page provides an example of a PreMiD Activity with customizable settings. Settings allow users to personalize how the activity appears in their Discord status.

## Basic Structure

An activity with settings consists of two files:
- `metadata.json`: Contains information about the activity, including the settings definitions
- `presence.ts`: Contains the code for the activity, including logic to handle the settings

### metadata.json

```json
{
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "SettingsExample",
  "description": {
    "en": "SettingsExample is a website with customizable activity settings."
  },
  "url": "settingsexample.com",
  "version": "1.0.0",
  "logo": "https://settingsexample.com/logo.png",
  "thumbnail": "https://settingsexample.com/thumbnail.png",
  "color": "#FF0000",
  "tags": ["example", "settings"],
  "category": "other",
  "apiVersion": 1,
  "settings": [
    {
      "id": "showButtons",
      "title": "Show Buttons",
      "icon": "fas fa-compress-arrows-alt",
      "value": true
    },
    {
      "id": "showTimestamp",
      "title": "Show Timestamp",
      "icon": "fas fa-clock",
      "value": true
    },
    {
      "id": "detailsFormat",
      "title": "Details Format",
      "icon": "fas fa-paragraph",
      "value": 0,
      "values": ["Page Title", "Website Name - Page Title", "Browsing: Page Title"]
    },
    {
      "id": "privacyMode",
      "title": "Privacy Mode",
      "icon": "fas fa-user-secret",
      "value": false,
      "if": {
        "detailsFormat": 0
      }
    }
  ]
}
```

### presence.ts

```typescript
const presence = new Presence({
  clientId: "your_client_id"
});

// Default settings values
let showButtons = true;
let showTimestamp = true;
let detailsFormat = 0;
let privacyMode = false;

presence.on("UpdateData", async () => {
  // Get settings
  showButtons = await presence.getSetting<boolean>("showButtons");
  showTimestamp = await presence.getSetting<boolean>("showTimestamp");
  detailsFormat = await presence.getSetting<number>("detailsFormat");
  privacyMode = await presence.getSetting<boolean>("privacyMode");
  
  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: "logo"
  };
  
  // Get page information
  const pageTitle = document.title;
  const path = document.location.pathname;
  
  // Format details based on user preference
  switch (detailsFormat) {
    case 0:
      presenceData.details = pageTitle;
      break;
    case 1:
      presenceData.details = `SettingsExample - ${pageTitle}`;
      break;
    case 2:
      presenceData.details = `Browsing: ${pageTitle}`;
      break;
    default:
      presenceData.details = pageTitle;
  }
  
  // Apply privacy mode if enabled
  if (privacyMode) {
    presenceData.details = "Browsing SettingsExample";
    presenceData.state = "Privacy Mode Enabled";
  } else {
    // Set state based on the current page
    if (path === "/") {
      presenceData.state = "Homepage";
    } else if (path.includes("/about")) {
      presenceData.state = "About page";
    } else if (path.includes("/contact")) {
      presenceData.state = "Contact page";
    } else {
      presenceData.state = "Browsing";
    }
  }
  
  // Add timestamp if enabled
  if (showTimestamp) {
    presenceData.startTimestamp = Date.now();
  }
  
  // Add buttons if enabled
  if (showButtons && !privacyMode) {
    presenceData.buttons = [
      {
        label: "Visit Page",
        url: document.URL
      },
      {
        label: "Visit Website",
        url: "https://settingsexample.com"
      }
    ];
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

### Settings in metadata.json

The `settings` array in `metadata.json` defines the settings that users can customize:

1. `showButtons`: A boolean setting that determines whether to show buttons in the activity
2. `showTimestamp`: A boolean setting that determines whether to show a timestamp in the activity
3. `detailsFormat`: A dropdown setting that allows users to choose how the details are formatted
4. `privacyMode`: A boolean setting that enables privacy mode, which hides specific information

Each setting has:
- `id`: A unique identifier for the setting
- `title`: The display name of the setting
- `icon`: An icon for the setting (using Font Awesome classes)
- `value`: The default value of the setting
- `values` (optional): An array of values for dropdown settings
- `if` (optional): Conditions for when the setting should be shown

### Handling Settings in presence.ts

In the `presence.ts` file, we:

1. Define default values for each setting
2. Retrieve the current values using `presence.getSetting()`
3. Apply the settings to the presence data:
   - Format the details based on the `detailsFormat` setting
   - Apply privacy mode if the `privacyMode` setting is enabled
   - Add a timestamp if the `showTimestamp` setting is enabled
   - Add buttons if the `showButtons` setting is enabled

## Conditional Settings

The `privacyMode` setting has an `if` condition that makes it only appear when `detailsFormat` is set to `0`. This demonstrates how you can create settings that depend on other settings.

## Dynamic Settings

You can also show or hide settings dynamically based on the current state of the activity:

```typescript
// Show the timestamp setting only when not in privacy mode
if (privacyMode) {
  presence.hideSetting("showTimestamp");
} else {
  presence.showSetting("showTimestamp");
}
```

## Multilanguage Settings

You can create settings that use translations from the localization files:

```json
{
  "id": "showButtons",
  "multiLanguage": true
}
```

With `multiLanguage: true`, the setting will use strings from the localization files instead of a fixed title.

## Testing

To test this activity with settings:

1. Make sure the PreMiD extension is installed in your browser.
2. Enable developer mode in the extension settings.
3. Add your local activity to the extension.
4. Visit the website you created the activity for.
5. Open the PreMiD extension and go to the settings for your activity.
6. Customize the settings and see how they affect the activity in your Discord status.

## Next Steps

This example shows how to create an activity with basic settings. You can enhance it by:

- Adding more types of settings (e.g., sliders, text inputs)
- Creating more complex conditional settings
- Using settings to control advanced features like slideshows or iFrame handling

Check out the other examples in this section for more advanced usage:

- [Basic Activity](/v1/examples/): Shows how to create a simple activity
- [Media Activity](/v1/examples/media): Shows how to create an activity for media websites
- [Activity with iFrames](/v1/examples/iframes): Shows how to gather information from iFrames
- [Activity with Slideshow](/v1/examples/slideshow): Shows how to create a slideshow that alternates between different presence data
