import { AccountIcons } from './account-icons.js'
import { mccInitials } from './mcc-initials.js'
import { McciBlue, MccIconColor, McciIsland, MccInitialsIconColor, MccRed } from './mcc-logos.js'
import { Eyes, Logo, TransparentLogo } from './wiki-assets.js'

// These URLs are passed directly to PreMiD instead of fetched and uploaded per update.
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

export const StaticImageUrls = new Set([
  ...Object.values(ActivityAssets),
  ...Object.values(AccountIcons),
  Eyes,
  Logo,
  TransparentLogo,
].filter((image): image is string => typeof image === 'string'))
