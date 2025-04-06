# Localization

Localization allows users to see information in their preferred language. This guide will show you how to add localization support to your activity.

![Internationalization Example](https://placehold.co/800x400?text=Internationalization+Example)

## Why Add Localization?

PreMiD is used by people from all over the world who speak different languages. By adding localization to your activity, you can provide a better experience for users who don't speak English.

Benefits of adding localization:

1. **Better user experience**: Users can see information in their preferred language.
2. **Wider audience**: Your activity can be used by people who don't speak English.
3. **Community contribution**: The PreMiD community can help translate your activity to more languages.

## Prerequisites

To use localization in your activity, you must add the language setting to your `metadata.json` file. This special setting enables the language selector in the activity settings.

```json
{
  "settings": [
    {
      "id": "lang",
      "multiLanguage": true
    }
  ]
}
```

Without this setting, users won't be able to select their preferred language.

## Adding Localization to metadata.json

The first step in adding localization is to provide translations for the description in your `metadata.json` file:

```json
{
  "description": {
    "en": "Example is a website that does something cool.",
    "de": "Example ist eine Website, die etwas Cooles macht.",
    "fr": "Example est un site web qui fait quelque chose de cool.",
    "es": "Example es un sitio web que hace algo genial."
  }
}
```

The keys are language codes, and the values are the descriptions in those languages. You should at least provide an English description. The PreMiD translation team will help with other languages.

## Using the getStrings Method

The `getStrings` method allows you to get translations for common strings from the PreMiD extension. These translations are maintained by the PreMiD translation team and are available in many languages.

```typescript
presence.on("UpdateData", async () => {
  // Get translations
  const strings = await presence.getStrings({
    play: "general.playing",
    pause: "general.paused",
    browse: "general.browsing"
  });

  // Use translations in your presence data
  const presenceData: PresenceData = {
    largeImageKey: "logo"
  };

  const video = document.querySelector("video");

  if (video) {
    if (video.paused) {
      presenceData.details = strings.pause;
    } else {
      presenceData.details = strings.play;
    }
  } else {
    presenceData.details = strings.browse;
  }

  presence.setActivity(presenceData);
});
```

The `getStrings` method takes an object where the keys are the names you want to use for the strings, and the values are the keys for the strings in the PreMiD translation system.

## Available Translation Keys

PreMiD provides a set of common strings in the `websites/general.json` file. These strings are prefixed with `general.` and can be used in any activity.

Here's how the strings are structured in the general.json file:

```json
{
  "general.playing": {
    "description": "", // Description for translators
    "message": "Playing" // The actual string value
  },
  "general.paused": {
    "description": "",
    "message": "Paused"
  }
}
```

Here are some commonly used translation keys:

| Key | English Value |
|-----|---------------|
| `general.playing` | "Playing" |
| `general.paused` | "Paused" |
| `general.browsing` | "Browsing..." |
| `general.reading` | "Reading..." |
| `general.watching` | "Watching..." |
| `general.live` | "Live" |
| `general.episode` | "Episode" |
| `general.season` | "Season" |
| `general.chapter` | "Chapter" |
| `general.page` | "Page" |

For a complete list of available translation keys, check the `websites/general.json` file in the PreMiD Activities repository.

## Language Setting

To allow users to select their preferred language for your activity, you can add a special language setting. This is done by adding a setting with the ID `lang` and setting the `multiLanguage` property to `true`:

```json
{
  "settings": [
    {
      "id": "lang",
      "multiLanguage": true
    }
  ]
}
```

This special setting tells PreMiD that your activity supports multiple languages. When this setting is present, PreMiD will automatically add a language selector to your activity's settings page, allowing users to choose which language they want to see in your activity.

![Language Setting Example](https://placehold.co/800x400?text=Language+Setting+Example)

**Important Notes:**

1. The `lang` setting is a special case and can only be used once in your activity.
2. You cannot use `multiLanguage: true` with any other setting ID besides `lang`.
3. When a user selects a language, your activity can retrieve this selection using `presence.getSetting("lang")` and use it to display content in the appropriate language.

## Creating Custom Translations

If you need to use strings that are not available in the PreMiD translation system, you can create custom translations for your activity by adding a localization file.

### Adding a Localization File

To add custom translations, create a JSON file named after your service in the activity's directory. For example, if your activity is for "Example", create a file named `Example.json`.

```
websites/
├── E/
│   └── Example/
│       ├── metadata.json
│       ├── presence.ts
│       └── Example.json  <-- Localization file
```

The localization file should follow the same structure as the general.json file, but with keys prefixed by your activity's name to avoid conflicts:

```json
{
  "example.homepage": {
    "description": "Shown when viewing the homepage",
    "message": "Homepage"
  },
  "example.about": {
    "description": "Shown when viewing the about page",
    "message": "About page"
  },
  "example.contact": {
    "description": "Shown when viewing the contact page",
    "message": "Contact page"
  }
}
```

**Important**: When creating custom strings for your activity, you must always prefix the keys with your activity's name (e.g., `example.homepage`) to avoid conflicts with other activities or the general strings. The `description` field helps translators understand the context of the string, and the `message` field contains the actual text in plain English.

### Using Custom Translations

In your `presence.ts` file, you can access these translations:

```typescript
presence.on("UpdateData", async () => {
  // Get the user's language
  const userLanguage = await presence.getSetting<string>("lang") || "en";

  // PreMiD automatically loads your localization file
  // and makes it available through the presence.strings object
  const strings = presence.strings[userLanguage] || presence.strings.en;

  // Access your custom strings
  // The getStrings method automatically extracts the message field

  // Create the presence data
  const presenceData: PresenceData = {
    largeImageKey: "logo",
    details: strings.play // From general.json
  };

  const path = document.location.pathname;

  // For custom strings from your activity's localization file
  if (path === "/") {
    presenceData.state = await presence.getStrings({ home: "example.homepage" }).home;
  }

  // You can also get multiple custom strings at once
  const customStrings = await presence.getStrings({
    about: "example.about",
    contact: "example.contact"
  });

  if (path.includes("/about")) {
    presenceData.state = customStrings.about;
  } else if (path.includes("/contact")) {
    presenceData.state = customStrings.contact;
  }

  presence.setActivity(presenceData);
});
```

## Best Practices

1. **Use the getStrings method**: Use the `getStrings` method for common strings that are already translated by the PreMiD team.
2. **Create a localization file**: For custom strings, create a localization file named after your service.
3. **Provide fallbacks**: Always provide fallbacks for languages that are not supported.
4. **Keep it simple**: Use simple, clear language that is easy to translate.
5. **Be consistent**: Use consistent terminology throughout your activity.
6. **Test with different languages**: Test your activity with different languages to ensure it works correctly.

## Complete Example

Here's a complete example of an activity with localization support:

### metadata.json

```json
{
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  },
  "service": "Example",
  "description": {
    "en": "Example is a website that does something cool.",
    "de": "Example ist eine Website, die etwas Cooles macht.",
    "fr": "Example est un site web qui fait quelque chose de cool."
  },
  "url": "example.com",
  "version": "1.0.0",
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "tags": ["example", "multilanguage"],
  "category": "other",
  "settings": [
    {
      "id": "lang",
      "multiLanguage": true
    },
    {
      "id": "showButtons",
      "title": "Show Buttons",
      "icon": "fas fa-compress-arrows-alt",
      "value": true
    }
  ]
}
```

### presence.ts

```typescript
const presence = new Presence({
  clientId: "your_client_id"
});

// Example.json file is automatically loaded by PreMiD

presence.on("UpdateData", async () => {
  // Get settings
  const showButtons = await presence.getSetting<boolean>("showButtons");
  const userLanguage = await presence.getSetting<string>("lang") || "en";

  // Get translations from PreMiD
  const strings = await presence.getStrings({
    browse: "general.browsing"
  });

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: "logo",
    startTimestamp: Date.now()
  };

  // Set details based on the current page
  const path = document.location.pathname;

  // Get custom translations using getStrings method
  if (path === "/") {
    const homeString = await presence.getStrings({ home: "example.homepage" });
    presenceData.details = homeString.home;
  } else if (path.includes("/about")) {
    const aboutString = await presence.getStrings({ about: "example.about" });
    presenceData.details = aboutString.about;
  } else if (path.includes("/contact")) {
    const contactString = await presence.getStrings({ contact: "example.contact" });
    presenceData.details = contactString.contact;
  } else {
    presenceData.details = strings.browse;
  }

  // Add buttons if enabled
  if (showButtons) {
    presenceData.buttons = [
      {
        label: "Visit Website",
        url: document.URL
      }
    ];
  }

  // Set the activity
  presence.setActivity(presenceData);
});
```

### Example.json

```json
{
  "example.homepage": {
    "description": "Shown when viewing the homepage",
    "message": "Homepage"
  },
  "example.about": {
    "description": "Shown when viewing the about page",
    "message": "About page"
  },
  "example.contact": {
    "description": "Shown when viewing the contact page",
    "message": "Contact page"
  }
}
```

Note that the keys in the localization file are prefixed with the activity's name (`example.`) to avoid conflicts with other activities or general strings. The `description` field provides context for translators, and the `message` field contains the actual text in plain English.

## Next Steps

Now that you understand how to add localization to your activity, you can learn more about:

- [Best Practices](/v1/guide/best-practices): Learn best practices for creating activities.
