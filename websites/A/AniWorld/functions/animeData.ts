export interface AnimeData {
  title: string
  season?: number
  episode?: number
  coverImg?: string
}

export class AnimeDataFetcher {
  private animeData: AnimeData

  constructor() {
    const title = document.querySelector<HTMLHeadingElement>('h1')?.textContent?.trim() || 'Anime'
    const coverImg = document.querySelector<HTMLImageElement>('div.seriesCoverBox img')?.src

    const url = window.location.href.toLowerCase()
    const seasonMatch = url.match(/staffel-(\d+)/)
    const episodeMatch = url.match(/episode-(\d+)/)

    this.animeData = {
      title,
      season: seasonMatch ? Number(seasonMatch[1]) : undefined,
      episode: episodeMatch ? Number(episodeMatch[1]) : undefined,
      coverImg,
    }
  }

  private async fetchCoverFromAniList(title: string): Promise<string | undefined> {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          coverImage {
            large
          }
        }
      }
    `
    const variables = { search: title }

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      })
      const json = await response.json()

      if (json.data?.Media?.coverImage?.large) {
        return json.data.Media.coverImage.large
      }
    }
    catch (error) {
      console.error('Fehler bei AniList API:', error)
    }
    return undefined
  }

  public async loadAnimeData(): Promise<AnimeData> {
    if (this.animeData.coverImg) {
      return this.animeData
    }

    const coverFromApi = await this.fetchCoverFromAniList(this.animeData.title)
    if (coverFromApi) {
      this.animeData.coverImg = coverFromApi
    }
    return this.animeData
  }

  public getAnimeData(): AnimeData {
    return this.animeData
  }
}
