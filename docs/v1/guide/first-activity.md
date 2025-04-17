# Creating Your First Activity

This guide will walk you through the process of creating a basic PreMiD Activity.

## Setting Up

First, make sure you've followed the [Installation](/v1/guide/installation) guide to set up your development environment.

## Creating a New Activity

### Using the PreMiD CLI

1. Create a new activity using the CLI:

```bash
npx pmd new "YourActivityName"
```

::: warning Note
Do not use `npm run dev` to create a new activity. That command is for developing an existing activity.
:::

2. The CLI will guide you through the process of creating a new activity:
   - Enter your Discord ID (it will be validated and your username will be fetched)
   - Enter tags for the activity (comma-separated)
   - Select the category that best fits the website

![CLI Creating New Activity](https://placehold.co/800x400?text=CLI+Creating+New+Activity)

3. The CLI will create a new directory for your activity with the necessary files:
   - `metadata.json`: Contains information about the activity
   - `presence.ts`: The main activity code
   - `tsconfig.json`: TypeScript configuration file

::: tip Image Assets
For `largeImageKey` and `smallImageKey`, we recommend using direct URLs to images (e.g., `https://example.com/logo.png`) rather than asset names. This ensures your images are always accessible and simplifies the development process.
:::

### Developing Your Activity

After creating your activity, you can start developing it with:

```bash
npx pmd dev "YourActivityName"
```

This will start the development server and automatically reload your activity when you make changes to the code.

![Development Process with Hot Reload](https://placehold.co/800x400?text=Development+Process+with+Hot+Reload)

## Understanding the Files

### metadata.json

The `metadata.json` file contains information about your activity, such as the name, description, author, and version. Here's an example:

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

### presence.ts

The `presence.ts` file contains the main code for your activity. Here's a basic example:

```typescript
const presence = new Presence({
  clientId: 'your_client_id'
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png',
    details: 'Browsing Example.com',
    state: 'Homepage'
  }

  presence.setActivity(presenceData)
})
```

## Writing Your Activity Code

Now, let's modify the `presence.ts` file to create a simple activity:

1. Open the `presence.ts` file in your code editor.

2. Replace the content with the following code:

```typescript
const presence = new Presence({
  clientId: 'your_client_id' // This will be filled in by the CLI
})

presence.on('UpdateData', async () => {
  // Get the current URL
  const path = document.location.pathname

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: 'https://example.com/logo.png', // Direct URL to the logo image
    details: 'Browsing Example.com',
    startTimestamp: Date.now() // Show elapsed time
  }

  // Update the state based on the current page
  if (path === '/') {
    presenceData.state = 'Homepage'
  }
  else if (path.includes('/about')) {
    presenceData.state = 'Reading about us'
  }
  else if (path.includes('/contact')) {
    presenceData.state = 'Contacting us'
  }
  else {
    presenceData.state = 'Browsing'
  }

  // Set the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
```

This code creates a basic activity that shows what page the user is on, with different messages for different pages.

## Testing Your Activity

To test your activity, follow these steps:

1. Start the development server with `npx pmd dev "YourActivityName"`
2. Make sure the PreMiD extension is installed in your browser
3. Enable "Activity Developer Mode" in the extension settings
4. The CLI will automatically connect and send the activity to the extension
5. Visit the website your activity is designed for
6. Check your Discord status to see if it's showing the activity

When you make changes to your activity code, the development server will automatically reload the activity, and the changes will be reflected in your Discord status.

![Completed Activity in Discord](https://placehold.co/800x400?text=Completed+Activity+in+Discord)

## Next Steps

Congratulations! You've created your first PreMiD Activity. Before submitting your activity, make sure it follows our [Guidelines](/v1/guide/guidelines) to ensure it meets our quality standards and requirements.

To learn more about the different features and capabilities of activities, check out the following guides:

- [Activity Structure](/v1/guide/structure): Learn about the structure of an activity and how to organize your code.
- [Metadata](/v1/guide/metadata): Learn about the metadata.json file and how to configure your activity.
- [Presence Class](/v1/guide/presence-class): Learn about the Presence class and its methods.
- [Settings](/v1/guide/settings): Learn how to add customizable settings to your activity.
- [Loading Activities](/v1/guide/loading-activities): Learn more about loading activities into the PreMiD extension.
- [Developer Tools](/v1/guide/developer-tools): Learn how to use the built-in developer tools to debug your activities.
