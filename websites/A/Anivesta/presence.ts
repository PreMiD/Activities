import { ActivityType, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '1323996217675616321',
})

enum ActivityAssets {
  Logo = 'https://anivesta.com/assets/logo-bg.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const showButtons = (await presence.getSetting<boolean>('showButtons')) ?? true
  const showCover = (await presence.getSetting<boolean>('showCover')) ?? true

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Anivesta - Anime İzle & Topluluk',
  }

  // 1. Sayfada tanımlı yapısal veriyi oku
  let metaData: any = null
  const scriptEl = document.getElementById('anivesta-presence-data')
  if (scriptEl && scriptEl.textContent) {
    try {
      metaData = JSON.parse(scriptEl.textContent)
    }
    catch {}
  }

  const path = document.location.pathname

  // 2. BÖLÜM İZLEME SAYFASI (/watch/...)
  if (path.startsWith('/watch') || metaData?.type === 'watching') {
    const mediaState = document.getElementById('anivesta-media-state')
    const playbackEl = document.getElementById('wpPlaybackProgress')

    const animeTitle
      = metaData?.anime
        || playbackEl?.dataset?.animeTitle
        || document.querySelector('.wp-anime-title')?.textContent?.trim()
        || 'Anime'

    const seasonNum = Number.parseInt(
      metaData?.season || playbackEl?.dataset?.season || '1',
      10,
    )
    const episodeNum = Number.parseInt(
      metaData?.episode || playbackEl?.dataset?.episodeNumber || '1',
      10,
    )
    const posterUrl
      = metaData?.poster
        || playbackEl?.dataset?.animeImage
        || ActivityAssets.Logo
    const currentUrl = metaData?.url || document.location.href
    const animeSlug = playbackEl?.dataset?.animeSlug
    const animeUrl = metaData?.animeUrl || (animeSlug ? `https://anivesta.com/anime/${animeSlug}` : null)

    const isPaused = mediaState?.dataset?.status === 'paused'
    const currentTime = Number.parseFloat(
      mediaState?.dataset?.currentTime || playbackEl?.dataset?.currentTime || '0',
    )
    const duration = Number.parseFloat(
      mediaState?.dataset?.duration || playbackEl?.dataset?.duration || '1440',
    )

    presenceData.type = ActivityType.Watching
    presenceData.details = animeTitle
    presenceData.state
      = seasonNum > 1
        ? `${seasonNum}. Sezon ${episodeNum}. Bölüm`
        : `${episodeNum}. Bölüm`

    if (showCover && posterUrl) {
      presenceData.largeImageKey = posterUrl
      presenceData.largeImageText = animeTitle
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = isPaused ? 'Duraklatıldı' : 'Anivesta'
    }
    else {
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.largeImageText = animeTitle
    }

    if (!isPaused && duration > 0 && currentTime < duration) {
      const timestamps = getTimestamps(currentTime, duration)
      presenceData.startTimestamp = timestamps[0]
      presenceData.endTimestamp = timestamps[1]
    }
    else if (isPaused) {
      presenceData.smallImageText = 'Duraklatıldı'
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Anivesta\'da İzle',
          url: currentUrl,
        },
      ]

      if (animeUrl) {
        presenceData.buttons.push({
          label: 'Anime Sayfası',
          url: animeUrl,
        })
      }
    }
  }
  // 3. ANİME DETAY SAYFASI (/anime/...)
  else if (path.startsWith('/anime') && !path.includes('/bolumler')) {
    const animeTitle
      = metaData?.anime
        || document.querySelector('.ad-title')?.textContent?.trim()
        || 'Anime Detayı'
    const posterUrl
      = metaData?.poster
        || document.querySelector('.ad-poster-img')?.getAttribute('src')
        || ActivityAssets.Logo

    presenceData.type = ActivityType.Watching
    presenceData.details = animeTitle
    presenceData.state = 'Animeyi İnceliyor'

    if (showCover && posterUrl) {
      presenceData.largeImageKey = posterUrl
      presenceData.largeImageText = animeTitle
      presenceData.smallImageKey = ActivityAssets.Logo
      presenceData.smallImageText = 'Anivesta'
    }
    else {
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.largeImageText = animeTitle
    }

    presenceData.startTimestamp = browsingTimestamp

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Animeyi İncele',
          url: document.location.href,
        },
      ]
    }
  }
  // 4. TOPLULUK & FORUM SAYFALARI (/social)
  else if (path.startsWith('/social')) {
    if (metaData?.type === 'community_topic' || path.includes('/topic/')) {
      const topicTitle
        = metaData?.title
          || document.querySelector('.thread-header-card h1')?.textContent?.trim()
          || 'Forum Tartışması'
      presenceData.details = 'Toplulukta Tartışıyor'
      presenceData.state
        = topicTitle.length > 30
          ? `${topicTitle.slice(0, 27)}...`
          : topicTitle
    }
    else {
      presenceData.details = 'Topluluk & Forum'
      presenceData.state
        = metaData?.category
          ? `${metaData.category} Kategorisinde`
          : 'Konuları Keşfediyor'
    }

    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.largeImageText = 'Anivesta Topluluk'
    presenceData.startTimestamp = browsingTimestamp

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Topluluğa Katıl',
          url: document.location.href,
        },
      ]
    }
  }
  // 5. KEŞFET & ARAMA (/kesfet veya ?q=)
  else if (path.includes('/kesfet') || document.location.search.includes('q=')) {
    presenceData.details = 'Anime Keşfediyor'
    presenceData.state = 'Katalogda Arama Yapıyor'
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.largeImageText = 'Anivesta'
    presenceData.startTimestamp = browsingTimestamp
  }
  // 6. ANASAYFA & GENEL GEZİNTİ
  else {
    presenceData.details = 'Anasayfada Geziniyor'
    presenceData.state = 'Anime Dünyasını Keşfediyor'
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.largeImageText = 'Anivesta'
    presenceData.startTimestamp = browsingTimestamp

    if (showButtons) {
      presenceData.buttons = [
        {
          label: 'Siteyi Ziyaret Et',
          url: 'https://anivesta.com',
        },
      ]
    }
  }

  presence.setActivity(presenceData)
})
