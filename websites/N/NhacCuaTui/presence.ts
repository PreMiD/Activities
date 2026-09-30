import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1548362846558228500',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

// ==========================================
// CẤU HÌNH NHACCUATUI
// ==========================================

const NCT_LOGO = 'https://files.catbox.moe/eha3a5.png'

// Bộ nhớ đệm ảnh bìa bài hát theo khóa (Tên bài hát - Ca sĩ)
const songCoverCache = new Map<string, string>()

// ==========================================
// HÀM SO SÁNH CHUỖI TÊN BÀI HÁT
// ==========================================

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
}

function isSongNameMatch(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB)
    return false
  const a = normalizeString(nameA)
  const b = normalizeString(nameB)
  if (!a || !b)
    return false
  return a === b || a.includes(b) || b.includes(a)
}

// ==========================================
// TIÊM SCRIPT HỖ TRỢ LẤY DỮ LIỆU TỪ PINIA / MAIN WORLD
// ==========================================

function injectPageHelper(): void {
  if (typeof document === 'undefined')
    return
  if (document.getElementById('premid-nct-helper'))
    return

  try {
    const script = document.createElement('script')
    script.id = 'premid-nct-helper'
    script.textContent = `
      (function() {
        function getPiniaStore() {
          try {
            const nuxtEl = document.querySelector('#__nuxt');
            const app = nuxtEl && nuxtEl.__vue_app__;
            if (app) {
              const pinia = (app.config && app.config.globalProperties && app.config.globalProperties.$pinia) ||
                (app.$nuxt && app.$nuxt.$pinia);
              if (pinia && pinia._s) {
                const store = pinia._s.get('musicPlayer');
                if (store && store.currentMusicInfo && store.currentMusicInfo.name) {
                  return store;
                }
                for (const s of pinia._s.values()) {
                  if (s && s.currentMusicInfo && s.currentMusicInfo.name) {
                    return s;
                  }
                }
              }
            }
          } catch {}

          try {
            if (typeof window.useNuxtApp === 'function') {
              const nuxt = window.useNuxtApp();
              const pinia = nuxt && nuxt.$pinia;
              if (pinia && pinia._s) {
                const store = pinia._s.get('musicPlayer');
                if (store && store.currentMusicInfo && store.currentMusicInfo.name) {
                  return store;
                }
              }
            }
          } catch {}

          return null;
        }

        function isValidCover(url) {
          if (!url || typeof url !== 'string') return false;
          if (url.startsWith('data:') || url.startsWith('blob:')) return false;
          if (
            url.includes('default-song-img') ||
            url.includes('default-topic-img') ||
            url.includes('default-artist-img') ||
            url.includes('1x1') ||
            url.includes('nct-share.png')
          ) return false;
          return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
        }

        // Fetch cover art from graph.nhaccuatui.com inside page context (avoids CORS from extension)
        var fetchingKey = null;
        function fetchCoverFromApi(songKey, songName, artistStr) {
          if (!songKey || fetchingKey === songKey) return;
          fetchingKey = songKey;
          var targetKey = songKey;

          fetch('https://graph.nhaccuatui.com/api/v1/song/detail/' + songKey)
            .then(function(r) { return r.ok ? r.json() : null; })
            .then(function(data) {
              var img = data && data.data && (data.data.image || data.data.bgImage || data.data.thumbnail || data.data.cover);
              if (isValidCover(img)) {
                if (document.documentElement.getAttribute('data-nct-song-key') === targetKey) {
                  document.documentElement.setAttribute('data-nct-song-cover', img);
                }
                return;
              }
              // Fallback: search by name + artist
              var q = (songName + ' ' + (artistStr || '')).trim();
              return fetch(
                'https://graph.nhaccuatui.com/api/v1/search/song?keyword=' + encodeURIComponent(q) + '&pageindex=1&pagesize=5&correct=false',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ keyword: q, pageindex: 1, pagesize: 5 })
                }
              ).then(function(r) { return r.ok ? r.json() : null; })
               .then(function(data) {
                 var songs = (data && data.data && data.data.songs) || [];
                 for (var i = 0; i < songs.length; i++) {
                   var s = songs[i];
                   var sImg = s && (s.image || s.bgImage);
                   if (isValidCover(sImg)) {
                     if (document.documentElement.getAttribute('data-nct-song-key') === targetKey) {
                       document.documentElement.setAttribute('data-nct-song-cover', sImg);
                     }
                     return;
                   }
                 }
               });
            })
            .catch(function() { if (fetchingKey === songKey) fetchingKey = null; });
        }

        var lastSyncedKey = null;

        function syncState() {
          try {
            const store = getPiniaStore();
            const cur = store && store.currentMusicInfo;
            if (cur && cur.name) {
              const currentKey = cur.key || cur.id || cur.songId || null;

              // When song changes, immediately clear old cover to prevent stale image
              if (currentKey && currentKey !== lastSyncedKey) {
                document.documentElement.removeAttribute('data-nct-song-cover');
                lastSyncedKey = currentKey;
                fetchingKey = null;
              }

              document.documentElement.setAttribute('data-nct-song-name', cur.name || '');
              if (currentKey) {
                document.documentElement.setAttribute('data-nct-song-key', currentKey);
              }

              let artistStr = '';
              if (typeof cur.artist === 'string') {
                artistStr = cur.artist;
              } else if (Array.isArray(cur.artist)) {
                artistStr = cur.artist.map(function(a) { return (a && a.name) || ''; }).filter(Boolean).join(', ');
              }
              if (artistStr) {
                document.documentElement.setAttribute('data-nct-song-artist', artistStr);
              }

              const cover = cur.image || cur.thumbnail || cur.cover || cur.avatar || cur.bgImage || '';
              if (isValidCover(cover)) {
                document.documentElement.setAttribute('data-nct-song-cover', cover);
              } else if (currentKey && !document.documentElement.getAttribute('data-nct-song-cover')) {
                // Pinia has no valid cover => fetch from API (runs in page context to bypass CORS)
                fetchCoverFromApi(currentKey, cur.name, artistStr);
              }
            }
          } catch {}
        }

        setInterval(syncState, 300);
        syncState();
      })();
    `
    ;(document.head || document.documentElement).appendChild(script)
  }
  catch {}
}

