import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1434506061229854826',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)
let lastPath = ''
let pathTimestamp = browsingTimestamp

const strings = {
  browsing: 'Browsing',
  viewing: 'Viewing',
  searching: 'Searching',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/MdbUxWe.png',
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location

  if (pathname !== lastPath) {
    pathTimestamp = Math.floor(Date.now() / 1000)
    lastPath = pathname
  }
  presenceData.startTimestamp = pathTimestamp

  const [showButtons, showCover, privacyMode] = await Promise.all([
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('privacyMode'),
  ])

  if (pathname === '/') {
    presenceData.details = `${strings.browsing} YukiList`
    presenceData.state = 'Looking for Anime'
  }
  else if (pathname.startsWith('/anime/')) {
    const animeTitle = document.querySelector(
      'h1.text-4xl, h1.text-3xl, h1',
    )?.textContent?.trim()

    if (animeTitle) {
      if (privacyMode) {
        presenceData.details = `${strings.viewing} Anime`
        presenceData.state = 'Browsing privately'
      }
      else {
        presenceData.details = `${strings.viewing} Anime`

        const progressInput = document.querySelector<HTMLInputElement>('input[type="number"].text-center')

        if (progressInput && progressInput.value) {
          const current = progressInput.value
          const maxEpisodes = progressInput.max

          if (maxEpisodes && maxEpisodes !== '9999') {
            presenceData.state = `${animeTitle} • Ep ${current}/${maxEpisodes}`
          }
          else {
            presenceData.state = `${animeTitle} • Ep ${current}`
          }
        }
        else {
          presenceData.state = animeTitle
        }
      }

      if (showCover && !privacyMode) {
        const coverImage = document.querySelector<HTMLImageElement>(
          `img[alt="${animeTitle}"]`,
        ) || document.querySelector<HTMLImageElement>(
          '.aspect-\\[2\\/3\\] img, .rounded-lg img, img.object-cover',
        )

        if (coverImage?.src && !coverImage.src.includes('blur')) {
          presenceData.largeImageKey = coverImage.src
          presenceData.smallImageKey = 'https://i.imgur.com/MdbUxWe.png'
          presenceData.smallImageText = 'YukiList'
        }
      }

      if (showButtons && !privacyMode) {
        presenceData.buttons = [
          {
            label: 'View Anime on YukiList',
            url: document.location.href,
          },
        ]
      }
    }
    else {
      presenceData.details = `${strings.viewing} Anime`
      presenceData.state = 'Loading...'
    }
  }
  else if (pathname === '/search') {
    presenceData.details = `${strings.browsing} YukiList`
    presenceData.state = `${strings.searching} for Anime`
    presenceData.smallImageKey = Assets.Search
    presenceData.smallImageText = strings.searching
  }
  else if (pathname === '/upcoming') {
    presenceData.details = `${strings.browsing} YukiList`
    presenceData.state = 'Viewing Upcoming Anime'
  }
  else if (pathname === '/completed') {
    presenceData.details = `${strings.browsing} YukiList`
    presenceData.state = 'Viewing Completed Anime'
  }
  else if (pathname.startsWith('/me/profile')) {
    presenceData.details = `${strings.browsing} YukiList`
    presenceData.state = privacyMode ? 'Viewing Profile' : 'Viewing My Profile'
  }
  else if (pathname.startsWith('/user/')) {
    const username = document.querySelector('.text-3xl.font-bold.text-white, h1.text-3xl')?.textContent?.trim()
    presenceData.details = 'Viewing Profile'
    presenceData.state = privacyMode || !username ? 'Someone\'s profile' : username

    if (!privacyMode) {
      const profilePic = document.querySelector<HTMLImageElement>('.w-24.h-24.rounded-2xl img, .rounded-2xl img[alt*="User"]')
      if (profilePic?.src && !profilePic.src.includes('data:')) {
        presenceData.largeImageKey = profilePic.src
        presenceData.smallImageKey = 'https://i.imgur.com/MdbUxWe.png'
        presenceData.smallImageText = 'YukiList'
      }
    }
  }
  else if (pathname.startsWith('/me/list')) {
    const searchParams = new URLSearchParams(window.location.search)
    const status = searchParams.get('status')
    const statusMap: { [key: string]: string } = {
      watching: 'Watching',
      completed: 'Completed',
      on_hold: 'On Hold',
      dropped: 'Dropped',
      plan_to_watch: 'Plan to Watch',
    }

    const countText = document.querySelector('.text-sm.text-muted-foreground')?.textContent
    const countMatch = countText?.match(/(\d+)\s+anime/)
    const count = countMatch ? countMatch[1] : null

    const statusLabel = status && statusMap[status] ? statusMap[status] : 'Watching'

    presenceData.details = 'Managing Watchlist'
    presenceData.state = count ? `${statusLabel} (${count})` : `${statusLabel} List`
  }
  else if (pathname.startsWith('/auth')) {
    presenceData.details = `${strings.browsing} YukiList`
    presenceData.state = 'Signing In'
  }
  else {
    presenceData.details = `${strings.browsing} YukiList`
    presenceData.state = 'Exploring'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})
