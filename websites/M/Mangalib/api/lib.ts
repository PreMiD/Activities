import type { AnimeData } from './models/anime.js'
import type { CharacterData } from './models/character.js'
import type { CollectionData } from './models/collections.js'
import type { MangaData } from './models/manga.js'
import type { PersonData } from './models/people.js'
import type { PublisherData } from './models/publisher.js'
import type { RanobeData } from './models/ranobe.js'
import type { ReviewData } from './models/reviews.js'
import type { TeamData } from './models/teams.js'
import type { UserData } from './models/user.js'
import { AnimeCdn, CharacterCdn, CollectionsCdn, MangaCdn, PeopleCdn, PublisherCdn, ReviewsCdn, TeamsCdn, UserCdn } from './cdnlibs.js'
import { assurePd, SiteId } from './utils.js'

type DataType = AnimeData | UserData | CharacterData | PersonData | PublisherData | TeamData | CollectionData | ReviewData

interface CachedResponse<T extends DataType = DataType> {
  id: string
  data: T
}

interface CachedCover {
  url: string
  blob: Blob
}

export class Lib {
  private cache?: CachedResponse
  private cachedCover?: CachedCover

  private extractId(string: string) {
    return string.split('/').pop()!.split('-')[0]!
  }

  private async fetch<T extends DataType>(url: string, siteId: SiteId): Promise<CachedResponse<T>> {
    const response = await fetch(url, { headers: { 'Site-Id': siteId } })
    const json = await response.json()

    const { data } = json

    if (data.cover)
      data.cover.adjusted = assurePd(data.cover.default, siteId)
    if (data.related)
      data.related.cover.adjusted = assurePd(data.related.cover.default, siteId)
    if (data.avatar)
      data.avatar.adjusted = assurePd(data.avatar.url, siteId)
    if (data.user)
      data.user.avatar.adjusted = assurePd(data.user.avatar.url, siteId)

    return {
      id: this.extractId(url),
      data: data as T,
    }
  }

  public async getTitle<T extends MangaData | RanobeData | AnimeData>(slug: string, siteId: SiteId): Promise<CachedResponse<T>> {
    const id = this.extractId(slug)

    switch (siteId) {
      case SiteId.MangaLib:
        if (!this.cache || this.cache.id !== id)
          this.cache = await this.fetch<MangaData>(MangaCdn(slug), siteId)
        break
      case SiteId.RanobeLib:
        if (!this.cache || this.cache.id !== id)
          this.cache = await this.fetch<RanobeData>(MangaCdn(slug), siteId)
        break
      case SiteId.AnimeLib:
        if (!this.cache || this.cache.id !== id) {
          this.cache = await this.fetch<AnimeData>(AnimeCdn(slug), siteId)
        }
    }

    return this.cache as CachedResponse<T>
  }

  public async getCollection(id: string, siteId: SiteId): Promise<CachedResponse<CollectionData>> {
    if (!this.cache || this.cache.id !== id)
      this.cache = await this.fetch<CollectionData>(CollectionsCdn(id), siteId)

    return this.cache as CachedResponse<CollectionData>
  }

  public async getReview(id: string, siteId: SiteId): Promise<CachedResponse<ReviewData>> {
    if (!this.cache || this.cache.id !== id)
      this.cache = await this.fetch<ReviewData>(ReviewsCdn(id), siteId)

    return this.cache as CachedResponse<ReviewData>
  }

  public async getCharacter(slug: string, siteId: SiteId): Promise<CachedResponse<CharacterData>> {
    const id = this.extractId(slug)

    if (!this.cache || this.cache.id !== id)
      this.cache = await this.fetch<CharacterData>(CharacterCdn(slug), siteId)

    return this.cache as CachedResponse<CharacterData>
  }

  public async getPerson(slug: string, siteId: SiteId): Promise<CachedResponse<PersonData>> {
    const id = this.extractId(slug)

    if (!this.cache || this.cache.id !== id)
      this.cache = await this.fetch<PersonData>(PeopleCdn(slug), siteId)

    return this.cache as CachedResponse<PersonData>
  }

  public async getUser(id: string, siteId: SiteId): Promise<CachedResponse<UserData>> {
    if (!this.cache || this.cache.id !== id)
      this.cache = await this.fetch<UserData>(UserCdn(id), siteId)

    return this.cache as CachedResponse<UserData>
  }

  /**
   *
   * Can't be currencly used due to API changes
   */
  public async getTeam(slug: string, siteId: SiteId): Promise<CachedResponse<TeamData>> {
    const id = this.extractId(slug)

    if (!this.cache || this.cache.id !== id)
      this.cache = await this.fetch<TeamData>(TeamsCdn(slug), siteId)

    return this.cache as CachedResponse<TeamData>
  }

  public async getPublisher(slug: string, siteId: SiteId): Promise<CachedResponse<PublisherData>> {
    const id = this.extractId(slug)

    if (!this.cache || this.cache.id !== id)
      this.cache = await this.fetch<PublisherData>(PublisherCdn(slug), siteId)

    return this.cache as CachedResponse<PublisherData>
  }
}
