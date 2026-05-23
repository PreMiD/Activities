export interface UserData {
  id: number
  username: string
  avatar: UserAvatar
  last_online_at: Date
}

export interface UserAvatar {
  filename: string
  /**
   * Should not be used, use `adjusted` instead due to restrictions
   */
  url: string
  /**
   * Custom property with adjusted avatar
   */
  adjusted: Blob
}
