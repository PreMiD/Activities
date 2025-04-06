# Introduction to Activity Development

Welcome to the PreMiD Activity Development guide! This documentation will help you learn how to create activities for PreMiD, which allow users to share what they're doing on the web through Discord's Rich Presence feature.

## What is an Activity?

An Activity (previously called a Presence) is a small piece of JavaScript code that runs when a user visits a specific website. It gathers information from the page and sends it to the PreMiD extension, which then updates the user's Discord status to show what they're doing on that website.

Activities can display various information, such as:
- The name of the website
- What the user is doing on the website (watching a video, listening to music, reading an article, etc.)
- Additional details like video/song titles, authors, timestamps, etc.
- Custom buttons that link to the content

## How Activities Work

Activities work by injecting a JavaScript file into the webpage when a user visits a supported site. This script uses the PreMiD API to gather information from the page and send it to the extension, which then communicates with Discord to update the user's status.

The basic flow is:
1. User visits a supported website
2. PreMiD extension injects the Activity script into the page
3. The script gathers information from the page
4. The information is sent to the extension
5. The extension sends the information to Discord
6. Discord updates the user's status

## Prerequisites

Before you start developing activities, you should have:
- Basic knowledge of JavaScript
- A code editor (VS Code, Sublime Text, etc.)
- Git installed on your computer
- A GitHub account
- Node.js (version 20 or higher) and npm installed

## Next Steps

Ready to start developing? Continue to the [Installation](/v1/guide/installation) guide to set up your development environment.
