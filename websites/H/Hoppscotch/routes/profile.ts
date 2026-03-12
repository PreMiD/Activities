import { getWorkspaceName } from '../lib/workspace.js'
import { ActivityAssets } from '../presence.js'

export function Profile(): PresenceData | null {
  return {
    smallImageKey: ActivityAssets.Profile,
    smallImageText: 'Profile',
    details: getWorkspaceName(),
    state: 'Viewing their profile',
  } as PresenceData
}
