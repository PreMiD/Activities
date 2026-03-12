const presence = new Presence({
  clientId: '1124065204200820786',
})

const time = Math.floor(Date.now() / 1000)
const path = document.location.pathname
const videoData = {
  current: 0,
  duration: 0,
  isLive: false,
  paused: true,
}
const baseUrl = 'https://anitilky.xyz'
const apiUrl = 'https://api.anitilky.xyz/api'
const logoUrl = 'https://cdn.rcd.gg/PreMiD/websites/A/AniTilky/assets/logo.png'

interface VideoData {
  current: number
  duration: number
  isLive: boolean
  paused: boolean
}

interface AnimeResponse {
  _id: string
  bannerImage: string
  coverImage: string
  description: string
  endDate: string
  genres: string[]
  rating: number
  releaseDate: string
  seasons: {
    episodes: {
      episodeNumber: number
      title: string
    }[]
    seasonNumber: number
    title: string
  }[]
  source: {
    id: string
    name: string
  }
  status: string
  title: {
    english: string
    native: string
    romaji: string
  }
  type: string
}

interface UserResponse {
  data: {
    avatar: string
    bio: string
    username: string
  }
  success: boolean
}

// Client API'den anime bilgilerini çekmek için fonksiyon
async function getAnimeInfo(animeId: string): Promise<AnimeResponse | null> {
  try {
    const response = await fetch(`${apiUrl}/anime/${animeId}`)
    if (!response.ok) {
      throw new Error('Anime bilgisi alınamadı')
    }
    const data: AnimeResponse = await response.json()
    if (!data) {
      return null
    }
    return data
  }
  catch {
    return null
  }
}

// Kullanıcı bilgilerini çekmek için fonksiyon
async function getUserInfo(username: string): Promise<UserResponse['data'] | null> {
  try {
    const response = await fetch(`${apiUrl}/user/profile/${username}`)
    if (!response.ok) {
      throw new Error('Kullanıcı bilgisi alınamadı')
    }
    const data: UserResponse = await response.json()
    if (!data.success || !data.data) {
      return null
    }
    return {
      ...data.data,
      avatar: data.data.avatar || logoUrl,
    }
  }
  catch {
    return null
  }
}

presence.on('iFrameData', async (data: VideoData) => {
  if (!data) {
    return
  }
  Object.assign(videoData, data)
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: logoUrl,
  }

  if (path === '/') {
    presenceData.details = 'Ana sayfaya göz atıyor'
    presenceData.startTimestamp = time
  }
  else if (path === '/profile') {
    const username = document.querySelector('.profile-username')?.textContent?.trim()
    const userInfo = username ? await getUserInfo(username) : null

    if (username) {
      presenceData.details = 'Kendi profiline bakıyor'
      presenceData.state = userInfo?.username || username
      presenceData.largeImageKey = userInfo?.avatar
    }
    else {
      presenceData.details = 'Profiline bakıyor'
    }
    presenceData.startTimestamp = time
  }
  else if (path.startsWith('/u/')) {
    const username = path.split('/').pop() || ''
    const userInfo = await getUserInfo(username)

    presenceData.details = 'Kullanıcı profiline bakıyor'
    presenceData.state = userInfo?.username || username
    presenceData.largeImageKey = userInfo?.avatar
    presenceData.startTimestamp = time

    presenceData.buttons = [
      {
        label: 'Profile Bak',
        url: `${baseUrl}/u/${username}`,
      },
    ]
  }
  else if (/^\/anime\/[0-9a-f]{24}$/.test(path)) {
    const animeInfo = await getAnimeInfo(path.split('/').pop() || '')

    presenceData.details = 'Anime detayına bakıyor'
    presenceData.state = animeInfo?.title.romaji || animeInfo?.title.english || animeInfo?.title.native || 'Yükleniyor...'
    presenceData.largeImageKey = animeInfo?.coverImage || logoUrl
    if (animeInfo) {
      presenceData.smallImageText = `${animeInfo.type || 'TV'} • ${animeInfo.status || 'Devam Ediyor'}`
    }
    presenceData.startTimestamp = time

    presenceData.buttons = [
      {
        label: 'Anime Sayfasına Git',
        url: `${baseUrl}${path}`,
      },
    ]
  }
  else if (/^\/watch\/[0-9a-f]{24}$/.test(path)) {
    const animeId = path.split('/').pop() || ''
    const urlParams = new URLSearchParams(window.location.search)
    const season = urlParams.get('season') || '1'
    const episode = urlParams.get('episode') || '1'
    const animeInfo = await getAnimeInfo(animeId)

    presenceData.details = animeInfo?.title.romaji || animeInfo?.title.english || animeInfo?.title.native || 'Yükleniyor...'
    presenceData.state = `Sezon ${season} Bölüm ${episode}`
    presenceData.largeImageKey = animeInfo?.coverImage || logoUrl
    if (animeInfo) {
      presenceData.smallImageText = `${animeInfo.type || 'TV'} • ${animeInfo.status || 'Devam Ediyor'}`
    }

    presenceData.buttons = [
      {
        label: 'Anime Sayfasına Git',
        url: `${baseUrl}/anime/${animeId}`,
      },
      {
        label: 'Bölüme Git',
        url: `${baseUrl}${path}?season=${season}&episode=${episode}`,
      },
    ]
  }
  else if (path.includes('/anime')) {
    presenceData.details = 'Anime listesine göz atıyor'
    presenceData.startTimestamp = time
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