// ==========================================
// FORMAT THỜI GIAN
// ==========================================

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// ==========================================
// LÀM SẠCH VÀ CHUẨN HÓA LINK ẢNH
// ==========================================

function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url)
    return null
  let trimmed = url.trim()

  // Bỏ qua data URL, blob hoặc URL rỗng
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return null
  }

  // Bỏ qua các ảnh placeholder mặc định của NhacCuaTui
  if (
    trimmed.includes('default-song-img')
    || trimmed.includes('default-topic-img')
    || trimmed.includes('default-artist-img')
    || trimmed.includes('default-video-img')
    || trimmed.includes('nct-share.png')
    || trimmed.includes('1x1')
  ) {
    return null
  }

  // Chuẩn hóa link tương đối
  if (trimmed.startsWith('//')) {
    trimmed = `https:${trimmed}`
  }
  else if (trimmed.startsWith('/')) {
    trimmed = `https://www.nhaccuatui.com${trimmed}`
  }

  return trimmed.startsWith('https://') || trimmed.startsWith('http://')
    ? trimmed
    : null
}

// ==========================================
// TẢI ẢNH BÀI HÁT TỪ API CHÍNH THỨC CỦA NHACCUATUI
// ==========================================

function getKeyFromUrl(): string | null {
  if (typeof window === 'undefined' || !window.location)
    return null
  const match = window.location.pathname.match(/(?:\/song\/|\/bai-hat\/[^.]*\.)([a-zA-Z0-9]+)/)
  return match?.[1] ?? null
}

