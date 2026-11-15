# MCP Server

`pmd mcp` runs a [Model Context Protocol](https://modelcontextprotocol.io) server that lets AI agents, such as Claude Code, create and test activities. The agent scaffolds the activity, edits `presence.ts`, opens pages in your browser, reads the presence the activity sets, and runs the tests you wrote.

The server does the same work as the `pmd` commands. Use it when you want an agent to drive that loop for you. For the tests themselves, see [Testing](/v1/guide/testing).

## Setup

1. Build the CLI from the root of the activities repository:

   ```bash
   cd cli && npm run build
   ```

2. Enable Activity Developer Mode in the PreMiD extension (see [Developer Tools](/v1/guide/developer-tools)).

3. Open the repository in your agent. Claude Code reads the project's `.mcp.json` automatically:

   ```json
   {
     "mcpServers": {
       "premid-activities": {
         "command": "node",
         "args": ["cli/dist/index.js", "mcp"]
       }
     }
   }
   ```

Other MCP clients can run the same command, `node cli/dist/index.js mcp`, from the repository root. The server talks over stdio.

## Tools

### Project Tools

These tools don't need the browser.

| Tool              | Inputs                                                                                             | Returns                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `list_activities` | `query` (optional): case-insensitive substring of the service name                                 | An array of `{ service, folder, url, version }`                                                       |
| `create_activity` | `service`, `url`, `regExp`, `category`, `tags`, `authorId`, `authorName`, `description` (optional) | `{ folder, files }` for the new `metadata.json`, `tsconfig.json` and `presence.ts`                    |
| `build_activity`  | `service`, `validate` (default `true`)                                                             | `{ success, output }` from `pmd build`, including the metadata and asset checks when `validate` is on |

### Browser Tools

These tools use the PreMiD extension in your browser. Call `extension_status` before the others.

| Tool               | Inputs                                                             | Returns                                                                                                |
| ------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `extension_status` | none                                                               | `{ connected, supportsTests }`                                                                         |
| `load_activity`    | `service`                                                          | `{ loaded }`. Builds the activity and sends it to the extension. Loading another activity replaces it. |
| `open_page`        | `service`, `url`, `settings` (optional)                            | `{ tabId }` for a new tab running the loaded activity                                                  |
| `navigate`         | `tabId`, `url`                                                     | `{ ok: true }`                                                                                         |
| `evaluate`         | `tabId`, `code`: function source, such as `"() => document.title"` | `{ value }` with the function's result                                                                 |
| `get_activity`     | `tabId`, `timeoutMs` (default `5000`)                              | `{ kind, activity }`. Returns the buffered update, or waits up to `timeoutMs` for the next one.        |
| `close_page`       | `tabId`                                                            | `{ ok: true }`                                                                                         |
| `run_tests`        | `service`                                                          | A list of test results, each with `file`, `name`, `status`, `durationMs`, `error` and `lastActivity`   |

`get_activity` returns one of these `kind` values:

| `kind`           | `activity`                         | Meaning                                                                                                                                                                      |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setActivity`    | The presence data the activity set | The activity updated its presence                                                                                                                                            |
| `clearActivity`  | `null`                             | The activity cleared its presence                                                                                                                                            |
| `invalid`        | `null`                             | An error event. The `error` field has the message.                                                                                                                           |
| `error`          | `null`                             | An error event. The `error` field has the message.                                                                                                                           |
| `waitingForUser` | `null`                             | The tab is on a page the activity doesn't match, such as a consent or login page. The `url` field has the page. Finish there in the browser, then call `get_activity` again. |
| `none`           | `null`                             | No update arrived before `timeoutMs` ran out                                                                                                                                 |

## Typical Workflow

For a new activity, an agent usually follows this loop:

1. `list_activities` to check that the service doesn't exist yet, then `create_activity`.
2. Edit `presence.ts` in the returned folder.
3. `load_activity` to build and send the activity to the extension.
4. `open_page` to open the service in a tab. Use `evaluate` to find selectors on the page.
5. `get_activity` to check the presence the activity sets.
6. Write `presence.test.ts` next to `presence.ts`.
7. `run_tests` to run the tests.

For an existing activity, skip step 1 and start from `load_activity`.

## Limits

- **It can't run alongside `pmd dev` or `pmd test`.** Both use port 3021. If that port is taken, browser tools return `Port 3021 is in use. Stop pmd dev or pmd test first.`
- **`evaluate` works only in tabs the server opened, on URLs the activity matches.**
- **Tabs use your real browser profile.** Like test tabs, they run with your logged-in sessions. Mute media before you open a page that plays audio or video.
- **`run_tests` can wait for you.** A test that uses `waitForUser` waits up to 5 minutes for you to act in the browser. Some MCP clients time out long tool calls before that, so a run may fail on the client side even though the test is still waiting.

## Errors

| Message                                                                                                         | Cause                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Extension not connected. Is developer mode on?`                                                                | The extension isn't connected to pmd. Make sure the extension is installed and Activity Developer Mode is on.                             |
| `Port 3021 is in use. Stop pmd dev or pmd test first.`                                                          | Another `pmd dev` or `pmd test` process is running.                                                                                       |
| `Activity <service> not found`                                                                                  | No activity matches the service name. Use `list_activities` to find the exact name.                                                       |
| `No tests found for <service>`                                                                                  | The activity has no `*.test.ts` file.                                                                                                     |
| `Load the activity with load_activity first`                                                                    | `open_page` was called before `load_activity` loaded that service.                                                                        |
| `More than one browser is connected to pmd. Turn off developer mode in the others so tests run in one browser.` | Several browsers have Activity Developer Mode on. `extension_status` and the other browser tools return this until only one is connected. |
