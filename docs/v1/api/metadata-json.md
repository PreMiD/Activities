# metadata.json Structure

The `metadata.json` file is a crucial component of every PreMiD Activity. It contains essential information about your activity, including its name, description, author, and various configuration options.

## Basic Structure

Here's the basic structure of a `metadata.json` file:

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
  "logo": "https://i.imgur.com/XXXXXXX.png",
  "thumbnail": "https://i.imgur.com/YYYYYYY.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "tag"]
}
```

## Required Fields

| Field         | Type            | Description                                             |
| ------------- | --------------- | ------------------------------------------------------- |
| `author`      | Object          | Information about the activity developer                |
| `service`     | String          | The title of the service that this activity supports    |
| `description` | Object          | Small description of the service in different languages |
| `url`         | String or Array | URL of the service (without http:// or https://)        |
| `version`     | String          | Version of your activity (Semantic Versioning)          |
| `logo`        | String          | Link to service's logo                                  |
| `thumbnail`   | String          | Link to service's thumbnail                             |
| `color`       | String          | `#HEX` value for the activity color                     |
| `tags`        | Array           | Array with tags to help users find the activity         |
| `category`    | String          | Category the activity falls under                       |

## Optional Fields

| Field          | Type    | Description                                                                         |
| -------------- | ------- | ----------------------------------------------------------------------------------- |
| `contributors` | Array   | Array of contributors to the activity                                               |
| `altnames`     | Array   | Alternative titles for the service                                                  |
| `iframe`       | Boolean | Defines whether `iFrames` are used                                                  |
| `regExp`       | String  | Regular expression string used to match URLs                                        |
| `iFrameRegExp` | String  | Regular expression selector for iframes to inject into                              |
| `readLogs`     | Boolean | Defines whether `getLogs()` is used                                                 |
| `button`       | Boolean | Whether to include a "add activity" button on the store (partnered activities only) |
| `warning`      | Boolean | Whether to display a warning on the activity installation page                      |
| `settings`     | Array   | Array of settings the user can change                                               |

## Author and Contributors

The `author` field is required and contains information about the activity developer:

```json
{
  "author": {
    "name": "Your Name",
    "id": "your_discord_id"
  }
}
```

The `contributors` field is optional and contains an array of contributors to the activity:

```json
{
  "contributors": [
    {
      "name": "Contributor Name",
      "id": "contributor_discord_id"
    }
  ]
}
```

## Description

The `description` field contains a small description of the service in different languages. The keys are language codes, and the values are the descriptions in those languages:

```json
{
  "description": {
    "de": "Example ist eine Website, die etwas Cooles macht.",
    "en": "Example is a website that does something cool.",
    "fr": "Example est un site web qui fait quelque chose de cool."
  }
}
```

### Using Open Graph Meta Tags

Many websites provide Open Graph meta tags in their HTML, which include official descriptions of the service. You can use the `og:description` tag to create an accurate description for your activity:

1. Visit the website's homepage
2. View the page source
3. Search for `<meta property="og:description" content="...">`
4. Use this content as a starting point for your description

Example of an Open Graph description tag:

```html
<meta
  property="og:description"
  content="Example is a platform that helps users create and share content with friends, family, and the world."
/>
```

This can be converted to your metadata.json description:

```json
{
  "description": {
    "en": "Example is a platform that helps users create and share content with friends, family, and the world."
  }
}
```

If the website doesn't have Open Graph tags, you can also look for a `<meta name="description" content="...">` tag, which serves a similar purpose.

You should at least provide an English description. The PreMiD translation team will help with other languages.

You can get a list of all available language codes from our API endpoint: `https://api.premid.app/v6/locales`

## URL

The `url` field contains the URL of the service. It can be a string or an array of strings:

```json
{
  "url": "example.com"
}
```

or

```json
{
  "url": ["example.com", "example.org"]
}
```

**Note**: Do not include `http://` or `https://` in the URL.

## Category

The `category` field defines the category the activity falls under. It must be one of the following values:

- `anime`: Anime, manga, or Japanese content related websites
- `games`: Game related websites
- `music`: Music streaming or music related websites
- `socials`: Social media or community websites
- `videos`: Video streaming or video related websites
- `other`: Anything that doesn't fit in the above categories

```json
{
  "category": "videos"
}
```

## Settings

The `settings` field is an array of settings that users can customize. Each setting has the following properties:

| Property        | Type                  | Description                               |
| --------------- | --------------------- | ----------------------------------------- |
| `id`            | String                | Identifier of the setting                 |
| `title`         | String                | Title of the setting                      |
| `icon`          | String                | Icon for the setting (Font Awesome class) |
| `value`         | Boolean/String/Number | Default value of the setting              |
| `values`        | Array                 | Array of values for dropdown settings     |
| `placeholder`   | String                | Placeholder text for string settings      |
| `if`            | Object                | Conditions for the setting to appear      |
| `multiLanguage` | Boolean               | Use strings from localization files       |
| `description`   | String                | Description of the setting (schema v1.0.9+) |

