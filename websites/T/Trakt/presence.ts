import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '968880591003082783',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const ActivityAssets = {
  traktLogomark: 'https://i.postimg.cc/Cxwsz86J/trakt-logomark.png',
  traktCirclemark: 'https://i.postimg.cc/K8mDRTsf/trakt-circlemark.png',
  house: 'https://i.postimg.cc/0y90bSHM/house-solid.png',
  listCheck: 'https://i.postimg.cc/P5dQPDFD/list-check-solid.png',
  calendarWeek: 'https://i.postimg.cc/bwq9snFd/calendar-week-solid.png',
  wandMagicSparkles: 'https://i.postimg.cc/JzR5GXdd/wand-magic-sparkles-solid.png',
  compass: 'https://i.postimg.cc/W1swhZfd/compass-solid.png',
  arrowTrendUp: 'https://i.postimg.cc/SxmfJ9tK/arrow-trend-up-solid.png',
  calendarDays: 'https://i.postimg.cc/JzR5GXd0/calendar-days-solid.png',
  faceGrinHearts: 'https://i.postimg.cc/dVJjLCSL/face-grin-hearts-solid.png',
  users: 'https://i.postimg.cc/vZGtcnS2/users-solid.png',
  magnifyingGlass: 'https://i.postimg.cc/VkzWdtHn/magnifying-glass-solid.png',
  userGear: 'https://i.postimg.cc/3x3FdGbS/user-gear-solid.png',
  userClock: 'https://i.postimg.cc/MpzmvBrs/user-clock-solid.png',
  userSecret: 'https://i.postimg.cc/HkT9VMP6/user-secret-solid.png',
  tv: 'https://i.postimg.cc/7ZqnfzQm/tv-solid.png',
  film: 'https://i.postimg.cc/GmbxHDSy/film-solid.png',
  play: 'https://i.postimg.cc/8zTmjvnm/play-solid.png',
  pause: 'https://i.postimg.cc/RZvLNtb1/pause-solid.png',
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
  const avatarImg = document.querySelector('.trakt-profile-image img, .trakt-profile-button img') as HTMLImageElement
  return avatarImg?.src || null
}

