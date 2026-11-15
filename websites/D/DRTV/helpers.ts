export const get = (id: string) => document.querySelector(id)

export function getVideoDetails() {
  const titleData = (get('.ch1-details__title h3') ?? get('.player-metadata__title'))!.textContent
  const episodeMetadata = get('.player-metadata__metadata')
  const channelData = (get('.ch1-details__schedule-time') ?? get('.ch1-details__description'))
  const descriptionData = (get('.ch1-details__description') ?? get('.player-metadata__text'))

  const EogSRegex = /\((\d+):(\d+)\)/
  const EpisodeNameRegex = /\(\d+:\d+\): |:/
  const EogSMetadataRegex = /\d+/g

  const title = titleData.split(EogSRegex)[0]?.split(':')[0]
  let season: string | undefined
  let episode: string | undefined
  const episodeName = titleData.split(EpisodeNameRegex)[1]

  let channel: string | undefined

  if (EogSRegex.test(titleData)) {
    const match = titleData.match(EogSRegex)!

    season = match[1]
    episode = match[2]
  }

  if (episodeMetadata) {
    const metadata = episodeMetadata.textContent

    if (!metadata.includes('Film')) {
      const match = metadata.match(EogSMetadataRegex)!
      season = match[0]
      episode = match[1]
    }
  }

  if (channelData) {
    const data = channelData.textContent.split(' | ')[0]
    channel = data
  }

  return {
    title,
    description: descriptionData?.textContent,

    season,
    episode,
    episodeName,

    channel,
  }
}