async function fetchSongCoverFromApi(
  songName: string,
  artists: string,
  songKey?: string | null,
): Promise<string | null> {
  // 1. Nếu có mã bài hát (key), tra cứu trực tiếp theo API chi tiết bài hát
  if (songKey) {
    try {
      const res = await fetch(`https://graph.nhaccuatui.com/api/v1/song/detail/${songKey}`)
      if (res.ok) {
        const data = await res.json()
        if (data?.data?.name && isSongNameMatch(data.data.name, songName)) {
          const img = data?.data?.image || data?.data?.thumbnail || data?.data?.cover || data?.data?.bgImage
          if (img) {
            const cleaned = cleanImageUrl(img)
            if (cleaned)
              return cleaned
          }
        }
      }
    }
    catch {}
  }

  // 2. Tìm kiếm theo từ khóa bài hát và ca sĩ (quét tối đa 5 kết quả)
  const queries = [
    `${songName} ${artists}`.trim(),
    songName.trim(),
  ]

  if (songName.includes('/')) {
    const parts = songName.split('/').map(p => p.trim()).filter(Boolean)
    for (const part of parts) {
      if (part && !queries.includes(part)) {
        queries.push(`${part} ${artists}`.trim())
        queries.push(part)
      }
    }
  }

  for (const q of queries) {
    if (!q)
      continue
    try {
      const url = `https://graph.nhaccuatui.com/api/v1/search/song?keyword=${encodeURIComponent(q)}&pageindex=1&pagesize=5&correct=false`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: q, pageindex: 1, pagesize: 5 }),
      })

      if (!res.ok)
        continue
      const data = await res.json()
      interface NctApiSong {
        name?: string
        image?: string
      }
      const songs: NctApiSong[] = data?.data?.songs || []
      if (songs.length === 0)
        continue

      // Ưu tiên 1: Khớp CHÍNH XÁC 100% tên bài hát (tránh lấy nhầm bản khác năm/khác album)
      const exactMatch = songs.find(
        s => s?.name && s.name.trim().toLowerCase() === songName.trim().toLowerCase(),
      )
      if (exactMatch?.image) {
        const cleaned = cleanImageUrl(exactMatch.image)
        if (cleaned)
          return cleaned
      }

      // Ưu tiên 2: Khớp tên bài hát tương đối
      for (const s of songs) {
        if (s?.name && isSongNameMatch(s.name, songName) && s.image) {
          const cleaned = cleanImageUrl(s.image)
          if (cleaned)
            return cleaned
        }
      }

      // Fallback kết quả đầu tiên
      if (songs[0]?.image) {
        const cleaned = cleanImageUrl(songs[0].image)
        if (cleaned)
          return cleaned
      }
    }
    catch {}
  }

  return null
}

// ==========================================
// LẤY ẢNH BÀI HÁT TỐI ƯU ĐA NGUỒN
// ==========================================