function getPrimaryMediaImage(): string | null {
  const posterImg = document.querySelector('.trakt-summary-poster img') as HTMLImageElement | null
  if (posterImg?.src)
    return posterImg.src

  const heroImg = document.querySelector('.trakt-summary-content img') as HTMLImageElement | null
  if (heroImg?.src && /images\//.test(heroImg.src))
    return heroImg.src

  return getMeta('og:image')
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

function countIndicators(root: Document | Element = document): number {
  let total = root.querySelectorAll('.trakt-content-indicator .circle').length
  root.querySelectorAll('.trakt-content-indicator .secondary').forEach((el) => {
    const text = el.textContent?.trim() || ''
    if (text.startsWith('+')) {
      const num = Number.parseInt(text.replace('+', ''), 10)
      if (!Number.isNaN(num))
        total += num
    }
  })
  return total
}

function applyHistoryState(data: PresenceData, displayUsername = 'their') {
  data.details = `Viewing ${displayUsername} history`
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
        const titleEl = nowPlayingToast.querySelector('.bold.ellipsis')
        const imgEl = nowPlayingToast.querySelector('img')
        const linkEl = nowPlayingToast.querySelector('a.trakt-link') as HTMLAnchorElement
        const timeRemainingEl = nowPlayingToast.querySelector('.trakt-now-playing-remaining')

        let stateText = titleEl?.textContent?.trim() || 'Media'
        let detailsText = 'Watching'

        const seMatch = stateText.match(/S(\d+)\s*•\s*E(\d+)\s*-\s*(.+)/i)
        if (seMatch && seMatch[1] && seMatch[2] && seMatch[3]) {
          detailsText = (linkEl?.href && extractTitleFromUrl(linkEl.href)) || 'TV Show'
          stateText = seMatch[3]
        }

        presenceData.details = truncate(detailsText)
        presenceData.state = truncate(stateText)

        if (imgEl?.src) {
          presenceData.largeImageKey = imgEl.src
          presenceData.largeImageText = seMatch && seMatch[1] && seMatch[2]
            ? `Season ${seMatch[1]}, Episode ${seMatch[2]}`
            : truncate(stateText)
        }

        if (linkEl?.href) {
          presenceData.buttons = [{ label: 'View on Trakt', url: linkEl.href }]
        }

        setSmallIcon(presenceData, ActivityAssets.play, 'Now Playing')

        if (timeRemainingEl?.textContent) {
          let minutesLeft = 0
          const hMatch = timeRemainingEl.textContent.match(/(\d+)h/i)
          const mMatch = timeRemainingEl.textContent.match(/(\d+)m/i)

          if (hMatch && hMatch[1])
            minutesLeft += Number.parseInt(hMatch[1], 10) * 60
          if (mMatch && mMatch[1])
            minutesLeft += Number.parseInt(mMatch[1], 10)

          if (minutesLeft > 0) {
            const endTs = Math.floor(Date.now() / 1000) + (minutesLeft * 60)
            presenceData.endTimestamp = endTs
            delete presenceData.startTimestamp

            const percentStr = nowPlayingToast
              .querySelector('.trakt-distribution-bar[role="progressbar"]')
              ?.getAttribute('aria-valuenow')
            const percentVal = percentStr ? Number.parseFloat(percentStr) : Number.NaN

            if (!Number.isNaN(percentVal) && percentVal >= 0 && percentVal < 100) {
              const fractionLeft = (100 - percentVal) / 100
              const totalSeconds = (minutesLeft * 60) / fractionLeft
              presenceData.startTimestamp = endTs - Math.floor(totalSeconds)
            }
          }
        }
      }
      else if (isHome) {
        presenceData.details = 'Viewing dashboard'
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
      else if (isCalendar) {
        presenceData.details = 'Checking the calendar'
        setSmallIcon(presenceData, ActivityAssets.calendarWeek, 'Calendar')

        const totalReleases = countIndicators(document)
        presenceData.state = totalReleases > 0
          ? `${totalReleases} releases coming this week`
          : 'Looking at upcoming releases'
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
      else if (isReleases) {
        presenceData.details = 'Checking the release calendar'
        setSmallIcon(presenceData, ActivityAssets.calendarDays, 'Releases')

        const activeDayBtn = document.querySelector('.trakt-calendar-day-button.is-active')
        let activeDayTotal = 0

        if (activeDayBtn) {
          const ariaLabel = activeDayBtn.getAttribute('aria-label') || ''
          const dateMatch = ariaLabel.match(/Go to (.+?), \d{4}/)
          if (dateMatch && dateMatch[1]) {
            presenceData.details = `Releases for ${dateMatch[1]}`
          }
          activeDayTotal = countIndicators(activeDayBtn)
        }

        presenceData.state = activeDayTotal > 0
          ? `Tracking ${activeDayTotal} releases today`
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
          presenceData.details = `Viewing ${displayUsername} collection`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.users, 'Collection')
        }
        else if (pathname.includes('/ratings')) {
          presenceData.details = `Viewing ${displayUsername} ratings`
          if (profileAvatar)
            setSmallIcon(presenceData, profileAvatar, 'Ratings')
        }
        else if (pathname.includes('/watchlist')) {
          presenceData.details = `Viewing ${displayUsername} watchlist`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.listCheck, 'Watchlist')

          const count = parseItemCount(document.querySelector('.trakt-navbar-header .count-item'))
          presenceData.state = count !== null
            ? `${pluralize(count, 'item')} on the watchlist`
            : 'Organizing their watchlist'
        }
        else if (pathname.includes('/start-watching')) {
          presenceData.details = `Viewing ${displayUsername} start-watching list`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.listCheck, 'Start Watching')

          const startTitle = getCardTitle(document.querySelector('.trakt-card'))
          presenceData.state = startTitle ? `Up next: ${startTitle}` : 'Choosing what to watch next'
        }
        else if (pathname.includes('/lists')) {
          const isLiked = pathname.includes('/liked')
          presenceData.details = isLiked ? `Viewing ${displayUsername} liked lists` : `Viewing ${displayUsername} lists`
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
          presenceData.details = `Viewing ${displayUsername} progress`
          setSmallIcon(presenceData, profileAvatar || ActivityAssets.listCheck, 'Up Next')

          const progressCount = document.querySelectorAll('.trakt-up-next-episode').length
          presenceData.state = progressCount > 0
            ? `${pluralize(progressCount, 'show')} in progress`
            : 'Checking their backlog'
        }
        else {
          presenceData.details = `Viewing ${displayUsername} profile`
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
        const personImage = document.querySelector('.trakt-summary-poster img, .trakt-person-image img') as HTMLImageElement | null
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

        presenceData.details = `Viewing ${personRoleLabel}`
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
        const searchInput = document.querySelector('.trakt-search-input') as HTMLInputElement
        const query = queryParams.get('q') || queryParams.get('query') || searchInput?.value?.trim() || ''

        presenceData.details = 'Searching'
        setSmallIcon(presenceData, ActivityAssets.magnifyingGlass, 'Search')

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

        presenceData.details = isShow ? 'Viewing TV Show' : 'Viewing Movie'
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
