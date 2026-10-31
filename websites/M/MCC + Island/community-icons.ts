const cdn = 'https://islandcdn.themysterys.com'
const islandNames = [
  'verdant_woods',
  'floral_forest',
  'dark_grove',
  'tropical_overgrowth',
  'coral_shores',
  'twisted_swamp',
  'ancient_sands',
  'blazing_canyon',
  'ashen_wastes',
]

// Context-selected website images stay as public URLs, including in the local test ZIP.
export const CommunityIcons: Record<string, string | Blob> = Object.fromEntries([
  ...islandNames.map(name => `${cdn}/fishing/islands/${name}.png`),
  ...Array.from({ length: 11 }, (_, index) => `${cdn}/icons/crowns/${index}.png`),
].map(url => [url, url]))

export function communityIcon(source: string): string | Blob {
  const url = new URL(source)
  url.search = ''
  url.hash = ''
  return CommunityIcons[url.href] ?? source
}
