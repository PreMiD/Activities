import { getRealtimeEndpoint } from '../lib/realtime.js'
import { getWorkspaceName } from '../lib/workspace.js'
import { ActivityAssets } from '../presence.js'

export function ServerSentEvents(): PresenceData | null {
  const endpoint = getRealtimeEndpoint()

  if (!endpoint)
    return null

  return {
    smallImageKey: ActivityAssets.ServerSentEvents,
    smallImageText: 'Server Sent Events',
    details: getWorkspaceName(),
    state: `🧑‍💻 | ${endpoint}`,
  }
}
