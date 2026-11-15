# Developing and Releasing Sync Scripts

This page covers the `pmd` commands for sync scripts, how to test a script with two browsers, how versions work, and how releases and rollbacks are done.

## CLI Commands

| Command                                              | What it does                                                                                                                                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx pmd sync-new [service]`                         | Creates `syncScripts/<service>/` with a `metadata.json` (version `1.0.0`) and a starter `content.ts`.                                                                                                           |
| `npx pmd sync-dev [service]`                         | Type checks and rebuilds on every change, with inline source maps, and sends the script to every browser with Activity Developer Mode on, the same way `pmd dev` sends activities.                              |
| `npx pmd sync-build [service] [--all] [--validate]`  | Validates the metadata of every sync script, then type checks and builds `dist/` without source maps. `--validate` also checks that every changed script raised its version. `--zip` zips the build.            |
| `npx pmd sync-release [service] [--changed] [--all]` | Builds and uploads scripts to the API. `--changed` uploads the scripts changed since the base commit and deletes the services that were removed or renamed; `--all` uploads every script. CI runs this for you. |
| `npx pmd sync-keygen`                                | Prints a new Ed25519 key pair for signing releases. See [Signing](#signing).                                                                                                                                    |

The Validate workflow runs `pmd sync-build --all --validate` and the pmd test suite on every pull request.

## Testing without a Party

While `npx pmd sync-dev <service>` runs, you can try the script on a real page without starting a party:

1. Turn on Activity Developer Mode and make sure no party is running in that browser.
2. Run `npx pmd sync-dev <service>` and open a page that matches the script's `regExp`. The extension runs the dev script there as the controller and host, and the terminal prints `solo mode on as controller` with the tab.
3. Use the player. The terminal prints what the script reports: play, pause, seek and rate events, the playback state when it changes (or every five seconds), ads, buffering, page info, blocks and errors. Nothing goes to a party server.
4. Type commands into the same terminal to drive the script the way a party would:

| Command           | What it does                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `controller`      | The script plays the video itself and reports it. This is the default.                       |
| `follower`        | The script becomes a follower and gets the commands below.                                   |
| `play [seconds]`  | Plays. With a time it arrives like a playing host's heartbeat, so drift correction runs too. |
| `pause [seconds]` | Pauses, and seeks there if a time is given and the video is elsewhere.                       |
| `seek <seconds>`  | Seeks.                                                                                       |
| `rate <rate>`     | Sets the playback rate.                                                                      |
| `help`            | Lists the commands.                                                                          |

Playback commands only go to a follower. A follower that uses `ctx.video.attach()` reports nothing back, so watch the page to see the result.

Solo mode stops when `pmd sync-dev` stops, Developer Mode is turned off, the page stops matching, or you start or join a party; the party then runs the script as usual. Ending the party brings solo mode back, and the dev script stays loaded as long as `pmd sync-dev` runs. Solo mode needs a version of the extension that supports it; older ones ignore the commands.

Solo mode is a quick check, not a replacement for testing with two browsers.

### Logs in the terminal

Every `ctx.log` call of the dev script, and every error the runtime catches from it (a throwing `setup`, `onSyncCommand` handler and so on), shows in the `pmd sync-dev` terminal with the service and tab, in solo mode and in a party alike. The page's console still gets the logs, and the same limit of 50 per 10 seconds applies. Released scripts never send anything to pmd.

## Testing with Two Browsers

A sync script only shows its problems with a second person in the party, so always test with two clients:

1. Use two browsers or two browser profiles, each with the extension, Activity Developer Mode on, and a different Discord account. If the site needs an account, log in to it in both.
2. Run `npx pmd sync-dev <service>`. Every connected browser gets the dev script, and gets it again on each rebuild.
3. Start a party in one browser and join it from the other.
4. Go through the checklist in the pull request template: play, pause, seek, an episode change, an ad and buffering, leaving and rejoining, and, where the site has them, an account with ads and one without.

Test on an extension older than 2.15 as well when you can. Those extensions don't have `ctx.runtime`, `ctx.log` or `features({ fallback })`, and the script has to work without them.

## Versioning

Every script has a semver `version` in its `metadata.json`. Raise it in every pull request that changes anything in the script's folder, `metadata.json` included; `pmd sync-build --validate` fails otherwise. The API also refuses an upload whose version is not higher than the one it has, unless the content is identical, so re-running a release is safe.

Set `minExtensionVersion` only when the script cannot work on older extensions. Those extensions then skip it, and their users get PreMiD's own video detection instead. Prefer feature detection over a minimum version:

<!-- eslint-skip -->

```typescript
if (typeof ctx.log === 'function')
  ctx.log('Player API changed')
```

To test for a newer feature without checking a version, look at the runtime's capabilities (`ctx.runtime` is missing on older extensions):

<!-- eslint-skip -->

```typescript
if (ctx.runtime?.capabilities.includes('hostChange'))
  ctx.party.onHostChange?.(isHost => updateControls(isHost))
```

The capability names are listed in the [Sync Script Context reference](/v1/api/sync-script-context#runtime).

Extensions before 2.15 ignore `version` and `minExtensionVersion`, so a script must never rely on a minimum version to stay off them.

## Releasing

Merging to `main` releases the changed sync scripts. The Release workflow runs `pmd sync-release --changed` as its own step, after the activities and even when the activities step failed. A script that fails to build is reported and the others are still released; the step fails at the end if any script failed.

To upload every script again, run the Release workflow by hand (workflow dispatch), which runs `pmd sync-release --all`.

A release deletes the services the base commit had and the current commit doesn't, so renaming a folder or a service removes the old entry. A service that is already gone counts as deleted.

### Signing

When the `SYNC_SCRIPT_SIGNING_KEY` repository secret is set, every upload is signed with Ed25519 and the extension refuses scripts whose signature does not match. To set it up:

1. Run `npx pmd sync-keygen` on a trusted machine.
2. Store `SYNC_SCRIPT_SIGNING_KEY` as an Activities repository secret, `SYNC_SCRIPT_SIGNING_PUBLIC_KEY` in the API environment and `VITE_SYNC_SCRIPT_PUBLIC_KEY` in the extension build.
3. Never commit the private key or paste it anywhere else.

## Rollback

When a released script breaks parties:

1. **Roll back on the API.** An admin calls `POST /v6/sync-scripts/v1/{service}/rollback` with the admin API key. Without a body it restores the previous version; with `{"sha256": "..."}` it restores that one. `GET /v6/sync-scripts/v1/{service}/versions` lists the stored versions. Extensions pick the restored script up on their next discovery refresh.
2. **Fix forward in the repository.** Revert or fix the change in a pull request with a version higher than the broken one, and merge it. Releasing the old code again from a tag only works if its version is raised too, since the API refuses lower versions; use the rollback endpoint for that instead.
