export const get = (id: string) => document.querySelector(id)

export function getVideoDetails() {
  const titleData = (get('.ch1-details__title h3') ?? get('.player-metadata__title'))!.textContent
  const episodeMetadata = get('.player-metadata__metadata')
  const channelData = (get('.ch1-details__schedule-time') || get('.ch1-details__description'))

  const title = titleData.split(':')[0]!.split('(')[0]!

  let season: string | null = null
  let episode: string | null = null
  const episodeName = titleData.split(':').slice(1).join(':')

  let channel: string | null = null

  if (episodeMetadata) {
    const metadata = episodeMetadata.textContent

    if (!metadata.includes('Film')) {
      const match = metadata.match(/(\d+)/g)!
      season = match[0]
      episode = match[1]!
    }
  }

  if (channelData) {
    const data = channelData.textContent.split(' | ')[0]!
    const match = titleData.match(/\((\d+):(\d+)\)/)

    if (match) {
      season = match[1]!
      episode = match[2]!
    }

    channel = data
  }

  return {
    title,
    description: (get('.ch1-details__description') ?? get('.player-metadata__text'))!.textContent,

    season,
    episode,
    episodeName,

    channel,
  }
}
