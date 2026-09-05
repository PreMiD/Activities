import type { Anime } from '../types.js'
import { API_URL, fetchCached } from './helpers.js'

export async function fetchAnime(id: string): Promise<Anime | null> {
  return fetchCached(`anime:${id}`, async () => {
    try {
      const response = await fetch(`${API_URL}/anime/${encodeURIComponent(id)}`)
      if (!response.ok)
        return null
      return await response.json() as Anime
    }
    catch {
      return null
    }
  })
}
