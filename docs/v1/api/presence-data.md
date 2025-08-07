# PresenceData Interface

The `PresenceData` interface defines the structure of the data that is sent to Discord to display in the user's status. It allows you to customize what information is shown in the Discord Rich Presence.

## Structure

The `PresenceData` interface is a union of two interfaces:

- `MediaPresenceData`: For activities related to media (watching or listening)
- `NonMediaPresenceData`: For other types of activities

Both extend the `BasePresenceData` interface, which contains the common properties.

## Properties

### Common Properties (BasePresenceData)

| Property         | Type                                         | Description                                                         |
| ---------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| `name`           | `string`                                     | Name to show in activity (e.g., "YouTube")                          |
| `type`           | `ActivityType`                               | Type of activity (Playing, Listening, Watching, Competing)          |
| `details`        | `string \| Node \| null`                     | Top row of the status                                               |
| `state`          | `string \| Node \| null`                     | Bottom row of the status                                            |
| `startTimestamp` | `number \| Date \| null`                     | Timestamp for the start of the activity (shows time as "elapsed")   |
| `endTimestamp`   | `number \| Date \| null`                     | Timestamp until the end of the activity (shows time as "remaining") |
| `largeImageKey`  | `string \| Blob \| HTMLImageElement \| null` | Large profile artwork. Preferably a direct URL to an image (e.g., `https://example.com/logo.png`) |
| `smallImageKey`  | `string \| Blob \| HTMLImageElement \| null` | Small profile artwork. Preferably a direct URL to an image (e.g., `https://example.com/icon.png`) |
| `smallImageText` | `string \| Node \| null`                     | Tooltip for the smallImageKey                                       |
| `buttons`        | `[ButtonData, ButtonData?]`                  | Array of buttons (max 2)                                            |

### Media-Specific Properties (MediaPresenceData)

| Property         | Type                                              | Description                          |
| ---------------- | ------------------------------------------------- | ------------------------------------ |
| `type`           | `ActivityType.Listening \| ActivityType.Watching` | Must be either Listening or Watching |
| `largeImageText` | `string \| Node \| null`                          | Tooltip for the largeImageKey        |

### Non-Media Properties (NonMediaPresenceData)

| Property         | Type                                                                     | Description                          |
| ---------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| `type`           | `Exclude<ActivityType, ActivityType.Listening \| ActivityType.Watching>` | Cannot be Listening or Watching      |
| `largeImageText` | `never`                                                                  | Not allowed for non-media activities |

## ButtonData Interface

The `ButtonData` interface defines the structure of buttons that can be added to the presence.

| Property | Type                                  | Description         |
| -------- | ------------------------------------- | ------------------- |
| `label`  | `string \| Node \| null`              | Text for the button |
| `url`    | `string \| HTMLAnchorElement \| null` | URL of button link  |

## ActivityType Enum

The `ActivityType` enum defines the types of activities that can be displayed.

| Value       | Description                    | Example                     |
| ----------- | ------------------------------ | --------------------------- |
| `Playing`   | Shows as "Playing [name]"      | "Playing Minecraft"         |
| `Listening` | Shows as "Listening to [name]" | "Listening to Spotify"      |
| `Watching`  | Shows as "Watching [name]"     | "Watching YouTube"          |
| `Competing` | Shows as "Competing in [name]" | "Competing in a tournament" |

## Examples

### Basic Presence

```typescript
const presenceData: PresenceData = {
  details: 'Browsing the homepage',
  state: 'Reading articles',
  largeImageKey: 'https://example.com/logo.png',
  startTimestamp: Date.now()
}
```

### Media Presence (Watching)

```typescript
const presenceData: PresenceData = {
  type: ActivityType.Watching,
  details: 'Watching a video',
  state: 'Video Title',
  largeImageKey: 'https://example.com/logo.png',
  largeImageText: 'Website Name',
  startTimestamp: Date.now(),
  endTimestamp: Date.now() + 360000 // 6 minutes from now
}
```

### Presence with Buttons

```typescript
const presenceData: PresenceData = {
  details: 'Reading an article',
  state: 'Article Title',
  largeImageKey: 'https://example.com/logo.png',
  buttons: [
    {
      label: 'Read Article',
      url: 'https://example.com/article'
    },
    {
      label: 'Visit Website',
      url: 'https://example.com'
    }
  ]
}
```

## Notes

- The `details` and `state` fields have a maximum length of 128 characters.
- Button labels have a maximum length of 32 characters.
- Button URLs must be valid HTTPS URLs.
- You can have a maximum of 2 buttons.
- The `startTimestamp` and `endTimestamp` can be provided as either a Unix timestamp in milliseconds or a Date object.
- If both `startTimestamp` and `endTimestamp` are provided, only the `endTimestamp` will be used to show "remaining" time.
