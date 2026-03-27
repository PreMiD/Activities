# Sync Script Types

These are the TypeScript interfaces used by sync scripts to integrate with Watch Party functionality. Sync scripts allow activities to synchronize video playback, cursor positions, and scroll state across party members.

::: tip
For a detailed guide on using the `SyncScriptContext` object, see the [Sync Script Context API reference](/v1/api/sync-script-context).
:::

## SyncScriptDefinition

Defines the entry point for a sync script. The `setup` function receives a [SyncScriptContext](#syncscriptcontext) and may return a cleanup function.

| Property | Type | Description |
| --- | --- | --- |
| `setup` | `(ctx: SyncScriptContext) => (() => void) \| void` | Called when the sync script is initialized; may return a teardown function. |
| `onNavigate` | `(ctx: SyncScriptContext, url: string) => void` | Called when the user navigates to a new URL within the same activity. |

## SyncScriptHandle

A handle returned when a sync script is loaded, used to tear it down.

| Property | Type | Description |
| --- | --- | --- |
| `destroy` | `() => void` | Destroys the sync script and runs any cleanup returned by `setup`. |

## SyncScriptContext

The main context object passed to sync script lifecycle hooks. See the [Sync Script Context API reference](/v1/api/sync-script-context) for full usage details.

| Property | Type | Description |
| --- | --- | --- |
| `features` | `(features: { video?: boolean, cursor?: boolean, scroll?: boolean }) => void` | Declares which sync features this script supports. |
| `video` | `object` | Namespace for video synchronization methods; see below. |
| `video.attach` | `(element: HTMLMediaElement \| string) => AutoVideoHandle` | Attaches to a media element for automatic playback tracking. Returns an [AutoVideoHandle](#autovideohandle). |
| `video.takeControl` | `(options: TakeControlOptions) => ManualVideoHandle` | Takes manual control of playback synchronization. Returns a [ManualVideoHandle](#manualvideohandle). |
| `video.reportAd` | `(isInAd: boolean) => void` | Reports whether an ad is currently playing. |
| `video.reportBuffering` | `(isBuffering: boolean) => void` | Reports whether the video is currently buffering. |
| `setPageInfo` | `(info: PageInfo) => void` | Sets the current page metadata shown to party members. |
| `reportBlocked` | `(reason: string) => void` | Reports that synchronization is blocked, with a human-readable reason. |
| `reportUnblocked` | `() => void` | Clears a previously reported blocked state. |
| `sendCustomData` | `(key: string, data: unknown) => void` | Sends custom data to other party members. |
| `onCustomData` | `(key: string, handler: (data: unknown) => void) => () => void` | Listens for custom data from other party members; returns an unsubscribe function. |
| `iframe` | `IframeMessaging` | Messaging namespace for communicating with iframes. See [IframeMessaging](#iframemessaging). |
| `mainworld` | `MessagingNamespace` | Messaging namespace for communicating with the main world context. See [MessagingNamespace](#messagingnamespace). |
| `party` | `PartyState` | Reactive state of the current Watch Party session. See [PartyState](#partystate). |

## TakeControlOptions

Options passed to `video.takeControl()` for manual playback synchronization.

| Property | Type | Description |
| --- | --- | --- |
| `onPlay` | `(timeSeconds: number) => void` | Called when the party requests playback to start at the given time. |
| `onPause` | `(timeSeconds: number) => void` | Called when the party requests playback to pause at the given time. |
| `onSeek` | `(timeSeconds: number) => void` | Called when the party requests a seek to the given time. |
| `onRate` | `(playbackRate: number) => void` | Called when the party requests a playback rate change. |
| `pauseAfterSeek` | `boolean \| number` | Whether to pause after seeking, or a delay in milliseconds before resuming. |

## AutoVideoHandle

Returned by `video.attach()`. Manages automatic video tracking for a media element.

| Property | Type | Description |
| --- | --- | --- |
| `detach` | `() => void` | Detaches from the media element and stops tracking. |
| `onSyncCommand` | `(handler: (cmd: SyncCommand) => void) => () => void` | Registers a handler for incoming sync commands; returns an unsubscribe function. |
| `reportAd` | `(isInAd: boolean) => void` | Reports whether an ad is currently playing on this video. |
| `reportBuffering` | `(isBuffering: boolean) => void` | Reports whether this video is currently buffering. |

## ManualVideoHandle

Returned by `video.takeControl()`. Provides manual control over playback reporting.

| Property | Type | Description |
| --- | --- | --- |
| `reportPlayback` | `(status: PlaybackReport) => void` | Reports the current playback state to the party. See [PlaybackReport](#playbackreport). |
| `onSyncCommand` | `(handler: (cmd: SyncCommand) => void) => () => void` | Registers a handler for incoming sync commands; returns an unsubscribe function. |
| `reportAd` | `(isInAd: boolean) => void` | Reports whether an ad is currently playing. |
| `reportBuffering` | `(isBuffering: boolean) => void` | Reports whether the video is currently buffering. |
| `release` | `() => void` | Releases manual control and stops reporting playback. |

## PlaybackReport

Describes the current playback state, sent via `ManualVideoHandle.reportPlayback()`.

| Property | Type | Description |
| --- | --- | --- |
| `playing` | `boolean` | Whether the video is currently playing. |
| `currentTime` | `number` | Current playback position in seconds. |
| `duration` | `number` | Total duration of the video in seconds. |
| `playbackRate` | `number` | Current playback rate (e.g., `1.0` for normal speed). |

## SyncCommand

A synchronization command received from the Watch Party server.

| Property | Type | Description |
| --- | --- | --- |
| `action` | `'play' \| 'pause' \| 'seek' \| 'rate'` | The type of synchronization action to perform. |
| `currentTime` | `number` | The target playback time in seconds. |
| `playbackRate` | `number` | The target playback rate. |
| `capturedAt` | `number` | Timestamp when the command was captured by the sender. |
| `serverTs` | `number` | Server timestamp when the command was processed. |
| `clockOffset` | `number` | Estimated clock offset between client and server in milliseconds. |
| `isHeartbeat` | `boolean` | Whether this command is a periodic heartbeat rather than a user action. |

## PageInfo

Metadata about the current page, displayed to party members.

| Property | Type | Description |
| --- | --- | --- |
| `title` | `string` | The title of the current content (e.g., video title). |
| `subtitle` | `string` | A subtitle or secondary label (e.g., channel name). |
| `thumbnail` | `string` | URL of a thumbnail image for the current content. |

## PartyState

Reactive state representing the current Watch Party session.

| Property | Type | Description |
| --- | --- | --- |
| `role` | `'controller' \| 'follower'` | The current user's role in the party. |
| `paused` | `boolean` | Whether the party playback is currently paused. |
| `active` | `boolean` | Whether the Watch Party session is currently active. |
| `isHost` | `boolean` | Whether the current user is the host of the party. |
| `onRoleChange` | `(handler: (role: 'controller' \| 'follower') => void) => () => void` | Registers a handler called when the user's role changes; returns an unsubscribe function. |
| `onPauseChange` | `(handler: (paused: boolean) => void) => () => void` | Registers a handler called when the pause state changes; returns an unsubscribe function. |
| `onActiveChange` | `(handler: (active: boolean) => void) => () => void` | Registers a handler called when the active state changes; returns an unsubscribe function. |

## MessagingNamespace

A messaging namespace for sending and receiving messages between contexts (e.g., content script and main world).

| Property | Type | Description |
| --- | --- | --- |
| `send` | `(key: string, data: unknown) => void` | Sends a fire-and-forget message with the given key. |
| `request` | `(key: string, data: unknown) => Promise<unknown>` | Sends a message and waits for a response. |
| `onMessage` | `(key: string, handler: (data: unknown) => void) => () => void` | Listens for messages with the given key; returns an unsubscribe function. |
| `onRequest` | `(key: string, handler: (data: unknown) => unknown \| Promise<unknown>) => () => void` | Listens for requests with the given key and returns a response; returns an unsubscribe function. |

## IframeMessaging

A messaging namespace for communicating between content scripts and iframes, with frame identification.

| Property | Type | Description |
| --- | --- | --- |
| `send` | `(frameId: number, key: string, data: unknown) => void` | Sends a fire-and-forget message to a specific iframe by frame ID. |
| `request` | `(frameId: number, key: string, data: unknown) => Promise<unknown>` | Sends a message to a specific iframe and waits for a response. |
| `onMessage` | `(key: string, handler: (data: unknown, frameId: number) => void) => () => void` | Listens for messages from any iframe; handler receives the sender's frame ID. Returns an unsubscribe function. |
| `onRequest` | `(key: string, handler: (data: unknown, frameId: number) => unknown \| Promise<unknown>) => () => void` | Listens for requests from any iframe; handler receives the sender's frame ID. Returns an unsubscribe function. |

## SyncIframeContext

Context object available inside an iframe sync script.

| Property | Type | Description |
| --- | --- | --- |
| `video` | `object` | Namespace for video synchronization within the iframe. |
| `video.attach` | `(element: HTMLMediaElement \| string) => AutoVideoHandle` | Attaches to a media element for automatic playback tracking. Returns an [AutoVideoHandle](#autovideohandle). |
| `video.onSyncCommand` | `(handler: (cmd: SyncCommand) => void) => () => void` | Registers a handler for incoming sync commands; returns an unsubscribe function. |
| `sendCustomData` | `(key: string, data: unknown) => void` | Sends custom data to the parent content script. |
| `onCustomData` | `(key: string, handler: (data: unknown) => void) => () => void` | Listens for custom data from the parent content script; returns an unsubscribe function. |
| `content` | `MessagingNamespace` | Messaging namespace for communicating with the parent content script. See [MessagingNamespace](#messagingnamespace). |

## SyncMainworldContext

Context object available inside a main world sync script.

| Property | Type | Description |
| --- | --- | --- |
| `content` | `MessagingNamespace` | Messaging namespace for communicating with the content script. See [MessagingNamespace](#messagingnamespace). |
