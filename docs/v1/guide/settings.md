# Settings

Settings allow users to customize how your activity appears in their Discord status. This guide will show you how to add settings to your activity and how to use them in your code.

## Adding Settings to metadata.json

Settings are defined in the `metadata.json` file using the `settings` array. Each setting is an object with properties that define how the setting appears and behaves.

![Settings in Extension UI](https://placehold.co/800x400?text=Settings+in+Extension+UI)

Here's an example of a `metadata.json` file with settings:

```json
{
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
  "tags": ["example", "tag"],
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
      "id": "displayFormat",
      "title": "Display Format",
      "icon": "fas fa-paragraph",
      "value": 0,
      "values": ["Title", "Title - Artist", "Artist - Title"]
    }
  ]
}
```

## Types of Settings

### Boolean Settings

Boolean settings are simple on/off toggles. They are defined with a `value` property set to `true` or `false`.

![Boolean Settings Example](https://placehold.co/800x400?text=Boolean+Settings+Example)

```json
{
  "id": "showButtons",
  "title": "Show Buttons",
  "icon": "fas fa-compress-arrows-alt",
  "value": true
}
```

### Dropdown Settings

Dropdown settings allow users to select from a list of options. They are defined with a `value` property set to the index of the default option and a `values` array containing the options.

![Dropdown Settings Example](https://placehold.co/800x400?text=Dropdown+Settings+Example)

```json
{
  "id": "displayFormat",
  "title": "Display Format",
  "icon": "fas fa-paragraph",
  "value": 0,
  "values": ["Title", "Title - Artist", "Artist - Title"]
}
```

### String Settings

String settings allow users to enter custom text. They are defined with a `value` property set to the default text and an optional `placeholder` property.

![String Settings Example](https://placehold.co/800x400?text=String+Settings+Example)

```json
{
  "id": "customText",
  "title": "Custom Text",
  "icon": "fas fa-text-width",
  "value": "Hello, world!",
  "placeholder": "Enter custom text..."
}
```

## Conditional Settings

You can make settings appear only when certain conditions are met using the `if` property. The `if` property is an object where the keys are the IDs of other settings and the values are the required values for those settings.

![Conditional Settings Example](https://placehold.co/800x400?text=Conditional+Settings+Example)

```json
{
  "id": "buttonText",
  "title": "Button Text",
  "icon": "fas fa-font",
  "value": "Visit Website",
  "if": {
    "showButtons": true
  }
}
```

In this example, the "Button Text" setting will only appear if the "Show Buttons" setting is set to `true`.

## Language Setting

The language setting is a special case that allows users to select which language to display in the activity. This is a unique setting that can only be used once in your activity and must have the ID `lang`.

![Language Setting Example](https://placehold.co/800x400?text=Language+Setting+Example)

```json
{
  "id": "lang",
  "multiLanguage": true
}
```

This special setting tells PreMiD that the activity supports multiple languages. When this setting is present, PreMiD will automatically add a language selector to the activity's settings page, allowing users to choose which language they want to see in the activity.

You cannot use `multiLanguage: true` with any other setting ID besides `lang`.

## Using Settings in Your Code

To use settings in your code, you need to get their values using the `getSetting` method of the `Presence` class.

![Settings in Activity Code](https://placehold.co/800x400?text=Settings+in+Activity+Code)

```typescript
presence.on('UpdateData', async () => {
  // Get settings
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')
  const displayFormat = await presence.getSetting<number>('displayFormat')

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png',
    details: 'Browsing Example.com'
  }

  // Add timestamp if enabled
  if (showTimestamp) {
    presenceData.startTimestamp = Date.now()
  }

  // Add buttons if enabled
  if (showButtons) {
    presenceData.buttons = [
      {
        label: 'Visit Website',
        url: 'https://example.com'
      },
      {
        label: 'View Page',
        url: document.URL
      }
    ]
  }

  // Format details based on display format
  const title = document.querySelector('.title')?.textContent || 'Unknown'
  const artist = document.querySelector('.artist')?.textContent || 'Unknown'

  switch (displayFormat) {
    case 0:
      presenceData.details = title
      break
    case 1:
      presenceData.details = `${title} - ${artist}`
      break
    case 2:
      presenceData.details = `${artist} - ${title}`
      break
  }

  // Set the activity
  presence.setActivity(presenceData)
})
```

## Dynamically Showing and Hiding Settings

You can dynamically show and hide settings based on the current state of the page using the `showSetting` and `hideSetting` methods.

![Dynamic Settings Example](https://placehold.co/800x400?text=Dynamic+Settings+Example)

```typescript
// Show the timestamp setting
presence.showSetting('showTimestamp')

// Hide the timestamp setting
presence.hideSetting('showTimestamp')

// Show multiple settings
presence.showSetting(['showButtons', 'buttonText'])

// Hide multiple settings
presence.hideSetting(['showButtons', 'buttonText'])
```

## Best Practices

1. **Keep it simple**: Only add settings that are useful for users. Too many settings can be overwhelming.
2. **Use clear titles**: Make sure the titles of your settings are clear and descriptive.
3. **Provide sensible defaults**: Set default values that make sense for most users.
4. **Group related settings**: Use conditional settings to group related settings together.
5. **Test thoroughly**: Test your settings with different combinations of values to ensure they work correctly.

## Complete Example

Here's a complete example of a `metadata.json` file with settings and a `presence.ts` file that uses those settings:

### metadata.json

```json
{
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
  "tags": ["example", "tag"],
  "settings": [
    {
      "id": "showButtons",
      "title": "Show Buttons",
      "icon": "fas fa-compress-arrows-alt",
      "value": true
    },
    {
      "id": "buttonText",
      "title": "Button Text",
      "icon": "fas fa-font",
      "value": "Visit Website",
      "if": {
        "showButtons": true
      }
    },
    {
      "id": "showTimestamp",
      "title": "Show Timestamp",
      "icon": "fas fa-clock",
      "value": true
    },
    {
      "id": "displayFormat",
      "title": "Display Format",
      "icon": "fas fa-paragraph",
      "value": 0,
      "values": ["Title", "Title - Artist", "Artist - Title"]
    }
  ]
}
```

### presence.ts

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

presence.on('UpdateData', async () => {
  // Get settings
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const buttonText = await presence.getSetting<string>('buttonText')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')
  const displayFormat = await presence.getSetting<number>('displayFormat')

  // Get page information
  const title = document.querySelector('.title')?.textContent || 'Unknown'
  const artist = document.querySelector('.artist')?.textContent || 'Unknown'

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png'
  }

  // Format details based on display format
  switch (displayFormat) {
    case 0:
      presenceData.details = title
      break
    case 1:
      presenceData.details = `${title} - ${artist}`
      break
    case 2:
      presenceData.details = `${artist} - ${title}`
      break
  }

  // Add timestamp if enabled
  if (showTimestamp) {
    presenceData.startTimestamp = Date.now()
  }

  // Add buttons if enabled
  if (showButtons) {
    presenceData.buttons = [
      {
        label: buttonText,
        url: document.URL
      }
    ]
  }

  // Set the activity
  presence.setActivity(presenceData)
})
```

## Next Steps

Now that you understand how to add settings to your activity, you can learn more about:

- [iFrames](/v1/guide/iframes): Learn how to gather information from iframes.
- [Slideshows](/v1/guide/slideshows): Learn how to create a slideshow that alternates between different presence data.
- [Multilanguage](/v1/guide/multilanguage): Learn how to add support for multiple languages to your activity.
