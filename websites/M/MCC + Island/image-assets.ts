import { AccountIcons } from './account-icons.js'
import { CommunityAssets } from './community-assets.js'
import { CommunityIcons } from './community-icons.js'
import { mccInitials } from './mcc-initials.js'
import { McciBlue, MccIconColor, McciIsland, MccInitialsIconColor, MccRed } from './mcc-logos.js'
import { ReafyGameIcons, ReafyLogo } from './reafy-assets.js'
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
  ...Object.values(CommunityIcons),
  ...Object.values(CommunityAssets),
  ...Object.values(ReafyGameIcons),
  ReafyLogo,
  ...Object.values(ActivityAssets),
  ...Object.values(AccountIcons),
  Eyes,
  Logo,
  TransparentLogo,
].filter((image): image is string => typeof image === 'string'))
