import type { UserProfile } from '../types.js'
import { API_URL, ActivityAssets, fetchCached } from './helpers.js'

export async function fetchUser(username: string): Promise<UserProfile | null> {
  return fetchCached(`user:${username.toLowerCase()}`, async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile/${encodeURIComponent(username)}`)
      if (!response.ok)
        return null
      const data = await response.json() as UserProfile
      return {
        ...data,
        profileImage: data.profileImage || ActivityAssets.Logo,
      }
    }
    catch {
      return null
    }
  })
}
