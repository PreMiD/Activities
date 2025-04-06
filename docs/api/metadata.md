# Metadata Interface

The `Metadata` interface defines the structure of the `metadata.json` file, which contains basic information about the activity.

## Structure

```typescript
interface Metadata {
  author: Contributor;
  contributors?: Contributor[];
  service: string;
  altnames?: string[];
  description: Record<string, string>;
  url: string | string[];
  version: string;
  logo: string;
  thumbnail: string;
  color: string;
  tags: string[];
  category: 'anime' | 'games' | 'music' | 'socials' | 'videos' | 'other';
  iframe?: boolean;
  regExp?: string;
  iFrameRegExp?: string;
  readLogs?: boolean;
  button?: boolean;
  warning?: boolean;
  settings?: {
    id: string;
    title?: string;
    icon?: string;
    if?: Record<string, string | number | boolean>;
    placeholder?: string;
    value?: string | number | boolean;
    values?: (string | number | boolean)[];
    multiLanguage?: true;
  }[];
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `author` | `Contributor` | Information about the activity developer |
| `contributors` | `Contributor[]` (optional) | Array of contributors to the activity |
| `service` | `string` | The title of the service that this activity supports |
| `altnames` | `string[]` (optional) | Alternative titles for the service |
| `description` | `Record<string, string>` | Small description of the service in different languages |
| `url` | `string \| string[]` | URL of the service |
| `version` | `string` | Version of your activity (Semantic Versioning) |
| `logo` | `string` | Link to service's logo |
| `thumbnail` | `string` | Link to service's thumbnail |
| `color` | `string` | `#HEX` value for the activity color |
| `tags` | `string[]` | Array with tags to help users find the activity |
| `category` | `'anime' \| 'games' \| 'music' \| 'socials' \| 'videos' \| 'other'` | Category the activity falls under |
| `iframe` | `boolean` (optional) | Defines whether `iFrames` are used |
| `regExp` | `string` (optional) | Regular expression string used to match URLs |
| `iFrameRegExp` | `string` (optional) | Regular expression selector for iframes to inject into |
| `readLogs` | `boolean` (optional) | Defines whether `getLogs()` is used |
| `button` | `boolean` (optional) | Whether to include a "add activity" button on the store (partnered activities only) |
| `warning` | `boolean` (optional) | Whether to display a warning on the activity installation page |
| `settings` | `object[]` (optional) | Array of settings the user can change |

## Contributor Interface

```typescript
interface Contributor {
  name: string;
  id: string;
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Name of the contributor on Discord (without the identifier) |
| `id` | `string` | Discord ID of the contributor |

## Settings

Each setting object in the `settings` array has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Identifier of the setting |
| `title` | `string` (optional) | Title of the setting |
| `icon` | `string` (optional) | Icon for the setting |
| `if` | `Record<string, string \| number \| boolean>` (optional) | Conditions for the setting to appear |
| `placeholder` | `string` (optional) | Placeholder text for string settings |
| `value` | `string \| number \| boolean` (optional) | Default value of the setting |
| `values` | `(string \| number \| boolean)[]` (optional) | Array of values for dropdown settings |
| `multiLanguage` | `true` (optional) | Use strings from localization files |

## Example

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
    "en": "Example is a website that does something cool.",
    "de": "Example ist eine Website, die etwas Cooles macht."
  },
  "url": "example.com",
  "version": "1.0.0",
  "logo": "https://example.com/logo.png",
  "thumbnail": "https://example.com/thumbnail.png",
  "color": "#FF0000",
  "tags": ["example", "sample", "demo"],
  "category": "other",
  "iframe": false,
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
      "id": "buttonType",
      "title": "Button Type",
      "icon": "fas fa-mouse-pointer",
      "value": 0,
      "values": ["View Page", "Visit Website", "Read More"]
    }
  ]
}
```

## Notes

- The `service` name should match the folder name of the activity.
- The `url` must not include `http://` or `https://`.
- The `version` should follow Semantic Versioning (MAJOR.MINOR.PATCH).
- The `logo` and `thumbnail` must be direct links to images.
- The `color` must be a valid HEX color code.
- The `category` must be one of the predefined categories.
- The `settings` array is optional but allows for user customization of the activity.
