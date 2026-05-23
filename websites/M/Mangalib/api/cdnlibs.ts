const Host = 'api.cdnlibs.org'

/**
 * Even though this is a manga cdn, it is also used for ranobe
 */
export const MangaCdn = (slug: string) => `https://${Host}/api/manga/${slug}`
export const AnimeCdn = (slug: string) => `https://${Host}/api/anime/${slug}`
export const CollectionsCdn = (id: string) => `https://${Host}/api/collections/${id}`
export const UserCdn = (id: string) => `https://${Host}/api/user/${id}`
export const CharacterCdn = (slug: string) => `https://${Host}/api/character/${slug}`
export const PeopleCdn = (slug: string) => `https://${Host}/api/people/${slug}`
export const ReviewsCdn = (id: string) => `https://${Host}/api/reviews/${id}`
export const TeamsCdn = (slug: string) => `https://${Host}/api/teams/${slug}`
export const PublisherCdn = (slug: string) => `https://${Host}/api/publisher/${slug}`
