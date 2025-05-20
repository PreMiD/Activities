interface CommonData {
  id: number
  name: string
  rus_name: string
  eng_name: string
  alt_name: string
  slug: string
  slug_url: string
  cover: Cover
  stats: Stat[]
}

export interface AnimeData extends Omit<CommonData, 'stats'> {
  ageRestriction: AgeRestriction
  cover: Cover
  /**
   * Example: 18 января 1991 г.
   */
  releaseDateString: string
  shiki_rate: number
  shikimori_href: string
  status: AnimeStatus
  type: AnimeType
  /**
   * Check if it exists. If it is, the anime is licensed and no anime data will be present
   */
  toast?: {
    message: string
    type: string
  }
}

export interface UserData {
  id: number
  username: string
  avatar: UserAvatar
  last_online_at: Date
}

export type CharacterData = CommonData
export type PersonData = CommonData
export type PublisherData = CommonData
export type TeamData = Omit<CommonData, 'stats' | 'rus_name'>

export interface CollectionData {
  id: number
  name: string
  user: Author
  type: 'titles' | 'character' | 'people'
  adult: boolean
}

export interface ReviewData {
  id: number
  title: string
  user: Author
  related: ReviewRelation
}

interface ReviewRelation {
  rus_name: string
  eng_name: string
  cover: Cover
  ageRestriction: AgeRestriction
}

interface Author {
  id: string
  username: string
  avatar: UserAvatar
}

interface Stat {
  value: number
  formated: string
  short: string
  tag: 'titles' | 'subscribers'
  label: string
}

interface UserAvatar {
  filename: string
  url: string
}

interface Cover {
  filename: string
  default: string
  thumbnail: string
}

export type AgeRestriction =
  | { id: 0, label: 'Нет' }
  | { id: 1, label: '6+' }
  | { id: 2, label: '12+' }
  | { id: 3, label: '16+' }
  | { id: 4, label: '18+' }
  | { id: 5, label: '18+ (RX)' }

interface AnimeStatus {
  id: number // yet to be typed properly
  label: string
}

interface AnimeType {
  id: number // yet to be typed properly
  label: string
}

interface CachedResponse {
  id: string
  data: AnimeData | UserData | CharacterData | CollectionData | ReviewData
}

type APIEndpoint =
  | 'anime'
  | 'user'
  | 'character'
  | 'people'
  | 'collections'
  | 'reviews'
  | 'teams'
  | 'publisher'

let cachedResponse: CachedResponse

export class AnimeLib {
  private static api = 'https://api2.mangalib.me/api'

  private static split = (path: string) => path.split('/')[3]

  private static async request(
    id: string,
    endpoint: APIEndpoint,
    endpointPart?: string,
  ) {
    return await fetch(`${this.api}/${endpoint}/${endpointPart ?? id}`, {
      headers: {
        'Site-Id': '5',
      },
    }).then(
      async (response): Promise<CachedResponse> => {
        return {
          id,
          data: (await response.json()).data,
        }
      },
    )
  }

  public static async getAnime(
    path: string,
    id: string,
  ): Promise<CachedResponse> {
    if (!cachedResponse || cachedResponse.id !== id) {
      if (path.endsWith('/watch'))
        path = path.slice(0, -6)

      cachedResponse = await this.request(id, 'anime', this.split(path))
    }

    return cachedResponse
  }

  public static async getUser(id: string): Promise<CachedResponse> {
    if (!cachedResponse || cachedResponse.id !== id)
      cachedResponse = await this.request(id, 'user')

    return cachedResponse
  }

  public static async getCharacter(
    path: string,
    id: string,
  ): Promise<CachedResponse> {
    if (!cachedResponse || cachedResponse.id !== id)
      cachedResponse = await this.request(id, 'character', this.split(path))

    return cachedResponse
  }

  public static async getPerson(
    path: string,
    id: string,
  ): Promise<CachedResponse> {
    if (!cachedResponse || cachedResponse.id !== id)
      cachedResponse = await this.request(id, 'people', this.split(path))

    return cachedResponse
  }

  public static async getCollection(id: string): Promise<CachedResponse> {
    if (!cachedResponse || cachedResponse.id !== id)
      cachedResponse = await this.request(id, 'collections')

    return cachedResponse
  }

  public static async getReview(id: string): Promise<CachedResponse> {
    if (!cachedResponse || cachedResponse.id !== id)
      cachedResponse = await this.request(id, 'reviews')

    return cachedResponse
  }

  public static async getTeam(
    path: string,
    id: string,
  ): Promise<CachedResponse> {
    if (!cachedResponse || cachedResponse.id !== id)
      cachedResponse = await this.request(id, 'teams', this.split(path))

    return cachedResponse
  }

  public static async getPublisher(
    path: string,
    id: string,
  ): Promise<CachedResponse> {
    if (!cachedResponse || cachedResponse.id !== id)
      cachedResponse = await this.request(id, 'publisher', this.split(path))

    return cachedResponse
  }
}
