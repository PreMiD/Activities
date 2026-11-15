# Watch Party Sync Scripts

Sync scripts let activities integrate with PreMiD's Watch Party feature. When a user starts or joins a Watch Party, the sync script takes over video playback synchronization, cursor sharing, and scroll mirroring for the supported site.

Sync scripts currently ship for YouTube (including YouTube Music), Netflix and Disney+. On every other site Watch Party falls back to PreMiD's own video detection, which also finds videos inside iframes, so a sync script is only needed when a site's player needs special handling.

::: warning Sync scripts are separate from presence scripts
Sync scripts are a **completely independent system** from presence/activity scripts. They don't share code, lifecycle, or context:

- **Presence scripts** use the `Presence` class, fire on `UpdateData`, and set Discord Rich Presence data
- **Sync scripts** use `SyncScript.register()`, activate only when a Watch Party is running, and control video playback synchronization

A site can have a presence script without a sync script (most do), a sync script without a presence script, or both. They are separate files with separate APIs — the only connection is that they run on the same site.
:::

## Project Structure

Sync scripts live in a separate `syncScripts/` directory at the repository root, independent from the activity's `websites/` directory:

```
syncScripts/
└── YouTube/
    ├── metadata.json   # Sync script metadata
    ├── content.ts      # Main sync script (required)
    └── mainworld.ts    # Mainworld sync script (optional)
```

This is separate from the activity's presence script, which lives in `websites/Y/YouTube/`.

### Sync Script metadata.json

The sync script's `metadata.json` defines which URLs the script should run on:

```json
{
  "service": "YouTube",
  "regExp": "^https?[:][/][/](www|m|music)[.]youtube[.]com[/](?!shorts[/])",
  "version": "1.0.0"
}
```

| Property              | Type     | Required | Description                                                                                                                                          |
| --------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `service`             | `string` | Yes      | A unique identifier for the service, equal to the folder name. Used for [regional domain matching](/v1/guide/watch-party-behavior#desync-detection). |
| `regExp`              | `string` | Yes      | A regular expression pattern that matches the URLs where the content script should activate.                                                         |
| `version`             | `string` | Yes      | The script's semver version. Raise it with every change, see [Versioning](/v1/guide/watch-party-workflow#versioning).                                |
| `minExtensionVersion` | `string` | No       | The oldest extension version the script works on. Older extensions skip it.                                                                          |

The `regExp` must pass the extension's checks, which `pmd sync-build` runs too: at most 1000 characters, compiles in JavaScript, no line breaks, and no group with `+` or `*` inside that is itself repeated with `+` or `*`. Extensions before 2.15 are stricter than newer ones and reject even the common subdomain pattern `([a-z0-9-]+[.])*`; since they validate the whole list at once, one such script would turn off every sync script for them. Write `([a-z0-9-]{1,63}[.])?` instead.

::: tip
The `service` field is important for regional domain matching during desync detection. If a site has multiple regional domains (e.g., `anime-site.jp` and `anime-site.com`), use the same `service` value for both so the extension knows they're the same site.
:::

### Script Files

| File           | Context                          | Purpose                                                                                                  |
| -------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `content.ts`   | Content script (page DOM access) | Main sync script — registers via `SyncScript.register()`                                                 |
| `mainworld.ts` | Page's JavaScript context        | Access page globals (e.g., `window.player`) and the DOM — registers via `SyncMainworldScript.register()` |

Sync scripts run in the top frame of the page only. A video that lives in an iframe is not reachable from a sync script, and while a sync script manages the page PreMiD's own iframe video detection is switched off.

## Quick Start

A minimal sync script that synchronizes a `<video>` element:

<!-- eslint-skip -->

```typescript
SyncScript.register({
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

Sync scripts register via `SyncScript.register()`:

<!-- eslint-skip -->

```typescript
SyncScript.register({
  setup(ctx) {
    // Called when a Watch Party activates on this tab
    // Return a cleanup function (or nothing)
    return () => {
      // Called when the party ends or the tab is no longer active
    }
  },

  onNavigate(ctx, url) {
    // Called when the page address changes, once per address
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
4. **Controller navigation** — When the controller's page address changes (including SPA navigation), the script is deactivated and activated again, so `setup` runs again.
5. **Reconnect** — After a WebSocket reconnect, the extension re-sends the activation message with the current role and pause state. If the script is already active, it updates the role/pause state without re-running `setup`.

### When Does the Cleanup Function Run?

The cleanup function (returned from `setup`) runs when:

1. **Party ends** — The host ends the party, or the user leaves
2. **Tab switch** — The controller moves the party to a different tab (the old tab's script gets deactivated)
3. **No matching sync script** — The user navigates to a URL that doesn't match any sync script's pattern (the extension sends a deactivate message)
4. **Controller navigation** — Right before `setup` runs again for the new address
5. **Page navigation** — On full page navigations (not SPA), the content script is destroyed entirely, which also runs cleanup

### When Does `onNavigate` Fire?

`onNavigate(ctx, url)` fires once per address when:

1. **The controller navigates** — It fires on the controller itself and, when the controller's navigation arrives, on followers.
2. **A follower navigates in the page on their own** — For example a single-page app switching episodes.

On a follower, the call comes as the tab starts moving, not after the new page has loaded. The tab is usually reloaded right after, which runs `setup` again on the new page, so find and attach to the video element in `setup`. If the follower is asked before leaving for another site and stays, `onNavigate` has still fired.

Extensions before 2.15 only call it on a follower when the controller's navigation arrives, so don't rely on it for the controller or for a follower's own navigation.

::: warning
`onNavigate` only fires while the sync script is active (i.e., a Watch Party is running). It is not a general-purpose navigation listener.
:::

## What's Next

- [Video Sync](/v1/guide/watch-party-video) — Auto and manual video synchronization modes
- [Advanced Features](/v1/guide/watch-party-advanced) — Mainworld communication, custom data, party state
- [Sync Behavior](/v1/guide/watch-party-behavior) — How drift correction, desync detection, and ad coordination work
- [Watch Party Example](/v1/examples/watch-party) — Complete working examples
- [Developing and Releasing](/v1/guide/watch-party-workflow) — The CLI commands, testing with two browsers, versioning and the release runbook
