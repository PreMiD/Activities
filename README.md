<div align="center">
    <img src="https://avatars3.githubusercontent.com/u/46326568?s=400&amp;u=15e4a4988014780288d30ffb969fd1569fec23e6&amp;v=4" width="128px" style="max-width:100%;">
    <h1>PreMiD Activities</h1>
</div>

This repository contains the source code of all Activities that are available in [PreMiD's Store](https://premid.app/store). Activities enhance your Discord presence by showing what you're doing on various websites.

<div align="center">
    <a target="_blank" href="https://discord.premid.app/" title="Join our Discord!">
        <img src="https://img.shields.io/discord/493130730549805057?label=Discord&labelColor=7289da&color=ddd&logo=premid&logoColor=fff&logoSize=auto&style=for-the-badge" alt="Join our Discord!">
    </a>
</div>

---

## Getting Started

Want to create your own Activity or modify an existing one? Great! Follow these simple steps:

1. **Set up your development environment**

   - Install [Node.js](https://nodejs.org/) (version 20 or higher)
   - Clone this repository: `git clone https://github.com/PreMiD/Activities.git`
   - Navigate to the project directory: `cd Activities`
   - Install dependencies: `npm install`

2. **Learn the basics**

   - Read our [documentation](https://docs.premid.app/dev/presence) to understand how Activities work
   - Browse through existing Activities to see examples and best practices

3. **Start creating/editing**
   - Use our CLI tool as described below to create and develop your Activity

## CLI Commands

The repository includes a command-line tool (`pmd`) to help you create and develop Activities easily.

### Creating a New Activity

To create a new Activity with all the necessary files and structure:

```bash
npx pmd new my-activity-name
```

This will guide you through a setup process, asking for basic information to generate the Activity structure.

### Developing an Activity

Once you've created an Activity, you can develop it with live-reload functionality:

```bash
npx pmd dev my-activity-name
```

This command will:

- Start a development server
- Watch for changes in your Activity files
- Automatically rebuild when you make changes
- Validate your Activity against PreMiD standards

Useful options:

- `--validate`: Run additional validation checks for metadata, images, etc.

## Testing Your Activity

To test your Activity:

1. Install the [PreMiD Extension](https://premid.app/downloads) in your browser
2. **Enable "Activity Developer Mode"** in the extension settings:
   - Click on the PreMiD extension icon in your browser
   - Go to settings (⚙️)
   - Enable "Activity Developer Mode"
3. Run the development command:
   ```bash
   npx pmd dev my-activity-name
   ```
4. The `pmd` tool will automatically send your Activity to the extension while in development mode
5. Navigate to the website your Activity supports to see it in action
6. Changes you make will be automatically picked up and sent to the extension

This development workflow allows you to see your changes in real-time without having to manually load the Activity each time you make a change.

## Submitting Your Activity

When your Activity is ready:

1. Make sure it passes all validation checks
2. Create a Pull Request to this repository
3. Wait for a review from our maintainers

## Committing

This repository strictly enforces the use of commitlint. For more information read the [Commit Convention guide](./.github/COMMIT_CONVENTION.md)
