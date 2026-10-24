// Fixed 512px assets are passed directly to PreMiD, without runtime fetching or uploads.
export const CommunityAssets: Record<'radar' | 'lighthouse' | 'hub' | 'stats', string | Blob> = {
  radar: 'https://i.imgur.com/ZVfPN1d.png',
  lighthouse: 'https://i.imgur.com/TBZvALi.png',
  hub: 'https://i.imgur.com/xyrzBZw.png',
  stats: 'https://i.imgur.com/TTy6Cpb.png',
}
