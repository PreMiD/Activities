import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1548362846558228500',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const NCT_LOGO = 'https://files.catbox.moe/eha3a5.png'

const songCoverCache = new Map<string, string>()

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]/g, '')
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

// Inject script vao page (main world) de doc Pinia va goi API khong bi CORS
// fetch tu content script bi block vi origin la chrome-extension://
// fetch tu injected script chay voi origin nhaccuatui.com => khong bi block
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
                if (store && store.currentMusicInfo && store.currentMusicInfo.name) return store;
                for (const s of pinia._s.values()) {
                  if (s && s.currentMusicInfo && s.currentMusicInfo.name) return s;
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
                if (store && store.currentMusicInfo && store.currentMusicInfo.name) return store;
              }
            }
          } catch {}
          return null;
        }

        function isValidCover(url) {
          if (!url || typeof url !== 'string') return false;
          if (url.startsWith('data:') || url.startsWith('blob:')) return false;
          if (url.includes('default-song-img') || url.includes('default-topic-img') ||
              url.includes('default-artist-img') || url.includes('1x1') ||
              url.includes('nct-share.png')) return false;
          return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
        }

        var fetchingKey = null;
        function fetchCoverFromApi(songKey, songName, artistStr) {
          if (!songKey || fetchingKey === songKey) return;
          fetchingKey = songKey;
          var targetKey = songKey;
          fetch('https://graph.nhaccuatui.com/api/v1/song/detail/' + songKey)
            .then(function(r) { return r.ok ? r.json() : null; })
            .then(function(data) {
              var img = data && data.data && (data.data.image || data.data.bgImage || data.data.thumbnail);
              if (isValidCover(img)) {
                if (document.documentElement.getAttribute('data-nct-song-key') === targetKey)
                  document.documentElement.setAttribute('data-nct-song-cover', img);
                return;
              }
              var q = (songName + ' ' + (artistStr || '')).trim();
              return fetch(
                'https://graph.nhaccuatui.com/api/v1/search/song?keyword=' + encodeURIComponent(q) + '&pageindex=1&pagesize=5&correct=false',
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword: q, pageindex: 1, pagesize: 5 }) }
              ).then(function(r) { return r.ok ? r.json() : null; })
               .then(function(data) {
                 var songs = (data && data.data && data.data.songs) || [];
                 for (var i = 0; i < songs.length; i++) {
                   var sImg = songs[i] && (songs[i].image || songs[i].bgImage);
                   if (isValidCover(sImg)) {
                     if (document.documentElement.getAttribute('data-nct-song-key') === targetKey)
                       document.documentElement.setAttribute('data-nct-song-cover', sImg);
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
              if (currentKey && currentKey !== lastSyncedKey) {
                document.documentElement.removeAttribute('data-nct-song-cover');
                lastSyncedKey = currentKey;
                fetchingKey = null;
              }
              document.documentElement.setAttribute('data-nct-song-name', cur.name || '');
              if (currentKey) document.documentElement.setAttribute('data-nct-song-key', currentKey);
              let artistStr = '';
              if (typeof cur.artist === 'string') artistStr = cur.artist;
              else if (Array.isArray(cur.artist))
                artistStr = cur.artist.map(function(a) { return (a && a.name) || ''; }).filter(Boolean).join(', ');
              if (artistStr) document.documentElement.setAttribute('data-nct-song-artist', artistStr);
              const cover = cur.image || cur.thumbnail || cur.cover || cur.avatar || cur.bgImage || '';
              if (isValidCover(cover)) {
                document.documentElement.setAttribute('data-nct-song-cover', cover);
              } else if (currentKey && !document.documentElement.getAttribute('data-nct-song-cover')) {
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

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0)
    return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url)
    return null
  let trimmed = url.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:'))
    return null
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
  if (trimmed.startsWith('//'))
    trimmed = `https:${trimmed}`
  else if (trimmed.startsWith('/'))
    trimmed = `https://www.nhaccuatui.com${trimmed}`
  return trimmed.startsWith('https://') || trimmed.startsWith('http://')
    ? trimmed
    : null
}

async function getSongImage(
  player: Element | null,
  songName: string,
  artists: string,
): Promise<string> {
  const cacheKey = `${songName} - ${artists}`.trim()

  if (cacheKey && songCoverCache.has(cacheKey)) {
    const cached = songCoverCache.get(cacheKey)
    if (cached)
      return cached
  }

  // Pinia cover (set boi injected script, bao gom ca ket qua tu API)
  const piniaSongName = document.documentElement.getAttribute('data-nct-song-name')
  const piniaCover = cleanImageUrl(
    document.documentElement.getAttribute('data-nct-song-cover'),
  )
  if (piniaCover && piniaSongName && isSongNameMatch(piniaSongName, songName)) {
    if (cacheKey)
      songCoverCache.set(cacheKey, piniaCover)
    return piniaCover
  }

  // MediaSession
  if ('mediaSession' in navigator && navigator.mediaSession?.metadata) {
    const meta = navigator.mediaSession.metadata
    if (meta.title && isSongNameMatch(meta.title, songName) && meta.artwork?.length) {
      for (let i = meta.artwork.length - 1; i >= 0; i--) {
        const candidate = cleanImageUrl(meta.artwork[i]?.src)
        if (candidate) {
          if (cacheKey)
            songCoverCache.set(cacheKey, candidate)
          return candidate
        }
      }
    }
  }

  // DOM player img (chi khi tab visible)
  if (document.visibilityState === 'visible' && player) {
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
        if (cacheKey)
          songCoverCache.set(cacheKey, candidate)
        return candidate
      }
    }
  }

  return NCT_LOGO
}

