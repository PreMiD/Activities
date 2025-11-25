interface Project {
  title: string
  artist_name: string | null
  access_type: 'public' | 'private'
  artwork_signed_url: string
  artwork_small_signed_url: string
  artwork_thumbnail_signed_url: string
  slug: string
  username: string
}

interface Track {
  id: string
  title: string
  version_title: string
  access_type: 'public' | 'private'
}

export interface LibraryProject {
  project: Project
  tracks: Track[]
}
