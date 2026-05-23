# Loading Activities

This guide explains how to load your activities into the PreMiD extension for testing and development.

[[toc]]

::: tip For Non-Developers
If you're not a developer but want to test activities, jump to the [Testing Activities for Non-Developers](#testing-activities-for-non-developers) section.
:::

## Activity Developer Mode

Before you can load any activities for testing, you must enable Activity Developer Mode in the PreMiD extension. This is a required step for both automatic loading with the CLI and manual loading through the extension interface.

### Enabling Activity Developer Mode

1. Open the PreMiD extension by clicking on its icon in your browser's toolbar
2. Go to the Settings tab
3. Scroll down to the "Developer" section
4. Enable the "Activity Developer Mode" toggle

![Activity Developer Mode](https://placehold.co/800x500)

When Activity Developer Mode is enabled, the PreMiD extension will accept connections from the PreMiD CLI, allowing you to load and test your activities directly from your local development environment.

## Loading Activities with the CLI

The easiest way to load your activities is using the PreMiD CLI's development mode. When you run the `npx pmd dev` command, the CLI will automatically:

1. Build your activity
2. Connect to the PreMiD extension
3. Load your activity into the extension
4. Watch for changes and reload the activity when you make changes

To start the development server and load your activity:

```bash
npx pmd dev "YourActivityName"
```

You should see a message in the console indicating that the CLI has connected to the extension and loaded your activity.

## Manual Loading for Developers

Developers can manually load activities directly through the extension interface. This is useful when:

- You're troubleshooting issues with the CLI
- You want to test activities shared by other developers
- You're using a browser where the CLI connection isn't working

To load an uncompiled activity (a directory with source files):

1. Enable Activity Developer Mode in the extension settings
2. Go to the Developer tab in the extension
3. Click on "Load Activity"
4. Select the directory containing your activity files (with metadata.json and presence.ts)

## Testing Activities for Non-Developers

::: tip For Users Without Development Experience
If you're not a developer but want to test activities shared by others, this section is for you!
:::

You can easily test activities without any development experience or setup. This is perfect for:

- Testing activities shared by friends
- Trying out activities before they're published
- Testing your own custom activities created by someone else

### Loading a Compiled Activity

To load a compiled activity (a zip file):

1. Open the PreMiD extension by clicking on its icon in your browser's toolbar
2. Go to the Settings tab
3. Enable "Activity Developer Mode" (you'll find this in the Developer section)
4. Go to the Developer tab in the extension
5. Click on "Load Compiled Activity"
6. Select the zip file containing the compiled activity
7. Visit the website the activity is designed for
8. Check your Discord status to see if it's showing the activity

### What You Need

- A compiled activity zip file (ask the developer to provide this)
- The PreMiD extension installed in your browser
- Discord desktop app running on your computer

No coding knowledge, command line usage, or development tools are required!

## Verifying Loaded Activities

To verify that your activity has been loaded correctly:

1. Go to the Activities tab in the extension
2. Look for your activity in the list of installed activities
3. It should have a "Dev" badge next to it, indicating it's loaded in development mode

You can also check the extension's console logs for any loading errors or warnings.

## Troubleshooting

If you're having trouble loading your activity:

### Connection Issues

- Make sure Activity Developer Mode is enabled in the extension settings
- Check that you're running the latest version of the PreMiD extension
- Try restarting your browser
- Check if there are any firewall or security settings blocking the connection

### Loading Issues

- Verify that your activity's `metadata.json` file is valid
- Check the console for any build errors
- Make sure your activity's directory structure is correct
- Try manually loading the activity through the extension's developer interface

### Activity Not Showing

- Make sure you're visiting a website that matches the URL pattern in your activity's `metadata.json`
- Check the extension's console for any runtime errors
- Verify that your activity is properly setting presence data in the `UpdateData` event

## Next Steps

Now that you know how to load activities, you can:

- Learn how to use the [Developer Tools](/v1/guide/developer-tools) to debug your activities
- Explore [Best Practices](/v1/guide/best-practices) for creating high-quality activities
- Learn about [Versioning](/v1/guide/structure#api-versioning) to support multiple API versions
