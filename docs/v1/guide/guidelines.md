# Guidelines for PreMiD Activities

This page outlines the official guidelines and requirements that must be followed for an activity to be accepted into the PreMiD store. These guidelines ensure quality, consistency, and safety across all activities.

## General Guidelines

### Website Requirements

- Activities **cannot** be created for illegal websites (e.g., stressors, drug marketing, child pornography, etc.)
- Activities **cannot** be created for websites with free TLDs (.onion, .tk, .rf, .gd, etc.)
- Activities **cannot** be created for websites/domains that are less than 2 months old
- Activities targeting internal browser pages (Chrome Web Store, chrome://, about: pages, etc.) are **not allowed**
- Activities with support for only a single subdomain will **not be permitted**, as they may seem broken for other pages (like the homepage)
  - Exceptions can be made for policy and contact pages (content that isn't used often) or sites where the other content is unrelated (e.g., wikia pages)

### Localization

- Activities should use the common strings as much as possible (`general.string`)
- Adding the `multiLanguage` setting is strongly encouraged to support multiple languages

## Metadata Requirements

### Contributors

- Don't add yourself as a contributor if you are the author
- Don't add yourself as a contributor if you have only done 1 minor fix

### Service Name

- You **cannot** use the URL as the service name unless the website uses the URL as its official name
- If the name is not descriptive and can be considered vague, using the URL is required
  - Example: "YouTube" is permitted because that is the official name and is descriptive, while "youtube.com" is not
  - Example: "Top" is a non-descriptive name, so using the URL "top.gg" is required
- If a service has explicit branding rules for their name, you should follow them
- The folder name must be the sanitized version of the service name

### Altnames

- Only use this in scenarios where a website goes under multiple official names
  - Example: "Pokémon" and "포켓몬스터"

### Images

- **Logo**: Must be 512x512px and hosted on Imgur
- **Thumbnail**: Should preferably be a wide promotional card or a screenshot if the first is not available, hosted on Imgur

### Tags

- Tags must **not** include any spaces, slashes, single/double quotation marks, Unicode characters
- Tags should always be lowercase
- Tags should preferably include alternate service names to make searching easier
  - Example: If an Amazon activity included AWS support, it would have tags like "amazon-web-services" and "aws"

### Settings

- If you create a format string (e.g., `%song% by %artist%`), variables must be surrounded by a percent sign on either side
  - Variables like `%var`, `var%`, or `%%var%%` are **not permitted** for standardization
- Setting names must **not** be in all capital letters
  - Not permitted: "SHOW BROWSING STATUS"
  - Permitted: "Show Browsing Status" or "Show browsing status"

## Code Requirements

### presence.ts

- Never use custom functions when native variants are available
  - This ensures fixes on the extension level also apply to your activities
  - You're free to use whatever you need if you do not find them listed in the docs
- It is forbidden to code activities for a site without adding support to its primary language
  - Example: A YouTube activity must support English, even if it also supports Portuguese and Japanese
- The `smallImageKey` and `smallImageText` fields are intended to provide additional/secondary context (such as playing/paused for video sites, browsing for regular sites)
  - These fields must **not** be used to promote Discord profiles or anything unrelated to PreMiD
- When accessing cookies for stored data, please prefix the key with `PMD_`
- Do not set fields in the presenceData object to `undefined` after it has been declared
  - Use the `delete` keyword instead
  - Example: Use `delete data.startTimestamp` instead of `data.startTimestamp = undefined`

### Buttons

Activities that use buttons should follow these extra requirements:

- Redirects to the main page are prohibited
- Promoting websites through buttons is prohibited
- Buttons can't display information you couldn't fit in other fields
- Redirecting directly to audio/video streams is prohibited

## Submission Process

Before submitting your activity, make sure it:

1. Follows all the guidelines listed above
2. Passes validation with `npx pmd build "YourActivityName" --validate`
3. Has been tested thoroughly on different pages of the website

## Exceptions

Exceptions to these guidelines may be granted in special cases, but they must be approved by the PreMiD review team. If you believe your activity deserves an exception, please explain your reasoning in the pull request description.

## Questions

If you have any questions about these guidelines or need clarification, please join our [Discord server](https://discord.premid.app/) and ask in the appropriate channels.
