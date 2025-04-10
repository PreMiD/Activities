# Installation

This guide will help you set up your development environment for creating PreMiD Activities.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [Git](https://git-scm.com/)
- A code editor (we recommend [Visual Studio Code](https://code.visualstudio.com/))
- [PreMiD](https://premid.app/downloads) extension and application

::: warning TypeScript is Required
All PreMiD Activities must be written in TypeScript. JavaScript is not supported.
:::

## Setting Up the Development Environment

### 1. Clone the Repository

First, you need to clone the Activities repository:

```bash
git clone https://github.com/PreMiD/Activities.git
cd Activities
```

### 2. Install Dependencies

Install the required dependencies:

```bash
npm install
```

This will install all the necessary dependencies, including the PreMiD CLI tool.

## PreMiD CLI Overview

The PreMiD CLI (Command Line Interface) is a tool that helps you create, test, and build activities. It's included in the repository and can be accessed using the `npx pmd` command.

Here's a quick overview of the main CLI commands:

| Command                                 | Description                           |
| --------------------------------------- | ------------------------------------- |
| `npx pmd new "YourActivityName"`        | Creates a new activity                |
| `npx pmd dev "YourActivityName"`        | Develops an activity with live-reload |
| `npx pmd versionize "YourActivityName"` | Creates a new version of an activity  |
| `npx pmd build "YourActivityName"`      | Builds an activity for production     |

For detailed instructions on how to use these commands, see the [Creating Your First Activity](/v1/guide/first-activity) guide.

## Project Structure

The Activities repository has the following structure:

- `websites/`: Contains all the activities, organized by website name
- `@types/`: Contains TypeScript type definitions for the PreMiD API
- `docs/`: Contains the documentation (what you're reading now)
- `cli/`: Contains the PreMiD CLI tool

Each activity is stored in its own directory under `websites/` and typically contains the following files:

- `metadata.json`: Contains information about the activity
- `presence.ts`: The main activity code
- `iframe.ts` (optional): Code for handling iframes

## Next Steps

Now that you have your development environment set up, you're ready to create your first activity! Continue to the [Creating Your First Activity](/v1/guide/first-activity) guide.
