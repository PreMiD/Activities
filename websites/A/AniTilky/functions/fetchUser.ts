import type { UserProfile } from '../types.js'
import { API_URL, fetchCached } from './helpers.js'

export async function fetchUser(username: string): Promise<UserProfile | null> {
  return fetchCached(`user:${username.toLowerCase()}`, async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile/${encodeURIComponent(username)}`)
      if (!response.ok)
        return null
      return await response.json() as UserProfile
    }
    catch {
      return null
    }
  })
}
