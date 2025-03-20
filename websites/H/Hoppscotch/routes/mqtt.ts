import { getRealtimeEndpoint } from '../lib/realtime.js'
import { getWorkspaceName } from '../lib/workspace.js'
import { ActivityAssets } from '../presence.js'

export function MQTT(): PresenceData | null {
  const endpoint = getRealtimeEndpoint()

  if (!endpoint)
    return null

  return {
    smallImageKey: ActivityAssets.MQTT,
    smallImageText: 'MQTT',
    details: getWorkspaceName(),
    state: `🧑‍💻 | ${endpoint}`,
  }
}
