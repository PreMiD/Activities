# Dependencies

PreMiD activities can use external dependencies to enhance functionality and simplify development. This guide explains how to add and use dependencies in your activities.

## Adding Dependencies

To add dependencies to your activity, create a `package.json` file in your activity's directory with only the `dependencies` property. The PreMiD CLI will automatically detect and install these dependencies when building your activity. Do not include any other properties in the package.json file.

### Example package.json

```json
{
  "dependencies": {
    "moment": "^2.29.4",
    "lodash": "^4.17.21"
  }
}
```

## How It Works

When you run `npx pmd dev` or `npx pmd build` for your activity, the PreMiD CLI:

1. Detects the `package.json` file in your activity directory
2. Automatically installs the dependencies using npm
3. Makes the dependencies available to your activity code

## Using Dependencies in Your Activity

Once you've added dependencies to your `package.json` file, you can import and use them in your activity code:

```typescript
// Import a dependency in your presence.ts file
import moment from "moment";
import { get } from "lodash";

const presence = new Presence({
  clientId: "your_client_id"
});

presence.on("UpdateData", async () => {
  // Use the imported dependencies
  const formattedTime = moment().format("h:mm:ss a");
  const pageTitle = get(document, "title", "Unknown Page");

  const presenceData: PresenceData = {
    largeImageKey: "logo",
    details: pageTitle,
    state: `Current time: ${formattedTime}`,
    startTimestamp: Date.now()
  };

  presence.setActivity(presenceData);
});
```

## Popular Dependencies

Here are some popular dependencies that can be useful for activity development:

### Date and Time Manipulation

- **[moment](https://momentjs.com/)**: A library for parsing, validating, manipulating, and formatting dates
- **[dayjs](https://day.js.org/)**: A minimalist JavaScript library for date and time manipulation

### Utility Libraries

- **[lodash](https://lodash.com/)**: A utility library that provides helpful functions for working with arrays, objects, and more
- **[underscore](https://underscorejs.org/)**: A utility library that provides functional programming helpers

### DOM Manipulation

- **[cheerio](https://cheerio.js.org/)**: A fast, flexible implementation of jQuery for parsing and manipulating HTML

### API Clients

- **[axios](https://axios-http.com/)**: A promise-based HTTP client for making API requests

## Best Practices

When using dependencies in your activities, follow these best practices:

1. **Keep it minimal**: Only add dependencies that provide significant value to your activity. Each dependency increases the size of your activity.

2. **Use specific versions**: Specify exact versions or use version ranges with caution to ensure consistent behavior.

3. **Only include dependencies property**: The package.json file should only contain the dependencies property. Do not include name, version, scripts, or any other properties.

4. **Check compatibility**: Ensure that the dependencies you use are compatible with the browser environment.

5. **Consider alternatives**: Sometimes, a simple utility function might be better than adding a large dependency.

6. **Document usage**: Add comments explaining why and how you're using each dependency.

## Limitations

- Dependencies must be compatible with browser environments
- The total size of your activity, including dependencies, should be kept reasonable
- Some dependencies may require additional configuration to work properly in the PreMiD environment

## Troubleshooting

If you encounter issues with dependencies:

1. **Check for browser compatibility**: Some Node.js-specific dependencies may not work in the browser environment.

2. **Verify imports**: Make sure you're importing the dependencies correctly.

3. **Check for conflicts**: Dependencies might conflict with each other or with PreMiD's built-in libraries.

4. **Update dependencies**: Try updating to the latest versions of your dependencies.

5. **Consult the community**: Ask for help in the [PreMiD Discord server](https://discord.gg/premid) if you're having trouble with specific dependencies.
