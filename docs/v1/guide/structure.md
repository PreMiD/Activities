# Activity Structure

This guide explains the structure of a PreMiD Activity and how to organize your code.

## API Versioning

PreMiD supports multiple API versions for activities. Currently, there are two versions:

- **API v1**: The current stable API used for all activities in the PreMiD store
- **API v2**: The next generation API currently in development

You can specify which API version your activity uses in the `metadata.json` file:

```json
{
  "apiVersion": 1
}
```

If not specified, the default is API v1. This documentation covers API v1. When API v2 is released, separate documentation will be provided.

### Versioned Directory Structure

When an activity needs to support multiple API versions, it uses a versioned directory structure. Instead of having all files directly in the activity's directory, each version has its own subdirectory:

```
websites/
├── E/
│   └── Example/
│       ├── v1/
│       │   ├── metadata.json
│       │   ├── presence.ts
│       │   └── tsconfig.json
│       └── v2/
│           ├── metadata.json
│           ├── presence.ts
│           └── tsconfig.json
```

This structure allows an activity to support multiple API versions simultaneously. The PreMiD CLI handles this versioning automatically with the `versionize` command, which creates a new version directory with the appropriate files.

### Creating a New Activity

To create a new activity, you can use the `new` command:

```bash
npx pmd new "Example"
```

This command will:

1. Ask for basic information about the activity (author, tags, category)
2. Create a new directory for the activity with the necessary files
3. Set the `apiVersion` field to `1` in the `metadata.json` file

By default, new activities are created with API version 1 and are not placed in a versioned directory structure.

### Creating a New Version of an Activity

If you need to create a new version of an existing activity to support a newer API version, you can use the `versionize` command:

```bash
npx pmd versionize "Example"
```

This command will:

1. If the activity is not already versioned:

   - Move the current activity files into a `v1` directory
   - Create a new `v2` directory with the necessary files
   - Update the `apiVersion` field to `2` in the new version's `metadata.json` file

2. If the activity is already versioned:
   - Create a new directory for the next API version (e.g., `v2` if the latest is `v1`)
   - Copy the metadata from the latest version and update the `apiVersion` field
   - Add the necessary template files

You can then modify the files in the new version directory to support the new API version while maintaining backward compatibility with the previous version.

## Basic Structure

A PreMiD Activity consists of at least two files:

1. `metadata.json`: Contains information about the activity
2. `presence.ts`: Contains the main activity code

For activities that need to interact with iframes, a third file is required:

3. `iframe.ts`: Contains code for handling iframes

## Directory Structure

Activities are stored in the `websites/` directory of the PreMiD Activities repository. Each activity has its own directory, named after the service it supports.

```
websites/
├── Y/
│   └── YouTube/
│       ├── metadata.json
│       ├── presence.ts
│       └── iframe.ts
├── N/
│   └── Netflix/
│       ├── metadata.json
│       └── presence.ts
└── S/
    └── Spotify/
        ├── metadata.json
        └── presence.ts
```

The first letter of the service name determines which subdirectory it belongs to. For example, "YouTube" is in the "Y" directory.

## metadata.json

The `metadata.json` file contains information about your activity, such as the name, description, author, and version. This file is used to generate the activity's page on the PreMiD store and to provide information to the PreMiD extension.

Here's an example of a `metadata.json` file:

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

For more information about the `metadata.json` file, see the [Metadata](/v1/guide/metadata) guide.

## presence.ts

The `presence.ts` file contains the main code for your activity. This is where you define what information is displayed in the user's Discord status.

Here's a basic example of a `presence.ts` file:

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png',
    details: 'Browsing Example.com',
    state: 'Homepage',
    startTimestamp: Date.now()
  }

  presence.setActivity(presenceData)
})
```

The `presence.ts` file typically follows this structure:

1. Create a new `Presence` instance
2. Listen for the `UpdateData` event
3. Gather information from the page
4. Create a `PresenceData` object
5. Set the activity using `presence.setActivity()`

For more information about the `Presence` class, see the [Presence Class](/v1/guide/presence-class) guide.

## iframe.ts (Optional)

The `iframe.ts` file is used to gather information from iframes on the page. This is necessary for websites that load content in iframes, such as embedded videos or music players.

Here's a basic example of an `iframe.ts` file:

```typescript
const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  const video = document.querySelector('video')

  if (video) {
    iframe.send({
      video: {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        title: document.querySelector('.video-title')?.textContent
      }
    })
  }
})
```

The `iframe.ts` file typically follows this structure:

1. Create a new `iFrame` instance
2. Listen for the `UpdateData` event
3. Gather information from the iframe
4. Send the information to the main presence using `iframe.send()`

For more information about using iframes, see the [iFrames](/v1/guide/iframes) guide.

## Advanced Configuration

### TypeScript Configuration

Each activity includes a `tsconfig.json` file that configures the TypeScript compiler. This file is **automatically managed** by the PreMiD CLI and should not be modified manually. The CLI ensures that the correct compiler options are set for your activity.

### Dependencies

If your activity requires external dependencies, you can add a `package.json` file to your activity's directory. The PreMiD CLI will automatically install these dependencies when building your activity.

For more information about using dependencies in your activities, see the [Dependencies](/v1/guide/dependencies) guide.

### Code Organization

You can split your activity's code into multiple files as long as they are imported and used in the main `presence.ts` or `iframe.ts` files. This can help keep your code organized and maintainable.

Example directory structure with multiple files:

```
websites/
├── E/
│   └── Example/
│       ├── metadata.json
│       ├── presence.ts
│       ├── iframe.ts
│       ├── utils.ts
│       ├── types.ts
│       └── constants.ts
```

In your `presence.ts` file, you can import these modules:

```typescript
import { SELECTORS } from './constants'
import { VideoData } from './types'
import { formatTime } from './utils'
```

## Best Practices

Here are some best practices for organizing your activity code:

1. **Keep it simple**: Only gather the information you need. Avoid unnecessary complexity.
2. **Use TypeScript**: Take advantage of TypeScript's type checking to avoid errors.
3. **Handle errors**: Always check if elements exist before trying to access their properties.
4. **Use constants**: Define constants for repeated values to make your code more maintainable.
5. **Comment your code**: Add comments to explain what your code is doing, especially for complex logic.
6. **Follow the style guide**: Use consistent formatting and naming conventions.
7. **Test thoroughly**: Test your activity on different pages of the website to ensure it works correctly.
8. **Split complex logic**: For complex activities, split your code into multiple files for better organization.

## Next Steps

Now that you understand the structure of a PreMiD Activity, you can learn more about:

- [Metadata](/v1/guide/metadata): Learn about the metadata.json file and how to configure your activity.
- [Presence Class](/v1/guide/presence-class): Learn about the Presence class and its methods.
- [Settings](/v1/guide/settings): Learn how to add customizable settings to your activity.
- [Dependencies](/v1/guide/dependencies): Learn how to add and use external dependencies in your activity.
- [iFrames](/v1/guide/iframes): Learn how to gather information from iframes.
