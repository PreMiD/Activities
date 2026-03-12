import { getRealtimeEndpoint } from '../lib/realtime.js'
import { getWorkspaceName } from '../lib/workspace.js'
import { ActivityAssets } from '../presence.js'

export function Websocket(): PresenceData | null {
  const endpoint = getRealtimeEndpoint()

  if (!endpoint)
    return null

  return {
    smallImageKey: ActivityAssets.Websocket,
    smallImageText: 'Websocket',
    details: getWorkspaceName(),
    state: `🧑‍💻 | ${endpoint}`,
  }
}
