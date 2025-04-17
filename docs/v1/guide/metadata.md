# Metadata

The `metadata.json` file is a crucial component of every PreMiD Activity. It contains essential information about your activity, including its name, description, author, and various configuration options.

![Metadata in PreMiD Store](https://placehold.co/800x400?text=Metadata+in+PreMiD+Store)

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
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "tag"]
}
```

## Required Fields

| Field         | Type            | Description                                                                                        |
| ------------- | --------------- | -------------------------------------------------------------------------------------------------- |
| `author`      | Object          | Information about the activity developer                                                           |
| `service`     | String          | The title of the service that this activity supports                                               |
| `description` | Object          | Small description of the service in different languages                                            |
| `url`         | String or Array | URL of the service (without http:// or https://)                                                   |
| `version`     | String          | Version of your activity (Semantic Versioning)                                                     |
| `logo`        | String          | Link to service's logo. For PreMiD-related activities, you can use `https://cdn.rcd.gg/PreMiD.png` |
| `thumbnail`   | String          | Link to service's thumbnail                                                                        |
| `color`       | String          | `#HEX` value for the activity color                                                                |
| `tags`        | Array           | Array with tags to help users find the activity                                                    |
| `category`    | String          | Category the activity falls under                                                                  |

## Optional Fields

| Field          | Type    | Description                                                                         |
| -------------- | ------- | ----------------------------------------------------------------------------------- |
| `apiVersion`   | Number  | The API version to use (1 or 2). If not specified, defaults to 1                    |
| `contributors` | Array   | Array of contributors to the activity                                               |
| `altnames`     | Array   | Alternative titles for the service                                                  |
| `iframe`       | Boolean | Defines whether `iFrames` are used                                                  |
| `regExp`       | String  | Regular expression string used to match URLs                                        |
| `iFrameRegExp` | String  | Regular expression selector for iframes to inject into                              |
| `readLogs`     | Boolean | Defines whether `getLogs()` is used                                                 |
| `button`       | Boolean | Whether to include a "add activity" button on the store (partnered activities only) |
| `warning`      | Boolean | Whether to display a warning on the activity installation page                      |
| `settings`     | Array   | Array of settings the user can change                                               |

## Detailed Field Explanations

### Author and Contributors

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

### Description

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

You should at least provide an English description. The PreMiD translation team will help with other languages.

### URL

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

### Logo and Thumbnail

The `logo` and `thumbnail` fields contain links to the service's logo and thumbnail images:

<!-- eslint-skip -->

```json
{
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png"
}
```

**Logo**: A square image that represents the service. This will be displayed in the Discord Rich Presence small image and in the PreMiD store.

**Thumbnail**: A wider image (16:9 recommended) that showcases the service. This will be displayed in the PreMiD store.

**For PreMiD-related activities**: You can use the official PreMiD logo by using this URL:

```json
{
  "logo": "https://cdn.rcd.gg/PreMiD.png"
}
```

### Category

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

### Settings

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

#### Boolean Setting Example

```json
{
  "id": "showButtons",
  "title": "Show Buttons",
  "icon": "fas fa-compress-arrows-alt",
  "value": true
}
```

#### Dropdown Setting Example

```json
{
  "id": "displayFormat",
  "title": "Display Format",
  "icon": "fas fa-paragraph",
  "value": 0,
  "values": ["Title", "Title - Artist", "Artist - Title"]
}
```

#### Conditional Setting Example

```json
{
  "id": "showTimestamp",
  "title": "Show Timestamp",
  "icon": "fas fa-clock",
  "value": true,
  "if": {
    "showButtons": true
  }
}
```

#### Multilanguage Setting Example

```json
{
  "id": "showButtons",
  "multiLanguage": true
}
```

### Regular Expressions

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
  "apiVersion": 1,
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
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "category": "other",
  "tags": ["example", "sample", "demo"],
  "iframe": false,
  "readLogs": false,
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
      "value": true,
      "if": {
        "showButtons": true
      }
    },
    {
      "id": "buttonType",
      "title": "Button Type",
      "icon": "fas fa-mouse-pointer",
      "value": 0,
      "values": ["View Page", "Visit Website", "Read More"]
    }
  ]
}
```

## Best Practices

1. **Be descriptive**: Provide clear and concise descriptions of your activity.
2. **Use appropriate tags**: Choose tags that accurately represent your activity to help users find it.
3. **Choose the right category**: Select the category that best fits your activity.
4. **Provide high-quality images**: Use high-resolution images for the logo and thumbnail.
5. **Follow semantic versioning**: Use the MAJOR.MINOR.PATCH format for versioning.
6. **Keep settings simple**: Only add settings that are useful for users.
7. **Test your regular expressions**: Make sure your regular expressions correctly match the URLs you want to support.
8. **Follow the guidelines**: Make sure your metadata follows our [Guidelines](/v1/guide/guidelines#metadata-requirements) for service naming, tags, and other requirements.

## Next Steps

Now that you understand how to configure your activity's metadata, you can learn more about:

- [Presence Class](/v1/guide/presence-class): Learn about the Presence class and its methods.
- [Settings](/v1/guide/settings): Learn how to add customizable settings to your activity.
- [iFrames](/v1/guide/iframes): Learn how to gather information from iframes.
