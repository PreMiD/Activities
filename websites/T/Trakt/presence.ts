import { ActivityType, Assets, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '968880591003082783',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

interface NowPlayingCache {
  key: string | null
  startedAt: number | null
  endedAt: number | null
}

let nowPlayingCache: NowPlayingCache = {
  key: null,
  startedAt: null,
  endedAt: null,
}

const ActivityAssets = {
  traktLogomark: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/logo.png',
  traktCirclemark: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/0.png',
  house: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/1.png',
  listCheck: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/2.png',
  calendarWeek: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/3.png',
  wandMagicSparkles: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/4.png',
  compass: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/5.png',
  arrowTrendUp: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/6.png',
  calendarDays: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/7.png',
  faceGrinHearts: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/8.png',
  users: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/9.png',
  userGear: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/10.png',
  userClock: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/11.png',
  userSecret: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/12.png',
  tv: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/13.png',
  film: 'https://cdn.rcd.gg/PreMiD/websites/T/Trakt/assets/14.png',
}

//* HELPERS

const truncate = (str: string, max = 128) => (str.length > max ? `${str.substring(0, max - 3)}...` : str)

function getMeta(property: string): string | null {
  return document.querySelector(`meta[property="${property}"]`)?.getAttribute('content') || null
}

function cleanTitle(rawTitle: string | null): string {
  if (!rawTitle)
    return ''

  return rawTitle
    .replace(/^Trakt Web\s*:\s*/i, '')
    .replace(/\s*[-–—]\s*Trakt$/i, '')
    .trim()
}

function setSmallIcon(data: PresenceData, key: string, text: string) {
  data.smallImageKey = key
  data.smallImageText = text
}

function pluralize(count: number, singular: string) {
  return `${count.toLocaleString()} ${count === 1 ? singular : `${singular}s`}`
}

function getProfileAvatar(): string | null {
  const avatarImg = document.querySelector<HTMLImageElement>('.trakt-profile-image img, .trakt-profile-button img')
  return avatarImg?.src || null
}

function getSummaryPosterImage(root: Document | Element = document): HTMLImageElement | null {
  const selectors = [
    '.episode-info-poster-ratings .trakt-summary-poster-container .trakt-summary-poster a img',
    '.episode-info-poster-ratings .trakt-summary-poster-container .trakt-summary-poster img',
    '.trakt-summary-poster-container .trakt-summary-poster a img',
    '.trakt-summary-poster-container .trakt-summary-poster img',
    '.trakt-summary-poster a img',
    '.trakt-summary-poster img',
  ]

  for (const selector of selectors) {
    const img = root.querySelector<HTMLImageElement>(selector)
    if (img?.src)
      return img
  }

  return null
}

function getPrimaryMediaImage(): string | null {
  const posterImg = document.querySelector<HTMLImageElement>('.trakt-summary-poster a img.image-loaded, .trakt-summary-poster a img, .trakt-summary-poster img.image-loaded, .trakt-summary-poster img')
  if (posterImg?.src)
    return posterImg.src

  const heroImg = document.querySelector<HTMLImageElement>('.trakt-summary-content a img.image-loaded, .trakt-summary-content a img, .trakt-summary-content img.image-loaded, .trakt-summary-content img')
  if (heroImg?.src && /images\//.test(heroImg.src))
    return heroImg.src

  return getMeta('og:image')?.replace('open-graph', 'story') || getMeta('og:image') || null
}

function getDisplayUsername(pathname: string): string {
  const rawUsername = pathname.split('/')[2] || 'a user'
  const loggedInUser = document.querySelector('.trakt-profile-link-username')?.textContent?.trim()?.toLowerCase()
  const urlUser = rawUsername.toLowerCase()

  if (urlUser === 'me' || (loggedInUser && urlUser === loggedInUser)) {
    return 'their'
  }
  return `${rawUsername}'s`
}

function parseItemCount(el: Element | null): number | null {
  if (!el)
    return null
  const text = el.getAttribute('title') || el.textContent || ''
  const match = text.match(/(\d+(?:,\d+)*)/)
  return match && match[1] ? Number.parseInt(match[1].replace(/,/g, ''), 10) : null
}

function extractTitleFromUrl(url: string): string {
  const match = url.match(/\/(?:shows|movies)\/([^/?]+)/)
  if (!match || !match[1])
    return ''
  return match[1]
    .replace(/-\d{4}$/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getCardTitle(card: Element | null, preferUrl = false): string {
  if (!card)
    return ''

  const linkHref = card.querySelector('a.trakt-link')?.getAttribute('href') || ''

  if (preferUrl) {
    const urlTitle = extractTitleFromUrl(linkHref)
    if (urlTitle)
      return urlTitle
  }

  const titleText = card.querySelector('.trakt-card-title')?.textContent?.trim()
  if (titleText)
    return titleText

  const altText = card.querySelector('img.trakt-card-cover-image')?.getAttribute('alt')
  if (altText) {
    return altText.replace(/^(?:Poster for\s+)?["']?|["']?\s*(?:poster)?$/gi, '').trim()
  }

  return !preferUrl ? extractTitleFromUrl(linkHref) : ''
}

function getCalendarDisplayWeekCount(root: Document | Element = document): number {
  //* <span class="week-count secondary svelte-1pl2gmz">10 Items</span>

  const text = root.querySelector('.week-count.secondary')?.textContent?.trim() ?? ''
  const match = text.match(/(\d+)/)
  const value = match?.[1]
  return value ? Number.parseInt(value, 10) : 0
}

function applyHistoryState(data: PresenceData, displayUsername = 'their') {
  data.details = `Checking ${displayUsername} history`
  setSmallIcon(data, ActivityAssets.userClock, 'History')

  const lastPlayed = getCardTitle(document.querySelector('.trakt-card'), true)
  data.state = lastPlayed ? `Last played: ${lastPlayed}` : 'Checking their watch history'
}

//* MAIN

try {
  if (window.self === window.top) {
    presence.on('UpdateData', async () => {
      const { pathname, search, href } = document.location

      const isHome = pathname === '/' || pathname === '/home'
      const isHistory = pathname === '/history'
      const isCalendar = pathname === '/calendar'
      const isRecommended = pathname === '/discover/recommended'
      const isReleases = pathname === '/discover/releases'
      const isAnticipated = pathname === '/discover/anticipated'
      const isPopular = pathname === '/discover/popular'
      const isTrending = pathname === '/discover' || pathname === '/discover/trending'
      const isProfile = pathname.startsWith('/users/') || pathname.startsWith('/profile/')
      const isPeople = pathname.startsWith('/people')
      const isSearch = pathname.startsWith('/search')
      const isMedia = pathname.startsWith('/shows') || pathname.startsWith('/movies')

      const presenceData: PresenceData = {
        largeImageKey: ActivityAssets.traktLogomark,
        startTimestamp: browsingTimestamp,
        type: ActivityType.Watching,
      }

      const showNowPlaying = await presence.getSetting<boolean>('showNowPlaying')
      const nowPlayingToast = document.querySelector('.trakt-now-playing-container')

      if (nowPlayingToast && showNowPlaying) {
        presenceData.statusDisplayType = StatusDisplayType.Details //* Show the media name instead of "Trakt" as the primary detail text

        const titleEl = nowPlayingToast.querySelector('.bold.ellipsis')
        const imgEl = nowPlayingToast.querySelector('img')
        const linkEl = nowPlayingToast.querySelector<HTMLAnchorElement>('a.trakt-link')
        const timeRemainingEl = nowPlayingToast.querySelector('.trakt-now-playing-remaining')
        const endsAtEl = nowPlayingToast.querySelector('.trakt-now-playing-ends-at')
        const progressBarEl = nowPlayingToast.querySelector('.trakt-distribution-bar')
        const imageUrl = imgEl?.src || (getMeta('og:image')?.replace('open-graph', 'story') ?? null) || ActivityAssets.traktLogomark

        //* Match TV toast titles like "S1 • E4 - Episode Title" or "S1E4 - Episode Title"
        const seasonEpisodePattern = /S(?<season>\d+)[\s•·-]*E(?<episode>\d+)/i

        let detailsText = titleEl?.textContent?.trim() || 'Media'

        const seMatch = detailsText.match(seasonEpisodePattern)
        const season = seMatch?.groups?.season
        const episode = seMatch?.groups?.episode
        const title = seMatch
          ? detailsText.slice(seMatch[0].length).replace(/^[\s:–—-]+/, '').trim()
          : detailsText

        if (season && episode && title) {
          detailsText = title
        }

        presenceData.details = truncate(detailsText)

        if (imageUrl) {
          presenceData.largeImageKey = imageUrl
          presenceData.largeImageText = season && episode
            ? `Season ${season}, Episode ${episode}`
            : truncate(detailsText)
        }

        if (linkEl?.href) {
          presenceData.buttons = [{ label: 'View on Trakt', url: linkEl.href }]
        }

        setSmallIcon(presenceData, (imageUrl !== ActivityAssets.traktLogomark) ? ActivityAssets.traktCirclemark : (season && episode ? ActivityAssets.tv : ActivityAssets.film), 'Now Playing')

        if (timeRemainingEl?.textContent) {
          let remainingSeconds = 0
          const hMatch = timeRemainingEl.textContent.match(/(\d+)h/i)
          const mMatch = timeRemainingEl.textContent.match(/(\d+)m/i)
          const sMatch = timeRemainingEl.textContent.match(/(\d+)s/i)

          if (hMatch && hMatch[1])
            remainingSeconds += Number.parseInt(hMatch[1], 10) * 60 * 60
          if (mMatch && mMatch[1])
            remainingSeconds += Number.parseInt(mMatch[1], 10) * 60
          if (sMatch && sMatch[1])
            remainingSeconds += Number.parseInt(sMatch[1], 10)

          const progressStyleValue = progressBarEl?.getAttribute('style')?.match(/--viz-fill:\s*([^;]+)/)?.[1]?.trim() ?? null
          const currentProgress = progressStyleValue
            ? Number.parseFloat(progressStyleValue.replace('%', ''))
            : Number.parseFloat(progressBarEl?.getAttribute('aria-valuenow') ?? '0')

          const elapsedSeconds = remainingSeconds / (100 - currentProgress) * currentProgress

          let endsAtTimestamp: number | null = null

          if (endsAtEl?.textContent) {
            const endsAtMatch = endsAtEl.textContent.match(/Ends at\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i)
            if (endsAtMatch) {
              const rawHours = endsAtMatch[1]
              const rawMinutes = endsAtMatch[2]
              const rawAmpm = endsAtMatch[3]

              if (rawHours && rawMinutes && rawAmpm) {
                let hours = Number.parseInt(rawHours, 10)
                const minutes = Number.parseInt(rawMinutes, 10)
                const ampm = rawAmpm.toUpperCase()

                if (ampm === 'PM' && hours < 12)
                  hours += 12
                if (ampm === 'AM' && hours === 12)
                  hours = 0

                const now = new Date()
                const endsAtDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)

                if (endsAtDate.getTime() <= now.getTime()) {
                  endsAtDate.setDate(endsAtDate.getDate() + 1)
                }

                endsAtTimestamp = Math.floor(endsAtDate.getTime() / 1000)
              }
            }
            else {
              endsAtTimestamp = Math.floor(Date.now() / 1000) + remainingSeconds
            }

            if (remainingSeconds > 0) {
              const currentNowPlayingKey = linkEl?.href || titleEl?.textContent?.trim() || null
              const nowSeconds = Math.floor(Date.now() / 1000)

              if (!currentNowPlayingKey || currentNowPlayingKey !== nowPlayingCache.key || nowPlayingCache.endedAt === null || nowPlayingCache.startedAt === null) {
                nowPlayingCache = {
                  key: currentNowPlayingKey,
                  startedAt: nowSeconds - elapsedSeconds,
                  endedAt: endsAtTimestamp,
                }
              }

              if (nowPlayingCache.startedAt !== null && nowPlayingCache.endedAt !== null) {
                presenceData.startTimestamp = nowPlayingCache.startedAt
                presenceData.endTimestamp = nowPlayingCache.endedAt
              }
            }
          }
        }
      }
      else if (isHome) {
        presenceData.details = 'Checking dashboard'
        presenceData.state = 'Checking their feed'
        setSmallIcon(presenceData, ActivityAssets.house, 'Dashboard')

        const streakText = document.querySelector('trakt-streak-callout')?.textContent?.trim() || ''
        const streakMatch = streakText.match(/(\d+)-day/i)
        if (streakMatch && streakMatch[1]) {
          presenceData.state = `🔥 On a ${streakMatch[1]}-day streak`
        }
      }
      else if (isHistory) {
        applyHistoryState(presenceData, 'their')
      }
      else if (isCalendar) { //* Users Personal Upcoming Release Calendar (Shows with at least 1 episode watched or on the watchlist)
        presenceData.details = 'Checking personal calendar'
        setSmallIcon(presenceData, ActivityAssets.calendarWeek, 'Calendar')

        const totalReleases = getCalendarDisplayWeekCount(document)
        presenceData.state = totalReleases > 0
          ? `Tracking ${totalReleases} releases this week`
          : 'Looking for upcoming releases'
      }
      else if (isRecommended) {
        presenceData.details = 'Browsing recommendations'
        setSmallIcon(presenceData, ActivityAssets.wandMagicSparkles, 'Recommended')

        const recCard = document.querySelector('.trakt-card')
        const titleText = getCardTitle(recCard)
        const percentText = recCard?.querySelector('.trakt-summary-card-rating .bold')?.textContent?.trim()

        if (titleText && percentText) {
          presenceData.state = `Top match: ${titleText} (${percentText})`
        }
        else if (titleText) {
          presenceData.state = `Top match: ${titleText}`
        }
        else {
          presenceData.state = 'Finding something to watch'
        }
      }
      else if (isReleases) { //* Global Upcoming Release Calendar (All episodes and movies)
        presenceData.details = 'Checking the release calendar'
        setSmallIcon(presenceData, ActivityAssets.calendarDays, 'Releases')

        const weekCount = getCalendarDisplayWeekCount(document)
        presenceData.state = weekCount > 0
          ? `${weekCount} releases this week`
          : 'Looking for upcoming releases'
      }
      else if (isAnticipated) {
        presenceData.details = 'Browsing anticipated titles'
        setSmallIcon(presenceData, ActivityAssets.faceGrinHearts, 'Anticipated')

        const antCard = document.querySelector('.trakt-card')
        const antTitle = getCardTitle(antCard)

        if (antCard && antTitle) {
          const antTags = Array.from(antCard.querySelectorAll('.trakt-text-tag'))
            .map(el => el.textContent?.trim() || '')
            .filter(Boolean)

          const antCount = antTags.find((t) => {
            const isK = /^\d+(?:\.\d+)?[KM]$/i.test(t)
            const isNum = /^\d{1,3}(?:,\d{3})*$/.test(t)
            return isK ? true : isNum
          })

          let antTimeframe = antTags.find(t => /^(?:in\s|next\s|\d{4})/i.test(t))
          if (antTimeframe) {
            antTimeframe = antTimeframe.charAt(0).toUpperCase() + antTimeframe.slice(1)
          }

          if (antTimeframe && antCount) {
            presenceData.state = `#1: ${antTitle} - ${antTimeframe}, ${antCount} waiting`
          }
          else if (antTimeframe) {
            presenceData.state = `#1: ${antTitle} - ${antTimeframe}`
          }
          else {
            presenceData.state = `#1: ${antTitle}`
          }
        }
        else {
          presenceData.state = 'Looking for upcoming releases'
        }
      }
      else if (isPopular) {
        presenceData.details = 'Browsing popular titles'
        setSmallIcon(presenceData, ActivityAssets.users, 'Popular')

        const popCard = document.querySelector('.trakt-card')
        const popTitle = getCardTitle(popCard)

        if (popCard && popTitle) {
          let popRating = popCard.querySelector('.trakt-summary-card-rating .bold')?.textContent?.trim()
          if (!popRating) {
            const popTags = Array.from(popCard.querySelectorAll('.bold, .trakt-text-tag, p'))
              .map(el => el.textContent?.trim() || '')
            popRating = popTags.find(t => /^\d+%$/.test(t))
          }

          presenceData.state = popRating ? `#1: ${popTitle} (${popRating})` : `#1: ${popTitle}`
        }
        else {
          presenceData.state = 'Looking for popular titles'
        }
      }
      else if (isTrending) {
        presenceData.details = 'Browsing trending'
        const isDiscover = pathname === '/discover'
        setSmallIcon(
          presenceData,
          isDiscover ? ActivityAssets.compass : ActivityAssets.arrowTrendUp,
          isDiscover ? 'Discover' : 'Trending',
        )

        const trendCard = document.querySelector('.trakt-card')
        const trendTitle = getCardTitle(trendCard)

        if (trendCard && trendTitle) {
          const footerText = trendCard.querySelector('.trakt-card-footer')?.textContent?.trim() || ''
          const watchersMatch = footerText.match(/(\d+(?:\.\d+)?[KM]?)/i)
          const watchersCount = watchersMatch ? watchersMatch[1] : null

          presenceData.state = watchersCount
            ? `Trending now: ${trendTitle} (${watchersCount} watching)`
            : `Trending now: ${trendTitle}`
        }
        else {
          presenceData.state = 'Exploring the catalog'
        }
      }
      else if (isProfile) {
        const displayUsername = getDisplayUsername(pathname)
        const profileAvatar = getProfileAvatar()

        presenceData.buttons = [{ label: 'View profile', url: href }]

        if (pathname.includes('/history')) {
          applyHistoryState(presenceData, displayUsername)
        }
        else if (pathname.includes('/collection')) {
          presenceData.details = `Checking ${displayUsername} collection`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.users, 'Collection')
        }
        else if (pathname.includes('/ratings')) {
          presenceData.details = `Checking ${displayUsername} ratings`
          if (profileAvatar)
            setSmallIcon(presenceData, profileAvatar, 'Ratings')
        }
        else if (pathname.includes('/watchlist')) {
          presenceData.details = `Checking ${displayUsername} watchlist`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.listCheck, 'Watchlist')

          const count = parseItemCount(document.querySelector('.trakt-navbar-header .count-item'))
          presenceData.state = count !== null
            ? `${pluralize(count, 'item')} on the watchlist`
            : 'Organizing their watchlist'
        }
        else if (pathname.includes('/start-watching')) {
          presenceData.details = `Checking ${displayUsername} start-watching list`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.listCheck, 'Start Watching')

          const startTitle = getCardTitle(document.querySelector('.trakt-card'))
          presenceData.state = startTitle ? `Up next: ${startTitle}` : 'Choosing what to watch next'
        }
        else if (pathname.includes('/lists')) {
          const isLiked = pathname.includes('/liked')
          presenceData.details = isLiked ? `Checking ${displayUsername} liked lists` : `Checking ${displayUsername} lists`
          if (profileAvatar)
            setSmallIcon(presenceData, profileAvatar, 'Lists')

          if (pathname.endsWith('/lists')) {
            const watchTitle = getCardTitle(document.querySelector('.section-list-container .trakt-card'))
            presenceData.state = watchTitle ? `Watchlist up next: ${watchTitle}` : 'Organizing their watchlist'
          }
          else {
            let totalItems = 0
            let listCount = 0

            document.querySelectorAll('.trakt-list-header').forEach((header) => {
              if (header.querySelector('.trakt-list-title-wrapper .title')) {
                listCount++
                const count = parseItemCount(header.querySelector('.count-item'))
                if (count !== null)
                  totalItems += count
              }
            })

            if (listCount > 0) {
              const listWord = listCount === 1 ? 'list' : 'lists'
              presenceData.state = isLiked
                ? `${pluralize(totalItems, 'item')} over ${listCount} followed ${listWord}`
                : `${pluralize(totalItems, 'item')} over ${listCount} ${listWord}`
            }
            else {
              presenceData.state = isLiked ? 'Browsing liked lists' : 'Organizing their lists'
            }
          }
        }
        else if (pathname.includes('/progress')) {
          presenceData.details = `Checking ${displayUsername} progress`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.listCheck, 'Up Next')

          const progressCount = document.querySelectorAll('.trakt-up-next-episode').length
          presenceData.state = progressCount > 0
            ? `${pluralize(progressCount, 'show')} in progress`
            : 'Checking their backlog'
        }
        else {
          presenceData.details = `Checking ${displayUsername} profile`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.users, 'Profile')

          document.querySelectorAll('.trakt-stats-card').forEach((card) => {
            if (card.querySelector('.secondary.bold')?.textContent?.trim() === 'This month') {
              let plays = ''
              let watched = ''

              card.querySelectorAll('.trakt-stat').forEach((stat) => {
                const val = stat.querySelector('.stat-value .bold')?.textContent?.trim()
                const type = stat.querySelector('.tag.secondary')?.textContent?.trim()
                if (type === 'Plays' && val)
                  plays = val
                if (type === 'Watched' && val)
                  watched = val
              })

              if (plays && watched) {
                presenceData.state = `This month: ${plays} plays (${watched} watched)`
              }
            }
          })
        }
      }
      else if (isPeople) {
        const personTitle = cleanTitle(getMeta('og:title')) || document.querySelector('.trakt-person-title h1')?.textContent?.trim() || 'Person'
        const personDetail = document.querySelector('.trakt-person-title p')?.textContent?.trim() || 'Profile'
        const personImage = document.querySelector<HTMLImageElement>('.trakt-summary-poster img, .trakt-person-image img')
        const personRole = personDetail.toLowerCase()
        const personRoleMap: Record<string, string> = {
          acting: 'Actor',
          directing: 'Director',
          writing: 'Writer',
          producing: 'Producer',
          casting: 'Casting',
          music: 'Musician',
        }
        const personRoleLabel = personRoleMap[personRole] ?? 'Person'

        presenceData.details = `Checking ${personRoleLabel}`
        presenceData.state = truncate(personTitle)
        setSmallIcon(presenceData, ActivityAssets.users, personRoleLabel)

        if (personImage?.src) {
          presenceData.largeImageKey = personImage.src
          presenceData.largeImageText = truncate(personTitle)
        }

        presenceData.buttons = [{ label: 'View on Trakt', url: href }]
      }
      else if (isSearch) {
        const queryParams = new URLSearchParams(search)
        const searchInput = document.querySelector<HTMLInputElement>('.trakt-search-input')
        const query = queryParams.get('q') || queryParams.get('query') || searchInput?.value?.trim() || ''

        presenceData.details = 'Searching'
        setSmallIcon(presenceData, Assets.Search, 'Search')

        if (query) {
          presenceData.state = truncate(`Looking for "${query}"`)
        }
        else {
          const topTitle = getCardTitle(document.querySelector('.trakt-card'))
          presenceData.state = topTitle ? `Top Search: ${topTitle}` : 'Exploring the catalog'
        }
      }
      else if (isMedia) {
        const isShow = pathname.startsWith('/shows')
        const ogTitle = cleanTitle(getMeta('og:title')) || document.title.replace(' - Trakt', '').trim()
        const primaryImage = getPrimaryMediaImage()
        const queryParams = new URLSearchParams(search)
        const isEpisodeView = queryParams.get('view') === 'episode' || !!document.querySelector('.trakt-episode-drawer')
        const episodeMeta = document.querySelector('.episode-title-meta-info')?.textContent?.trim() || null
        const showTitle = document.querySelector('.trakt-drawer-title h1')?.textContent?.trim() || ogTitle

        if (isEpisodeView && episodeMeta) {
          const episodeLabel = episodeMeta.replace(/\s+/g, ' ').trim()
          const episodeName = episodeLabel.split(/-\s*/).slice(1).join(' - ').trim() || episodeLabel

          const episodeDisplayText = `${showTitle} • ${episodeName}`

          presenceData.details = 'Checking episode details'
          presenceData.state = truncate(episodeDisplayText)

          const episodeImage = getSummaryPosterImage()
            || document.querySelector<HTMLImageElement>('.trakt-episode-drawer img, .episode-drawer-content img')

          if (episodeImage?.src) {
            presenceData.largeImageKey = episodeImage.src || primaryImage || ActivityAssets.traktLogomark
            presenceData.largeImageText = `Season ${episodeLabel.match(/S(\d+)/i)?.[1] || '?'}, Episode ${episodeLabel.match(/E(\d+)/i)?.[1] || '?'}`
          }

          setSmallIcon(presenceData, primaryImage !== ActivityAssets.traktLogomark ? ActivityAssets.traktCirclemark : ActivityAssets.tv, 'Episode')
        }
        else {
          presenceData.details = isShow ? 'Checking TV show details' : 'Checking movie details'
          presenceData.state = truncate(ogTitle)

          if (primaryImage) {
            presenceData.largeImageKey = primaryImage
            presenceData.largeImageText = truncate(ogTitle)
            setSmallIcon(
              presenceData,
              isShow ? ActivityAssets.tv : ActivityAssets.film,
              isShow ? 'TV Show' : 'Movie',
            )
          }
        }

        presenceData.buttons = [{ label: 'View on Trakt', url: href }]
      }
      else {
        const staticPages: Record<string, PresenceData> = {
          '/apps': { details: 'Browsing apps', smallImageKey: ActivityAssets.userSecret, smallImageText: 'Apps' },
          '/vip': { details: 'Browsing VIP features', smallImageKey: ActivityAssets.userSecret, smallImageText: 'VIP' },
          '/settings': { details: 'Managing settings', smallImageKey: ActivityAssets.userGear, smallImageText: 'Settings' },
        }

        if (staticPages[pathname]) {
          Object.assign(presenceData, staticPages[pathname])
        }
        else {
          presenceData.details = 'Browsing Trakt'
          setSmallIcon(presenceData, ActivityAssets.traktCirclemark, 'Trakt')
        }
      }

      if (presenceData.details) {
        presence.setActivity(presenceData)
      }
      else {
        presence.clearActivity()
      }
    })
  }
}
catch (error) {
  console.error('Trakt presence failed to update:', error)
}