async function getSongImage(
  player: Element | null,
  songName: string,
  artists: string,
): Promise<string> {
  const songKey = `${songName} - ${artists}`.trim()

  // 1. Kiểm tra bộ nhớ đệm (Cache) cho chính bài hát này
  if (songKey && songCoverCache.has(songKey)) {
    const cached = songCoverCache.get(songKey)
    if (cached)
      return cached
  }

  // 2. Lấy từ Pinia qua data attribute do Injected Script đồng bộ
  // QUAN TRỌNG: Phải xác thực tên bài hát từ Pinia khớp với bài hát hiện tại
  const piniaSongName = document.documentElement.getAttribute('data-nct-song-name')
  const piniaCover = cleanImageUrl(
    document.documentElement.getAttribute('data-nct-song-cover'),
  )

  if (piniaCover && piniaSongName && isSongNameMatch(piniaSongName, songName)) {
    if (songKey)
      songCoverCache.set(songKey, piniaCover)
    return piniaCover
  }

  // 3. Trích xuất trực tiếp từ màn hình Lời bài hát toàn màn hình (.full-screen-wrap)
  if (typeof document !== 'undefined') {
    const fullScreenWrap = document.querySelector<HTMLElement>('.full-screen-wrap')
    if (fullScreenWrap) {
      // Xác nhận tên bài hát trên full-screen khớp với bài đang được truy vấn
      // để tránh lấy ảnh bìa của bài cũ khi UI đang chuyển tiếp
      const fsTitle = fullScreenWrap.querySelector('.song-title, .music-info .name')?.textContent?.trim() || ''
      const fsTitleValid = !fsTitle || isSongNameMatch(fsTitle, songName)

      if (fsTitleValid) {
        // 3.1. Lấy từ CSS variable --bg-image được gán trực tiếp trên .full-screen-wrap
        const rawStyle = fullScreenWrap.getAttribute('style') || ''
        const bgMatch = rawStyle.match(/--bg-image\s*:\s*url\(['"]?(.*?)['"]?\)/)
          || rawStyle.match(/background[^:]*:\s*url\(['"]?(.*?)['"]?\)/)
        if (bgMatch?.[1]) {
          const cleaned = cleanImageUrl(bgMatch[1])
          if (cleaned) {
            if (songKey)
              songCoverCache.set(songKey, cleaned)
            return cleaned
          }
        }

        // 3.2. Lấy từ thẻ img bên trong khung toàn màn hình
        const fsImgs = fullScreenWrap.querySelectorAll<HTMLImageElement>('img')
        for (const img of Array.from(fsImgs)) {
          const candidate = cleanImageUrl(
            img.currentSrc
            || img.src
            || img.getAttribute('data-src')
            || img.getAttribute('data-real-src'),
          )
          if (candidate) {
            if (songKey)
              songCoverCache.set(songKey, candidate)
            return candidate
          }
        }
      }
    }
  }

  // 4. Lấy từ thẻ meta og:image trên trang nếu tên bài hát trên trang khớp
  if (typeof document !== 'undefined') {
    const ogImg = cleanImageUrl(
      document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content,
    )
    if (ogImg && document.title && isSongNameMatch(document.title, songName)) {
      if (songKey)
        songCoverCache.set(songKey, ogImg)
      return ogImg
    }
  }

  // 5. Lấy từ MediaSession metadata (chỉ dùng nếu tiêu đề khớp)
  if ('mediaSession' in navigator && navigator.mediaSession?.metadata) {
    const meta = navigator.mediaSession.metadata
    if (meta.title && isSongNameMatch(meta.title, songName) && meta.artwork?.length) {
      for (let i = meta.artwork.length - 1; i >= 0; i--) {
        const candidate = cleanImageUrl(meta.artwork[i]?.src)
        if (candidate) {
          if (songKey)
            songCoverCache.set(songKey, candidate)
          return candidate
        }
      }
    }
  }

  // 6. Nếu tab đang mở trực tiếp (visible), lấy ảnh từ thẻ img trong Player hoặc trên trang
  const isTabVisible = typeof document === 'undefined' || document.visibilityState === 'visible'

  if (isTabVisible && player) {
    const playerImgs = player.querySelectorAll<HTMLImageElement>(
      '.music-cover img, .cover-wrap img, .nct-cover-img img, img.cover-media',
    )

    for (const img of Array.from(playerImgs)) {
      const candidate = cleanImageUrl(
        img.getAttribute('data-real-src')
        || img.currentSrc
        || img.src
        || img.getAttribute('data-src')
        || img.getAttribute('data-original'),
      )
      if (candidate) {
        if (songKey)
          songCoverCache.set(songKey, candidate)
        return candidate
      }
    }

    const pageImgs = document.querySelectorAll<HTMLImageElement>(
      '.cover-media, .song-info img, .album-cover img, .banner-img-wrap img',
    )

    for (const img of Array.from(pageImgs)) {
      const candidate = cleanImageUrl(
        img.currentSrc
        || img.src
        || img.getAttribute('data-src'),
      )
      if (candidate) {
        if (songKey)
          songCoverCache.set(songKey, candidate)
        return candidate
      }
    }
  }

  // 7. Tìm kiếm trực tiếp qua API chính thức của NhacCuaTui (graph.nhaccuatui.com)
  const currentKey = (typeof document !== 'undefined' && document.documentElement
    ? document.documentElement.getAttribute('data-nct-song-key')
    : null) || getKeyFromUrl()

  // Tránh gọi API nếu đã có trong cache (do bài hát mới chưa cập nhật key)
  if (!songCoverCache.has(songKey)) {
    const apiCover = await fetchSongCoverFromApi(songName, artists, currentKey)
    if (apiCover) {
      if (songKey)
        songCoverCache.set(songKey, apiCover)
      return apiCover
    }
  }

  // Fallback về Logo chính thức 512x512
  return NCT_LOGO
}

// ==========================================
// LẤY THÔNG TIN BÀI HÁT VÀ CA SĨ
// ==========================================

function getSongInfo(player: Element | null): {
  songName: string
  artists: string
  album: string
} {
  let songName = ''
  let artists = ''

  // 1. Đọc từ DOM thanh phát nhạc hoặc màn hình toàn màn hình lời bài hát (.full-screen-wrap)
  const activeContainer = (typeof document !== 'undefined' ? document.querySelector('.full-screen-wrap') : null) || player

  if (activeContainer) {
    const nameEl = activeContainer.querySelector('.song-title, .music-info .name, .music-info .song-name')
    if (nameEl) {
      const text = nameEl.textContent?.trim() || ''
      // Bỏ qua các text mặc định khi chưa phát bài nào
      if (
        text
        && !text.toLowerCase().includes('choose a song')
        && !text.toLowerCase().includes('chọn bài hát')
      ) {
        songName = text
      }
    }

    // Chỉ lấy các thẻ chứa tên ca sĩ
    let artistEls = activeContainer.querySelectorAll('.music-info .artist .name-text, .full-screen-wrap .name-text')
    if (artistEls.length === 0) {
      artistEls = activeContainer.querySelectorAll('.music-info .artist a, .full-screen-wrap .artist a, [data-source] a')
    }
    if (artistEls.length === 0) {
      artistEls = activeContainer.querySelectorAll('.music-info .artist .item-row')
    }

    if (artistEls.length > 0) {
      const uniqueArtists = new Set<string>()
      for (const el of Array.from(artistEls)) {
        const name = el.textContent?.trim().replace(/^,\s*|\s*,$/g, '')
        if (name) {
          uniqueArtists.add(name)
        }
      }
      artists = Array.from(uniqueArtists).join(', ')
    }
    else {
      const artistContainer = activeContainer.querySelector('.music-info .artist, .artist')
      if (artistContainer) {
        artists = artistContainer.textContent?.trim() || ''
      }
    }
  }

  let album = ''

  // 2. Fallback Pinia Injected Attributes nếu DOM chưa render
  if (!songName) {
    const piniaName = document.documentElement.getAttribute('data-nct-song-name')
    if (piniaName)
      songName = piniaName.trim()
  }
  if (!artists) {
    const piniaArtist = document.documentElement.getAttribute('data-nct-song-artist')
    if (piniaArtist)
      artists = piniaArtist.trim()
  }

  // 3. Fallback MediaSession API
  if ('mediaSession' in navigator && navigator.mediaSession?.metadata) {
    const meta = navigator.mediaSession.metadata
    if (!songName && meta.title) {
      songName = meta.title.trim()
    }
    if (!artists && meta.artist) {
      artists = meta.artist.trim()
    }
    if (meta.album) {
      album = meta.album.trim()
    }
  }

  // 4. Fallback tiêu đề trang (Document Title)
  if (!songName && document.title) {
    const cleanTitle = document.title
      .replace(/\s*\|\s*NhacCuaTui.*$/i, '')
      .replace(/\s*-\s*NhacCuaTui.*$/i, '')
      .trim()

    if (cleanTitle && !cleanTitle.toLowerCase().includes('nghe nhạc')) {
      const parts = cleanTitle.split(/\s*-\s*/)
      if (parts.length >= 2 && parts[0]) {
        songName = parts[0].trim()
        if (!artists)
          artists = parts.slice(1).join(' - ').trim()
      }
      else {
        songName = cleanTitle
      }
    }
  }

  // 5. Lọc trùng lặp ca sĩ
  if (artists) {
    const list = artists
      .split(/[,;&]/)
      .map(a => a.trim())
      .filter(Boolean)
    const unique = Array.from(new Set(list))
    artists = unique.join(', ')
  }

  return { songName, artists, album }
}

// ==========================================
// KIỂM TRA TRẠNG THÁI PHÁT NHẠC
// ==========================================

function checkIsPlaying(
  audio: HTMLAudioElement | null,
  player: Element | null,
): boolean {
  // Kiểm tra audio element
  if (audio && !audio.paused && !audio.ended && audio.currentTime > 0) {
    return true
  }

  // Kiểm tra icon nút Play/Pause trên thanh điều khiển
  if (player) {
    const playBtn = player.querySelector('.play-btn')
    if (playBtn) {
      const useTag = playBtn.querySelector('use')
      const iconHref
        = useTag?.getAttribute('xlink:href')
          || useTag?.getAttribute('href')
          || ''

      if (iconHref.includes('pause')) {
        return true
      }
      if (iconHref.includes('play')) {
        return false
      }
    }
  }

  // Kiểm tra MediaSession
  if ('mediaSession' in navigator && navigator.mediaSession?.playbackState === 'playing') {
    return true
  }

  return false
}

// ==========================================
// LẤY LINK BÀI HÁT TRỰC TIẾP
// ==========================================

function getSongUrl(): string | null {
  const key = document.documentElement.getAttribute('data-nct-song-key')
  if (key) {
    return `https://www.nhaccuatui.com/song/${key}`
  }

  if (typeof window !== 'undefined' && window.location) {
    const path = window.location.pathname
    if (path.includes('/bai-hat/') || path.includes('/song/')) {
      return window.location.href
    }
  }

  return null
}

// ==========================================
// PRESENCE DUYỆT WEB
// ==========================================

function getBrowsingPresence(): PresenceData {
  return {
    type: ActivityType.Listening,
    name: 'NhacCuaTui',
    details: 'Browsing NhacCuaTui',
    largeImageKey: NCT_LOGO,
    largeImageText: 'NhacCuaTui',
    startTimestamp: browsingTimestamp,
  }
}

// ==========================================
// UPDATE PRESENCE
// ==========================================

presence.on('UpdateData', async () => {
  // Tiêm helper để đọc dữ liệu Vue/Pinia khi tab ở background
  injectPageHelper()

  // Lấy các thiết lập tùy biến từ người dùng
  const [privacy, showCover, showTimestamps, showButtons, showBrowsing]
    = await Promise.all([
      presence.getSetting<boolean>('privacy').catch(() => false),
      presence.getSetting<boolean>('showCover').catch(() => true),
      presence.getSetting<boolean>('showTimestamps').catch(() => true),
      presence.getSetting<boolean>('showButtons').catch(() => true),
      presence.getSetting<boolean>('showBrowsing').catch(() => true),
    ])

  // Player và Audio elements
  const player = document.querySelector('.full-screen-wrap, .music-player-wrap')
  const audio
    = document.querySelector<HTMLAudioElement>('audio.audio')
      ?? document.querySelector<HTMLAudioElement>('audio')

  // Lấy thông tin bài hát
  const { songName, artists, album } = getSongInfo(player)

  // Nếu không có bài hát đang được chọn/phát
  if (!songName) {
    if (showBrowsing) {
      presence.setActivity(getBrowsingPresence())
    }
    else {
      presence.clearActivity()
    }
    return
  }

  // Xác định trạng thái đang phát hay tạm dừng
  const isPlaying = checkIsPlaying(audio, player)
  const isPaused = !isPlaying

  const hasValidDuration
    = Boolean(audio) && Number.isFinite(audio!.duration) && audio!.duration > 0

  const currentTime = audio ? formatTime(audio.currentTime) : '0:00'
  const duration = hasValidDuration ? formatTime(audio!.duration) : '0:00'

  // Lấy ảnh bìa bài hát (hỗ trợ đọc khi tab chạy ngầm, xác thực tên bài và API fallback)
  const songImage = showCover ? await getSongImage(player, songName, artists) : NCT_LOGO

  // Tạo Presence Data
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    name: 'NhacCuaTui',

    // Dòng 1: Tên bài hát (Hỗ trợ chế độ riêng tư)
    details: privacy ? 'Listening to music' : songName,

    // Dòng 2: Tên ca sĩ
    state: privacy
      ? undefined
      : isPaused
        ? `${artists || 'Unknown artist'} • ⏸️ ${currentTime} / ${duration}`
        : artists || 'Unknown artist',

    // Ảnh lớn
    largeImageKey: songImage,

    smallImageKey: isPaused ? Assets.Pause : Assets.Play,
    smallImageText: isPaused ? `Paused at ${currentTime}` : 'Listening',
  }

  // Dòng 3 (largeImageText): Nếu có Album khác tên bài hát thì hiển thị,
  // còn không thì KHÔNG đặt để tránh Discord in lại tên bài hát ở dòng dưới!
  if (album && album.toLowerCase() !== songName.toLowerCase()) {
    presenceData.largeImageText = album
  }

  // Nút liên kết trực tiếp bài hát (chỉ hiện khi có link trực tiếp của bài hát, không link về trang chủ)
  const songUrl = getSongUrl()
  if (!privacy && songUrl) {
    presenceData.largeImageUrl = songUrl
    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Listen on NhacCuaTui',
          url: songUrl,
        },
      ]
    }
  }

  // Thời gian (nếu đang phát và được bật)
  if (!isPaused && hasValidDuration && showTimestamps && !privacy) {
    [presenceData.startTimestamp, presenceData.endTimestamp]
      = getTimestampsFromMedia(audio!)
  }

  presence.setActivity(presenceData)
})