### Boolean Setting Example

```json
{
  "id": "showButtons",
  "title": "Show Buttons",
  "icon": "fas fa-compress-arrows-alt",
  "value": true,
  "description": "Display buttons in the Discord Activity"
}
```

### Dropdown Setting Example

```json
{
  "id": "displayFormat",
  "title": "Display Format",
  "icon": "fas fa-paragraph",
  "value": 0,
  "values": ["Title", "Title - Artist", "Artist - Title"],
  "description": "Choose how to display the title and artist information"
}
```

### Conditional Setting Example

```json
{
  "id": "showTimestamp",
  "title": "Show Timestamp",
  "icon": "fas fa-clock",
  "value": true,
  "description": "Show elapsed time since the activity started",
  "if": {
    "showButtons": true
  }
}
```

### Multilanguage Setting Example

```json
{
  "id": "showButtons",
  "multiLanguage": true
}
```

### Description Property (v1.0.9+)

Starting with metadata schema version 1.0.9, every setting supports an optional `description` property that provides additional context about the setting. The description will be displayed in the extension starting from version 2.8.0 and upwards. While descriptions are not required, they are highly encouraged. Some settings where the title already provides enough context may not require this property.

Currently, settings only support string descriptions. Multi-language descriptions for settings will be added later.

**String Description Example:**
```json
{
  "id": "showButtons",
  "title": "Show Buttons",
  "icon": "fas fa-compress-arrows-alt",
  "value": true,
  "description": "Display buttons in the Discord Activity"
}
```

**Version Compatibility:**
- Metadata schema v1.0.9+: Description property is supported
- Extension v2.8.0+: Description is displayed in the settings UI
- Earlier versions: Description property is ignored

**Best Practices for Descriptions:**
- Keep descriptions concise (under 100 characters recommended)
- Use clear, action-oriented language
- Explain what the setting does, not just what it is
- Consider what users need to know to make an informed choice
- Use consistent tone and terminology across all settings
- Test descriptions with users who are unfamiliar with the feature

**Examples:**
- ✅ Good: "Show elapsed time since the activity started"
- ✅ Good: "Display interactive buttons in Discord Activity"
- ❌ Poor: "Timestamp setting"
- ❌ Poor: "Buttons"

## Regular Expressions

The `regExp` field is a regular expression string used to match URLs:

```json
{
  "regExp": "([a-z0-9-]+[.])*example[.]com[/]"
}
```

The `iFrameRegExp` field is a regular expression selector for iframes to inject into:

```json
{
  "iFrameRegExp": "([a-z0-9-]+[.])*example[.]com[/]embed[/]"
}
```

## Complete Example

Here's a complete example of a `metadata.json` file with all possible fields:

```json
{
  "author": {
    "name": "John Doe",
    "id": "123456789012345678"
  },
  "contributors": [
    {
      "name": "Jane Smith",
      "id": "876543210987654321"
    }
  ],
  "service": "Example",
  "altnames": ["Ex", "Sample"],
  "description": {
    "de": "Example ist eine Website, die etwas Cooles macht.",
    "en": "Example is a website that does something cool."
  },
  "url": "example.com",
  "regExp": "([a-z0-9-]+[.])*example[.]com[/]",
  "version": "1.0.0",
  "logo": "https://i.imgur.com/XXXXXXX.png",
  "thumbnail": "https://i.imgur.com/YYYYYYY.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "sample", "demo"],
  "settings": [
    {
      "id": "showButtons",
      "title": "Show Buttons",
      "icon": "fas fa-compress-arrows-alt",
      "value": true,
      "description": "Display buttons in the Discord Activity"
    },
    {
      "id": "showTimestamp",
      "title": "Show Timestamp",
      "icon": "fas fa-clock",
      "value": true,
      "description": "Show elapsed time since the activity started",
      "if": {
        "showButtons": true
      }
    },
    {
      "id": "buttonType",
      "title": "Button Type",
      "icon": "fas fa-mouse-pointer",
      "value": 0,
      "values": ["View Page", "Visit Website", "Read More"],
      "description": "Choose the type of button to display"
    }
  ]
}
```

## Notes

- The `service` name should match the folder name of the activity.
- The `version` should follow Semantic Versioning (MAJOR.MINOR.PATCH).
- The `logo` and `thumbnail` must be direct links to images. We recommend using Imgur (`https://i.imgur.com/`) for temporarily hosting your images. When your Pull Request is merged, these images will be automatically transferred to the PreMiD CDN.
- The `color` must be a valid HEX color code.
- The `settings` array is optional but allows for user customization of the activity.
- Boolean fields that are `false` (like `iframe`, `readLogs`, etc.) should be omitted from the metadata.json file rather than explicitly set to false.
