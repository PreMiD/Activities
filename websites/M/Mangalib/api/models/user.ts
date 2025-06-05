export interface UserAvatar {
  filename: string
  url: string
}

export interface UserData {
  id: number
  username: string
  avatar: UserAvatar
  last_online_at: Date
}
