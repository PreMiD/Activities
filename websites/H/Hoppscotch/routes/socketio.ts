import { getRealtimeEndpoint } from '../lib/realtime.js'
import { getWorkspaceName } from '../lib/workspace.js'
import { ActivityAssets } from '../presence.js'

export function SocketIO(): PresenceData | null {
  const endpoint = getRealtimeEndpoint()

  if (!endpoint)
    return null

  return {
    smallImageKey: ActivityAssets.SocketIO,
    smallImageText: 'Socket.IO',
    details: getWorkspaceName(),
    state: `🧑‍💻 | ${endpoint}`,
  }
}