function getSongInfo(player: Element | null): {
  songName: string
  artists: string
  album: string
} {
  let songName = ''
  let artists = ''

  if (player) {
    const nameEl = player.querySelector('.music-info .name, .music-info .song-name')
    if (nameEl) {
      const text = nameEl.textContent?.trim() || ''
      if (text && !text.toLowerCase().includes('choose a song') && !text.toLowerCase().includes('chon bai hat'))
        songName = text
    }

    let artistEls = player.querySelectorAll('.music-info .artist .name-text')
    if (artistEls.length === 0)
      artistEls = player.querySelectorAll('.music-info .artist a')
    if (artistEls.length === 0)
      artistEls = player.querySelectorAll('.music-info .artist .item-row')

    if (artistEls.length > 0) {
      const uniqueArtists = new Set<string>()
      for (const el of Array.from(artistEls)) {
        const name = el.textContent?.trim().replace(/^,\s*|\s*,$/g, '')
        if (name)
          uniqueArtists.add(name)
      }
      artists = Array.from(uniqueArtists).join(', ')
    }
    else {
      const artistContainer = player.querySelector('.music-info .artist')
      if (artistContainer)
        artists = artistContainer.textContent?.trim() || ''
    }
  }

  let album = ''

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

  if ('mediaSession' in navigator && navigator.mediaSession?.metadata) {
    const meta = navigator.mediaSession.metadata
    if (!songName && meta.title)
      songName = meta.title.trim()
    if (!artists && meta.artist)
      artists = meta.artist.trim()
    if (meta.album)
      album = meta.album.trim()
  }

  if (!songName && document.title) {
    const cleanTitle = document.title
      .replace(/\s*\|\s*NhacCuaTui.*$/i, '')
      .replace(/\s*-\s*NhacCuaTui.*$/i, '')
      .trim()
    if (cleanTitle && !cleanTitle.toLowerCase().includes('nghe nhac')) {
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

  if (artists) {
    const list = artists.split(/[,;&]/).map(a => a.trim()).filter(Boolean)
    artists = Array.from(new Set(list)).join(', ')
  }

  return { songName, artists, album }
}

function checkIsPlaying(
  audio: HTMLAudioElement | null,
  player: Element | null,
): boolean {
  if (audio && !audio.paused && !audio.ended && audio.currentTime > 0)
    return true

  if (player) {
    const playBtn = player.querySelector('.play-btn')
    if (playBtn) {
      const useTag = playBtn.querySelector('use')
      const iconHref = useTag?.getAttribute('xlink:href') || useTag?.getAttribute('href') || ''
      if (iconHref.includes('pause'))
        return true
      if (iconHref.includes('play'))
        return false
    }
  }

  if ('mediaSession' in navigator && navigator.mediaSession?.playbackState === 'playing')
    return true

  return false
}

function getSongUrl(): string | null {
  const key = document.documentElement.getAttribute('data-nct-song-key')
  if (key)
    return `https://www.nhaccuatui.com/song/${key}`
  if (typeof window !== 'undefined' && window.location) {
    const path = window.location.pathname
    if (path.includes('/bai-hat/') || path.includes('/song/'))
      return window.location.href
  }
  return null
}

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

presence.on('UpdateData', async () => {
  injectPageHelper()

  const [privacy, showCover, showTimestamps, showButtons, showBrowsing]
    = await Promise.all([
      presence.getSetting<boolean>('privacy').catch(() => false),
      presence.getSetting<boolean>('showCover').catch(() => true),
      presence.getSetting<boolean>('showTimestamps').catch(() => true),
      presence.getSetting<boolean>('showButtons').catch(() => true),
      presence.getSetting<boolean>('showBrowsing').catch(() => true),
    ])

  const player = document.querySelector('.music-player-wrap')
  const audio
    = document.querySelector<HTMLAudioElement>('audio.audio')
      ?? document.querySelector<HTMLAudioElement>('audio')

  const { songName, artists, album } = getSongInfo(player)

  if (!songName) {
    if (showBrowsing)
      presence.setActivity(getBrowsingPresence())
    else
      presence.clearActivity()
    return
  }

  const isPlaying = checkIsPlaying(audio, player)
  const isPaused = !isPlaying
  const hasValidDuration = Boolean(audio) && Number.isFinite(audio!.duration) && audio!.duration > 0
  const currentTime = audio ? formatTime(audio.currentTime) : '0:00'
  const duration = hasValidDuration ? formatTime(audio!.duration) : '0:00'

  const songImage = showCover ? await getSongImage(player, songName, artists) : NCT_LOGO

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    name: 'NhacCuaTui',
    details: privacy ? 'Listening to music' : songName,
    state: privacy
      ? undefined
      : isPaused
        ? `${artists || 'Unknown artist'} • ⏸️ ${currentTime} / ${duration}`
        : artists || 'Unknown artist',
    largeImageKey: songImage,
    smallImageKey: isPaused ? Assets.Pause : Assets.Play,
    smallImageText: isPaused ? `Paused at ${currentTime}` : 'Listening',
  }

  if (album && album.toLowerCase() !== songName.toLowerCase())
    presenceData.largeImageText = album

  const songUrl = getSongUrl()
  if (!privacy && songUrl) {
    presenceData.largeImageUrl = songUrl
    if (showButtons) {
      presenceData.buttons = [{ label: 'Listen on NhacCuaTui', url: songUrl }]
    }
  }

  if (!isPaused && hasValidDuration && showTimestamps && !privacy)
    [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(audio!)

  presence.setActivity(presenceData)
})
