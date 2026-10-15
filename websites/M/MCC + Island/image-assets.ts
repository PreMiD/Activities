import { mccInitials } from './mcc-initials.js'
import { McciBlue, MccIconColor, McciIsland, MccInitialsIconColor, MccRed } from './mcc-logos.js'

// The shared initials badge is bundled so it never depends on an image-host request.
export const ActivityAssets: Record<
  'MccRed' | 'McciBlue' | 'MccIconColor' | 'MccInitialsIconColor' | 'MccInitialsColor' | 'McciIsland',
  string | Blob
> = {
  MccRed,
  McciBlue,
  MccIconColor,
  MccInitialsIconColor,
  MccInitialsColor: mccInitials,
  McciIsland,
}
