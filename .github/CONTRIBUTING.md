<div align="center">
    <img src="https://github.com/PreMiD.png?size=2048" width="128px" style="max-width:100%;">
    <h3 style="font-size: 2rem; margin-bottom: 0">Activity Guidelines</h3>
    <h4 style="margin-top: 0">Revision 3.2</h4>
    <br />
</div>

# Guidelines

When publishing Activities to this GitHub, we require you to follow a set of guidelines. To some, these strict rules may seem harsh. However, the implementation of these rulesets will keep us and the users from running into any issues.

# Creation

The general rules of activity development are as follows:

- Activities **must** be related to the website of choice.
- Activities **cannot** be made for illegal websites. (for e.g., stressors, drug marketing, child pornography, etc.)
- Activities **cannot** be made for services featuring mainly explicit content.
  - If the service has some explicit content, the activity must avoid displaying it.
- The file structure must be clean and managed, do not include files which are not specified. (for e.g., vscode and git folders, image and text files, etc.)
- Activities for websites with (`.onion` TLDs) or websites with free domains/hosts (for e.g., `.TK` [all free Freenom domains], `.RF`, `GD`, etc) are **not** permitted, exceptions can be made if a proof is presented showing that they paid for the domain.
- The domain of the activity must be at least 2 months old.
- Activity that target internal browser pages (like Chrome Web Store, `chrome://`, `about:` pages, etc) are **not** allowed as they require an experimental flag to be enabled on the user's end and could potentially cause damage to their browsers.
- Activities with support for only a single subdomain will **not** be permitted, as they may seem broken for other pages (like the homepage), exceptions can be made for the policy and contact pages (content that isn't used often) or sites where the other content is unrelated. (for e.g., wikia pages)
- Activities for online radios are only allowed if the radio has at least 100 weekly listeners and 15 concurrent and must have some features other than just showing album/song title, etc.
- Activities are not allowed to run JS code with their own function to get variables. If there are issues with the built-in functions inside the `Activity` class, you are allowed to do your own function and you need to tell us about it in Pull Request description.
- Low quality activities (or ones with little context) are **not** allowed (for e.g., only showing a logo and text but never changing it again).
- Activities for services like Discord Bot/Server Lists must follow these extra requirements:
  - The domain should be at least **6 months** old.
  - Unique visitors per day:
    - For 6 to 12 month old domains: **20,000 unique visitors/day**.
    - For 12+ month old domains: **45,000 unique visitors/day**.
  - The website can't be on a cheap domain like `.xyz`, `.club` and so on.
  - The website itself must have a very good quality, design, etc.
- Activities should use [common details](https://github.com/PreMiD/Localization/blob/17439510645afbc123aaf655e0fa02f8a947fe72/src/Presence/general.json) (strings starting with "general."). You can achieve this using `multiLanguage` with the provided strings. If your activity requires custom strings, then you shouldn't use `multiLanguage` until the activity gets 1000 users. You can find an example [here](https://docs.premid.app/dev/presence/class#getstringsobject).
- Including the `presence.ts` file, `iframe.ts` file, and `metadata.json` file is mandatory so the result would be what is represented in the following schema:

```bash
activity
├── metadata.json
└── presence.ts
```

or if you're using a `iframe.ts` file:

```bash
activity
├── metadata.json
├── presence.ts
└── iframe.ts
```

## [**metadata.json**](https://docs.premid.app/dev/presence/metadata)

> For the convenience of our activity developers, we have provided a schema which you can use to validate the integrity of your `metadata` file. This is entirely optional and is not required during the review process.

> It is highly recommended that you organize your `metadata` file in the format shown below, and you must have grammatically correct service names, descriptions, tags, and setting fields. Anything not organized to specifications will **not** be permitted.

Each activity has a descriptor file called `metadata.json`, the metadata has a strict standard and an example of this file can be seem below:

```json
{
  "$schema": "https://schemas.premid.app/metadata/1.15",
  "apiVersion": 1,
  "author": {
    "name": "USER",
    "id": "000000000000000000"
  },
  "contributors": [
    {
      "name": "USER",
      "id": "000000000000000000"
    }
  ],
  "service": "SERVICE",
  "altnames": ["SERVICE"],
  "description": {
    "en": "DESCRIPTION"
  },
  "url": "example.com",
  "regExp": "REGEXP",
  "version": "1.0.0",
  "logo": "https://i.imgur.com/000000.png",
  "thumbnail": "https://i.imgur.com/000000.png",
  "color": "#000000",
  "category": "other",
  "tags": ["tag1", "tag2"],
  "iframe": false,
  "iFrameRegExp": "REGEXP",
  "readLogs": false,
  "settings": [
    {
      "id": "multiLanguage",
      "multiLanguage": true
    },
    {
      "id": "ID",
      "title": "DISPLAY TITLE",
      "icon": "fa-solid fa-check",
      "value": true
    },
    {
      "id": "ID",
      "if": {
        "ID": true
      },
      "title": "DISPLAY TITLE",
      "icon": "fa-solid fa-check",
      "value": "\"%song%\" by %artist%",
      "placeholder": "use %song% or %artist%"
    },
    {
      "id": "ID",
      "title": "DISPLAY TITLE",
      "icon": "fa-solid fa-check",
      "value": 0,
      "values": ["1", "2", "etc."]
    }
  ]
}
```

> If a field is listed as optional on the [documentation](https://docs.premid.app/dev/presence/metadata) or there is a `*` next to the key, and your activity uses the default value for it, do not include it in the `metadata` file. (for e.g., a activity without iframe support would not need the `iframe` field.)

> All images in the `metadata` file must be hosted on `i.imgur.com`. Using content hosted on the website is **not** permitted as they can change the paths and files unwillingly.

A list of fields and their rules are listed below:

### **`$schema`**

- The schema _key_ **must** include a dollar sign at the beginning of it, this will signal your text editor that you want to validate your JSON file against a model. _As stated earlier, you do not need to include a schema, but if you include it you must take this into account._

### **`*apiVersion`**

- The Activity System version this activity was made for. This is **not** the same as the version field in the metadata. This field is **required** for all activities.

### **`author`**

- The ID _value_ **must** be your Discord snowflake ID. You can get it by enabling [developer mode](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-). _Please do **not** confuse this with your application ID, which is only for your activity._

### **`*contributors`**

- Do **not** add yourself as a contributor, and do not add someone else as a contributor unless they have helped with the activity.

### **`service`**

- The service name **must** be the name of the activity directory. For example, if the activity is located at `/websites/Y/YouTube/`, the service name must be `YouTube`.
- You **cannot** use the url as the service name unless the website uses the url as its official name. If the name is not descriptive and can be considered vague, using the url is **required**. (for e.g., `YouTube` is permitted because that is the official name and is descriptive, while `youtube.com` is not. `Top` is a non-descriptive name, so using the url `top.gg` is **required**.)
- If service has some explicit branding rules of their name, you should follow them.

### **`*altnames`**

- **Only** use this in scenarios where a website goes under multiple official names (e.g. Pokémon and 포켓몬스터). _Shortened_ versions of service names go under `tags`.

### **`description`**

- **All** activities are **required** to have an English description regardless of the website's preferred language.
- Do **not** try and translate the description yourself unless you know that language, translators will modify your `metadata.json` and change the descriptions if necessary.

### **`url`**

- The url **must** be a string if the website only uses one domain. If the website uses multiple, make this an array and specify each one.
- Do **not** include protocols in the url (for e.g., `http` or `https`), and do not include query parameters in the url (for e.g., `www.google.com/search?gws_rd=ssl` which should be `www.google.com`)

### **`version`**

- Always make sure the version number follows [semantic versioning standards](https://semver.org), which translates to the following scheme: `<NEW-FEATURE>.<HUGE-BUGFIX>.<SMALL-BUGFIX-OR-METADATA-CHANGES>`. Anything else like `1.0.0.1`, `1.0`, `1`, `1.0.0-BETA` or changing `1.0.0` to `2.0.0` on a bug fix/small change is **not** permitted.
- The version **must** always start at `1.0.0` unless told otherwise, other versions will **not** be permitted.

### **`logo`**

- The logo **must** be a square image with a `1:1` aspect ratio.
- The image is **required** to have a resolution of `512x512` pixels. You can upsize it using a tool like [waifu2x](http://waifu2x.udp.jp/).

### **`thumbnail`**

- The thumbnail **should** preferably be a [wide promotional card](https://i.imgur.com/3QfIc5v.jpg) or a [screenshot](https://i.imgur.com/OAcBmwW.png) if the first is **not** available.

### **`color`**

- The color **must** be a hexadecimal value between `#000000` and `#FFFFFF`.
- The color string **must** be prepended with a hash symbol.

### **`tags`**

- **All** activities are required to have at least _one_ tag.
- Tags must **not** include any spaces, slashes, single/double quotation marks, Unicode characters, and should always be lowercase.
- Tags **should** preferably include alternate service names to make searching easier (for e.g., if an Amazon activity had included AWS support, it would have its tags like `amazon-web-services` and `aws`)

### **`category`**

- The category **must** be one of the following listed on the [documentation](https://docs.premid.app/dev/presence/metadata#presence-categories).
- The activity must use a category that matches the content of the website. (for e.g., don't use `anime` when the website isn't related to anime).

### **`*regExp`** <br /> **`*iFrameRegExp`**

- Regular expressions **must** be valid. Please test your expressions with the tools listed on the [documentation](https://docs.premid.app/dev/presence/metadata#testing).

### **`readLogs`**

- Must be `boolean` value (e.g. `true` or `false`).
- Enables logs for your activity.

### **`warning`**

- Enables warning icon for prompting user that this activity needs more steps than only adding activity.
- Example of activity using this metadata variable is `VLC`.

### **`settings`**

- If you decide to make a format string (for e.g., `%song% by %artist%`), you must have the variables surrounded by a percent sign on either side. Variables like `%var`, `var%`, or `%%var%%` and anything in between are **not** permitted for the sake of standardization.
- The name of the settings must **not** be in all capital letters. For example, names such as `SHOW BROWSING STATUS` will **not** be permitted; however, names such as `Show Browsing Status` or `Show browsing status` are permitted.
- If you are using the `multiLanguage` option it can have the following types:
  - **True** type which will only enable strings from [`general.json`](https://github.com/PreMiD/Localization/blob/master/src/Presence/general.json) from the Localization repo or from the activity file (e.g. when the name of the activity is YouTube, the extension will get strings from `youtube.json` too.)

## [**presence.ts**](https://docs.premid.app/dev/presence/class)

> The code you write **must** be _well-written_ and **must** be _readable_ and all strings must be grammatically correct (grammar errors on websites can be ignored).

> Each activity follows a strict linting ruleset which will be checked during the review process. A couple of recommendations can be seen below. [TypeScript Plugin Recommendations for Strict Type Checking](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/docs/rules). [ESlint Recommendations](https://eslint.org/docs/rules). [Prettier](https://prettier.io/).

Here is a list of rules you must follow when writing your `presence.ts` file:

- **Preferably** declare a new instance of the `Activity` class before any other variable to avoid rare issues that may occur.
- **Always** use `document.location` to get current location information rather than `window.location` or `location`.
- All assets **must** have a resolution of `512x512` pixels. You can upsize it using a tool like [waifu2x](http://waifu2x.udp.jp/).
- **Never** use custom functions when [native variants are available](https://docs.premid.app/dev/presence#files-explained); this makes sure fixes on the extension level also apply to your activities. You're free to use whatever you need if you do not find them listed in the docs.
- It is **forbidden** to code activities for a site without adding support to its primary language (for e.g., a YouTube activity coded with support only for Portuguese and Japanese, but not English itself.)
- The `smallImageKey` and `smallImageText` fields are intended to provide additional/secondary context (such as `playing/paused` for video sites, `browsing` for regular sites, and other cases) not to promote Discord profiles or anything unrelated to PreMiD.
- When accessing cookies for stored data, please prefix the key with `PMD_`.
- You may only make HTTP/HTTPS requests to `premid.app` or the activity website API. If you are using external domains, you will be required to explain why it is necessary. The only allowed API to make requests is the [`Fetch API`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
- Do **not** set fields in the activityData object to `undefined` or other null-like values after it has been declared, use the `delete` keyword instead. (for e.g., use `delete data.startTimestamp` instead of `data.startTimestamp = undefined`)
- You are **not** allowed to write activities that change the functionality of a given website. This includes the addition, deletion, or modification of DOM elements.
- Services which contain some explicit content should avoid displaying it in the activity. For example, use generic text when explicit warnings or tags are available.
- If the service is very complex, consider separating the code into multiple files.
- Activities that use buttons should follow extra requirements:
  - Redirects to main page are prohibited.
  - Promoting websites by them is prohibited.
  - They can't display information you couldn't fit in other fields.
  - Redirecting directly to audio/video stream is prohibited.

## Modification

> You **must** change the version in the **metadata** to be a higher value from the previous version when making changes to either the **presence.ts**, **iframe.ts** or **metadata.json**.

In some situations, activities may behave unexpectedly or could use some minor changes to improve their functionality. Here is a list of rules that you **must** follow while modifiying activities.

- If you make modifications to a activity and change at least a **quarter** of the activity's codebase, you are allowed to add yourself as a contributor. Contact a reviewer for more information about this subject.
- Anyone may create PRs to fix bugs. Do **not** change images if they are not outdated and are in specifications.

# Verification

> **All** code contributed to the store will be licensed under the `Mozilla Public License 2.0`.

> If you need to contact someone, please use our official Discord server. All reviewers will have the `Reviewer` role on their profile.

> Please keep in mind that the reviewers work voluntarily and manage other repositories in addition to this one, your pull request may not get reviewed until hours or even days after it has been created.

> **Always** have an up-to-date fork before creating your pull request. This will help limit false positives from the checks.

The most important process of activity development is getting your activity on the store. This is done by making a [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request) on GitHub on the `PreMiD/Activities` repository. Our reviewers will confirm that your activity is up to standards and will push it onto the store.

<div>
  <h2 style="font-size: 2rem; margin-bottom: 0;">Activity Reviewers</h2>
  <a href="https://github.com/Bas950"><img src="https://github.com/Bas950.png?size=2048" title="Bas950" width="48px" style="max-width:100%; border-radius: 50%;"/></a> <a href="https://github.com/theusaf"><img src="https://github.com/theusaf.png?size=2048" title="theusaf" width="48px" style="max-width:100%; border-radius: 50%;"/></a> <a href="https://github.com/Timeraa"><img src="https://github.com/Timeraa.png?size=2048" title="Timeraa" width="48px" style="max-width:100%; border-radius: 50%;"/></a>
  <br />
</div>

## `Restrictions`

Repetitive offenses such as breaking guidelines, spamming pull requests, threats, or innapropriate behavior will get you banned from creating activities.

In this scenario, the following changes will occur:

- Activities under your management will be transferred to the PreMiD bot or another user (reviewer decision). The application id for each activity will be recreated under the new owner's name.
- All of your issues and pull requests (activity creation, activity contribution, etc) created following the ban will be prompty closed.
- Tickets created under your name regarding activity development will be deleted.

## `Reviewing`

A few things you should know after opening a pull request:

- It takes 2 reviewers to merge a pull request.
- If a pull request is inactive for a period of 7 days, it will be promptly closed.
- All checks **must** be passed in order to merge.
- ⚠️ You **must** provide new, unaltered screenshots (taken by you) showing a side-by-side comparison of your profile and the website to prove that your activity works. _You are allowed to stitch screenshots together for viewing pleasure_ This applies for both creation and modification.
- ⚠️ You are also **required** to include screenshots of the activity settings in the extension if supplied. An example can be seen [here](https://imgur.com/a/OD3sj5R).

## `Checks`

![Example of checks](https://i.imgur.com/vzz6axm.png)

Currently, a activity goes through 3 separate stages of checks. All of these checks help the reviewers determine whether your activity is suitable for deployment.

- `DeepScan` is a bot that checks for code quality. If you ever receive errors for new issues, you are **required** to fix them. _Warning: DeepScan doesn't always give you errors. Please look at CodeFactor warnings instead._
- `Compile and Lint` checks for code quality. If you ever receive errors for new issues, you are **required** to fix them.
- `Activity Validator` will scan your `metadata.json` file for any errors (for e.g., missing fields, invalid value types, etc.). If you ever see any new issues, you are also **required** to fix those. Adding a schema field to your `metadata.json` file will allow your text editor (if supported) to show you these errors during development.

## `Additional Rules`

- **Always** make sure to start your activity in the most appropriate folder, if its name starts with _any_ Latin letter then it must be under its alphabetical match (for e.g., `D/dアニメストア` or `G/Google`). Any other Unicode/non-Latin characters **must** be under the `#` folder (for e.g., `#/巴哈姆特`) and numbers under the `0-9` folder (for e.g., `0-9/4anime`).

After meeting all of the guidelines with the proper reviews and checks, your activity will be merged with the store.

# Suggestions

If you have some suggestions about our guidelines, you should contact us @ [PreMiD's Discord server](https://discord.premid.app) and we will check them!

# Contributions

`Revision 3` of the guidelines was written and was contributed to by the following individuals:

<div>
<a href="https://github.com/PreMiD"><img src="https://github.com/PreMiD.png?size=2048" width="48px" style="max-width:100%; border-radius: 50%;"/></a>
</div>

`Revision 2` of the guidelines was written and was contributed to by the following individuals:

<div>
<a href="https://github.com/CobyPowers"><img src="https://github.com/CobyPowers.png?size=2048" width="48px" style="max-width:100%; border-radius: 50%;"/></a>
</div>

`Revision 1` was maintained by the following individuals:

<div>
<a href="https://github.com/CobyPowers"><img src="https://github.com/CobyPowers.png?size=2048" width="48px" style="max-width:100%; border-radius: 50%;"/></a>
<a href="https://github.com/Bas950"><img src="https://github.com/Bas950.png?size=2048" width="48px" style="max-width:100%; border-radius: 50%;"/></a>
<a href="https://github.com/i1u5"><img src="https://github.com/i1u5.png?size=2048" width="48px" style="max-width:100%; border-radius: 50%;"/></a>
</div>
