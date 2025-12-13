import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1449091694329860106',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn2.steamgriddb.com/icon_thumb/a0e7be097b3b5eb71d106dd32f2312ac.png',
}

function extractAnimeName(pathname: string): string | null {
  let slug = pathname.replace(/\/+$/, '')

  if (slug.startsWith('/watch/')) {
    slug = slug.split('/watch/')[1] || ''
  }
  else if (slug.startsWith('/')) {
    slug = slug.slice(1);
  }

  if (!slug)
    return null

  const withoutTrailing = (slug.split(/[?#]/)[0] || '').replace(/-\d+$/, '')

  if (!withoutTrailing)
    return null

  return decodeURIComponent(withoutTrailing)
}

function toTitleCaseFromSlug(slug: string) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function extractEpisodeNumber(): string | null {
  const serverNoticeDiv = document.querySelector('.server-notice');

  if (!serverNoticeDiv) {
    return null;
  }

  const episodeTag = serverNoticeDiv.querySelector('b');

  if (!episodeTag) {
    return null;
  }

  const episodeText = episodeTag.textContent;

  if (episodeText) {
    return episodeText.trim();
  }

  return null;
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    details: null,
    state: null,
    largeImageText: 'HiAnime - Watch Anime Online',
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Search
  }

  switch (true) {
    case normalizedPath === '/home':
      presenceData.details = '🏠 Browsing Home'
      presenceData.state = 'Exploring anime collection'
      presenceData.smallImageKey = Assets.Search
      break

    case normalizedPath.startsWith('/watch/'): {
      const animeSlug = extractAnimeName(pathname)
      const img = document.querySelector<HTMLImageElement>('.film-poster-img')
      const animeTitle = animeSlug ? toTitleCaseFromSlug(animeSlug) : 'Unknown Anime'
      const episode = extractEpisodeNumber()

      if (img?.src) {
        presenceData.largeImageKey = img.src
        presenceData.largeImageText = animeTitle
      }

      presenceData.details = `📺 ${animeTitle}`
      presenceData.type = ActivityType.Watching
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Watching'

      if (episode) {
        presenceData.state = `Watching ${episode}`
      } else {
        presenceData.state = 'Watching'
      }
      break
    }

    case normalizedPath.startsWith('/user/profile'): {
      const img = document.querySelector<HTMLImageElement>('#preview-avatar')
      const username = document.querySelector('.profile-username')?.textContent?.trim()

      if (img?.src) {
        presenceData.largeImageKey = img.src
        presenceData.largeImageText = username || 'User Profile'
      }

      presenceData.details = '👤 Viewing Profile'
      presenceData.state = username || 'User Profile'
      presenceData.smallImageKey = Assets.Search
      break
    }

    case normalizedPath.startsWith('/genre/'):
    case normalizedPath.startsWith('/category/'): {
      const genreName = pathname.split('/').pop()?.replace(/-/g, ' ')
      const formattedGenre = genreName
        ? genreName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Genre'

      presenceData.details = '🎭 Browsing Genre'
      presenceData.state = formattedGenre
      presenceData.smallImageKey = Assets.Search
      break
    }

    case normalizedPath.startsWith('/search'): {
      const searchQuery = new URLSearchParams(window.location.search).get('keyword')
      presenceData.details = '🔍 Searching'
      presenceData.state = searchQuery ? `"${searchQuery}"` : 'For anime...'
      presenceData.smallImageKey = Assets.Search
      break
    }

    case normalizedPath.startsWith('/az-list'):
      presenceData.details = '📑 Browsing A-Z List'
      presenceData.state = 'All anime titles'
      presenceData.smallImageKey = Assets.Search
      break

    default: {
      if (normalizedPath === '/' || normalizedPath === '') {
        presenceData.details = '🏠 On Homepage'
        presenceData.state = 'Browsing HiAnime'
        presenceData.smallImageKey = Assets.Search
        break
      }

      const animeSlug = extractAnimeName(pathname)
      const animeTitle = animeSlug ? toTitleCaseFromSlug(animeSlug) : null

      if (animeTitle) {
        const img = document.querySelector<HTMLImageElement>('.film-poster-img')
        if (img?.src) {
          presenceData.largeImageKey = img.src
          presenceData.largeImageText = animeTitle
        }

        presenceData.details = `📖 ${animeTitle}`
        presenceData.state = 'Viewing anime details'
        presenceData.smallImageKey = Assets.Search
      } else {
        presenceData.details = '🌐 Browsing HiAnime'
        presenceData.state = 'Exploring content'
        presenceData.smallImageKey = Assets.Search
      }
      break
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
})