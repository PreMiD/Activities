# Multilanguage Support

Adding multilanguage support to your activity allows users to see information in their preferred language. This guide will show you how to add multilanguage support to your activity.

![Internationalization Example](https://placehold.co/800x400?text=Internationalization+Example)

## Why Add Multilanguage Support?

PreMiD is used by people from all over the world who speak different languages. By adding multilanguage support to your activity, you can provide a better experience for users who don't speak English.

Benefits of adding multilanguage support:

1. **Better user experience**: Users can see information in their preferred language.
2. **Wider audience**: Your activity can be used by people who don't speak English.
3. **Community contribution**: The PreMiD community can help translate your activity to more languages.

## Adding Multilanguage Support to metadata.json

The first step in adding multilanguage support is to provide translations for the description in your `metadata.json` file:

```json
{
  "description": {
    "de": "Example ist eine Website, die etwas Cooles macht.",
    "en": "Example is a website that does something cool.",
    "es": "Example es un sitio web que hace algo genial.",
    "fr": "Example est un site web qui fait quelque chose de cool."
  }
}
```

The keys are language codes, and the values are the descriptions in those languages. You should at least provide an English description. The PreMiD translation team will help with other languages.

## Using the getStrings Method

The `getStrings` method allows you to get translations for specific strings from the PreMiD extension. These translations are maintained by the PreMiD translation team and are available in many languages.

```typescript
presence.on('UpdateData', async () => {
  // Get translations
  const strings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
    browse: 'general.browsing'
  })

  // Use translations in your presence data
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png'
  }

  const video = document.querySelector('video')

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

  presence.setActivity(presenceData)
})
```

The `getStrings` method takes an object where the keys are the names you want to use for the strings, and the values are the keys for the strings in the PreMiD translation system.

## Available Translation Keys

Here are some commonly used translation keys:

| Key                 | English Value  |
| ------------------- | -------------- |
| `general.playing`   | "Playing"      |
| `general.paused`    | "Paused"       |
| `general.browsing`  | "Browsing..."  |
| `general.reading`   | "Reading..."   |
| `general.watching`  | "Watching..."  |
| `general.listening` | "Listening..." |
| `general.live`      | "Live"         |
| `general.episode`   | "Episode"      |
| `general.season`    | "Season"       |
| `general.chapter`   | "Chapter"      |
| `general.page`      | "Page"         |

For a complete list of available translation keys, check the [PreMiD Localization Repository](https://github.com/PreMiD/Localization).

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

If you need to use strings that are not available in the PreMiD translation system, you can create custom translations in your activity.

```typescript
presence.on('UpdateData', async () => {
  // Get the user's language
  const userLanguage = await presence.getSetting<string>('lang') || 'en'

  // Define custom translations
  const translations = {
    en: {
      homepage: 'Homepage',
      about: 'About page',
      contact: 'Contact page'
    },
    de: {
      homepage: 'Startseite',
      about: 'Über uns',
      contact: 'Kontakt'
    },
    fr: {
      homepage: 'Page d\'accueil',
      about: 'À propos',
      contact: 'Contact'
    }
  }

  // Use the user's language or fall back to English
  const strings = translations[userLanguage] || translations.en

  // Use translations in your presence data
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png'
  }

  const path = document.location.pathname

  if (path === '/') {
    presenceData.details = strings.homepage
  }
  else if (path.includes('/about')) {
    presenceData.details = strings.about
  }
  else if (path.includes('/contact')) {
    presenceData.details = strings.contact
  }

  presence.setActivity(presenceData)
})
```

## Best Practices

1. **Use the getStrings method**: Use the `getStrings` method for common strings that are already translated by the PreMiD team.
2. **Provide fallbacks**: Always provide fallbacks for languages that are not supported.
3. **Keep it simple**: Use simple, clear language that is easy to translate.
4. **Be consistent**: Use consistent terminology throughout your activity.
5. **Test with different languages**: Test your activity with different languages to ensure it works correctly.

## Complete Example

Here's a complete example of an activity with multilanguage support:

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
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "multilanguage"],
  "settings": [
    {
      "id": "showButtons",
      "multiLanguage": true,
      "value": true
    },
    {
      "id": "language",
      "title": "Language",
      "icon": "fas fa-language",
      "value": "en",
      "values": ["en", "de", "fr", "es", "pt", "ja", "zh", "ko"]
    }
  ]
}
```

### presence.ts

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

// Define custom translations
const translations = {
  en: {
    homepage: 'Homepage',
    about: 'About page',
    contact: 'Contact page'
  },
  de: {
    homepage: 'Startseite',
    about: 'Über uns',
    contact: 'Kontakt'
  },
  fr: {
    homepage: 'Page d\'accueil',
    about: 'À propos',
    contact: 'Contact'
  }
}

presence.on('UpdateData', async () => {
  // Get settings
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const userLanguage = await presence.getSetting<string>('language') || 'en'

  // Get translations from PreMiD
  const strings = await presence.getStrings({
    browse: 'general.browsing'
  })

  // Get custom translations
  const customStrings = translations[userLanguage] || translations.en

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png',
    startTimestamp: Date.now()
  }

  // Set details based on the current page
  const path = document.location.pathname

  if (path === '/') {
    presenceData.details = customStrings.homepage
  }
  else if (path.includes('/about')) {
    presenceData.details = customStrings.about
  }
  else if (path.includes('/contact')) {
    presenceData.details = customStrings.contact
  }
  else {
    presenceData.details = strings.browse
  }

  // Add buttons if enabled
  if (showButtons) {
    presenceData.buttons = [
      {
        label: 'Visit Website',
        url: document.URL
      }
    ]
  }

  // Set the activity
  presence.setActivity(presenceData)
})
```

## Next Steps

Now that you understand how to add multilanguage support to your activity, you can learn more about:

- [Best Practices](/v1/guide/best-practices): Learn best practices for creating activities.
