import { getWorkspaceName } from '../lib/workspace.js'
import { ActivityAssets } from '../presence.js'

export function Settings(): PresenceData {
  return {
    smallImageKey: ActivityAssets.Settings,
    smallImageText: 'Settings',
    details: getWorkspaceName(),
    state: 'Configuring settings',
  }
}
