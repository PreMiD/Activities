// Fixed 512px assets are passed directly to PreMiD, without runtime fetching or uploads.
export const CommunityAssets: Record<'radar' | 'lighthouse' | 'hub' | 'stats', string | Blob> = {
  radar: 'https://cdn.rcd.gg/PreMiD/websites/M/MCC%20%2B%20Island/assets/15.png',
  lighthouse: 'https://cdn.rcd.gg/PreMiD/websites/M/MCC%20%2B%20Island/assets/16.png',
  hub: 'https://cdn.rcd.gg/PreMiD/websites/M/MCC%20%2B%20Island/assets/17.png',
  stats: 'https://cdn.rcd.gg/PreMiD/websites/M/MCC%20%2B%20Island/assets/18.png',
}
