# Watch Party Sync Scripts

Sync scripts let activities integrate with PreMiD's Watch Party feature. When a user starts or joins a Watch Party, the sync script takes over video playback synchronization, cursor sharing, and scroll mirroring for the supported site.

::: warning Sync scripts are separate from presence scripts
Sync scripts are a **completely independent system** from presence/activity scripts. They don't share code, lifecycle, or context:

- **Presence scripts** use the `Presence` class, fire on `UpdateData`, and set Discord Rich Presence data
- **Sync scripts** use `SyncScriptV1.register()`, activate only when a Watch Party is running, and control video playback synchronization

A site can have a presence script without a sync script (most do), a sync script without a presence script, or both. They are separate files with separate APIs — the only connection is that they run on the same site.
:::

## Project Structure

Sync scripts live in a separate `syncScripts/` directory at the repository root, independent from the activity's `websites/` directory:

```
syncScripts/
└── YouTube/
    ├── metadata.json   # Sync script metadata
    ├── content.ts      # Main sync script (required)
    ├── iframe.ts       # iFrame sync script (optional)
    └── mainworld.ts    # Mainworld sync script (optional)
```

This is separate from the activity's presence script, which lives in `websites/Y/YouTube/`.

### Sync Script metadata.json

The sync script's `metadata.json` defines which URLs the script should run on:

```json
{
  "service": "YouTube",
  "regExp": "^https?://([a-z0-9-]+\\.)*youtube\\.com/",
  "iframeRegExp": "^https?://([a-z0-9-]+\\.)*youtube\\.com/embed/"
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `service` | `string` | Yes | A unique identifier for the service. Used for [regional domain matching](/v1/guide/watch-party-behavior#desync-detection). |
| `regExp` | `string` | Yes | A regular expression pattern that matches the URLs where the content script should activate. |
| `iframeRegExp` | `string` | No | A regular expression pattern for iframes where the iframe script should be injected. Only needed if the site embeds video in iframes. |

::: tip
The `service` field is important for regional domain matching during desync detection. If a site has multiple regional domains (e.g., `anime-site.jp` and `anime-site.com`), use the same `service` value for both so the extension knows they're the same site.
:::

### Script Files

| File | Context | Purpose |
|------|---------|---------|
| `content.ts` | Content script (page DOM access) | Main sync script — registers via `SyncScriptV1.register()` |
| `iframe.ts` | iFrame content script | Runs inside matched iframes — registers via `SyncIframeScriptV1.register()` |
| `mainworld.ts` | Page's JavaScript context | Access page globals (e.g., `window.player`) — registers via `SyncMainworldScriptV1.register()` |

## Quick Start

A minimal sync script that synchronizes a `<video>` element:

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    ctx.features({ video: true })

    const handle = ctx.video.attach('video')

    ctx.setPageInfo({
      title: document.querySelector('.video-title')?.textContent ?? undefined,
    })

    return () => {
      handle.detach()
    }
  },
})
```

This is enough for sites with a standard HTML5 `<video>` element. The extension handles drift correction, play/pause sync, and seek alignment automatically.

## Registration and Lifecycle

Sync scripts register via `SyncScriptV1.register()`:

<!-- eslint-skip -->

```typescript
SyncScriptV1.register({
  setup(ctx) {
    // Called when a Watch Party activates on this tab
    // Return a cleanup function (or nothing)
    return () => {
      // Called when the party ends or the tab is no longer active
    }
  },

  onNavigate(ctx, url) {
    // Called when a follower receives a navigation URL from the controller
    // Use this to re-attach to new video elements after page transitions
  },
})
```

The `setup` function receives a [`SyncScriptContext`](/v1/api/sync-script-context) — the primary interface to the Watch Party system.

::: tip
Always return a cleanup function from `setup` to detach video handles, clear intervals, and remove event listeners. Leaked state causes bugs when parties end and restart.
:::

### When Does `setup` Run?

The extension calls `setup` (activates the sync script) when:

1. **Party creation** — The user creates a Watch Party while on a tab that matches the sync script's URL pattern. The extension injects and activates the script immediately.
2. **Party join** — The user joins a Watch Party and is navigated to the controller's URL. Once the tab loads, the script activates.
3. **Tab switch** — The controller moves the Watch Party to a different tab that matches the sync script. The old tab's script is deactivated, and the new tab's script is activated.
4. **Reconnect** — After a WebSocket reconnect, the extension re-sends the activation message with the current role and pause state. If the script is already active, it updates the role/pause state without re-running `setup`.

### When Does the Cleanup Function Run?

The cleanup function (returned from `setup`) runs when:

1. **Party ends** — The host ends the party, or the user leaves
2. **Tab switch** — The controller moves the party to a different tab (the old tab's script gets deactivated)
3. **No matching sync script** — The user navigates to a URL that doesn't match any sync script's pattern (the extension sends a deactivate message)
4. **Page navigation** — On full page navigations (not SPA), the content script is destroyed entirely, which also runs cleanup

### When Does `onNavigate` Fire?

`onNavigate` fires when:

1. **Follower receives a navigation URL** — The controller navigated to a new page, and the extension tells the sync script the new URL via `onNavigate(ctx, url)`. This fires **only on followers**, not the controller.
2. **The call happens after the tab has navigated** — By the time `onNavigate` fires, the DOM has already changed. Use it to find and attach to the new video element.

`onNavigate` does **not** fire for:
- The controller's own navigation (the controller drives navigation, it doesn't receive it)
- Full page loads (the entire script re-initializes via `setup` instead)
- Hash-only changes (e.g., `#section` anchors)

::: warning
`onNavigate` only fires while the sync script is active (i.e., a Watch Party is running). It is not a general-purpose navigation listener.
:::

## What's Next

- [Video Sync](/v1/guide/watch-party-video) — Auto and manual video synchronization modes
- [Advanced Features](/v1/guide/watch-party-advanced) — iFrame/mainworld communication, custom data, party state
- [Sync Behavior](/v1/guide/watch-party-behavior) — How drift correction, desync detection, and ad coordination work
- [Watch Party Example](/v1/examples/watch-party) — Complete working examples
