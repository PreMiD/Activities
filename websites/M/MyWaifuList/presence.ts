const presence = new Presence({
  clientId: '468420510632509473',
})

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const privacy = await presence.getSetting<boolean>('privacy')

  const presenceData: PresenceData = {
    largeImageKey: 'https://mywaifulist.moe/images/thumb_waifus.png',
  }

  // =========================
  // HOME
  // =========================
  if (pathname === '/') {
    presenceData.details = 'Browsing MyWaifuList'
    presenceData.state = 'Anime Character Database'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_waifus.png'
  }

  // =========================
  // WAIFU
  // =========================
  else if (pathname.startsWith('/waifu/')) {
    const name = document.querySelector('h1')?.textContent?.trim()

    presenceData.details = 'Viewing Waifu'

    if (name)
      presenceData.state = name

    if (!privacy) {
      const characterImage = document.querySelector<HTMLImageElement>(
        `img[alt="${name}"]`,
      )?.src

      if (characterImage)
        presenceData.largeImageKey = characterImage

      const series = document.querySelector<HTMLAnchorElement>(
        'a[href^="/series/"]',
      )

      if (series) {
        const text = series.textContent
          ?.split('\n')
          .map(line => line.trim())
          .filter(Boolean) ?? []

        const seriesName = text[text.length - 1]

        if (seriesName)
          presenceData.state = `${name} • ${seriesName}`
      }

      presenceData.buttons = [
        {
          label: 'View Waifu',
          url: href,
        },
      ]
    }
  }

  // =========================
  // SERIES
  // =========================
  else if (pathname.startsWith('/series/')) {
    const name = document.querySelector('h1')?.textContent?.trim()

    presenceData.details = 'Viewing Anime Series'

    if (name)
      presenceData.state = name

    if (!privacy) {
      const seriesImage = [...document.querySelectorAll<HTMLImageElement>('img')]
        .find(img => img.alt === name)
        ?.src

      if (seriesImage)
        presenceData.largeImageKey = seriesImage

      // Type
      const pageText = document.body.textContent ?? ''

      const typeMatch = pageText.match(
        /Type\s*(TV|Movie|OVA|ONA|Special|Music)/i,
      )

      // Studio
      const studioLink = document.querySelector<HTMLAnchorElement>(
        'a[href^="/studio/"]',
      )

      const type = typeMatch?.[1]
      const studio = studioLink?.textContent?.trim()

      if (name) {
        const extra = [type, studio].filter(Boolean).join(' • ')

        if (extra)
          presenceData.state = `${name} • ${extra}`
      }

      presenceData.buttons = [
        {
          label: 'View Series',
          url: href,
        },
      ]
    }
  }

  // =========================
  // USER PROFILE
  // =========================
  else if (pathname.startsWith('/user/')) {
    const name = document.querySelector('h1')?.textContent?.trim()

    presenceData.details = 'Viewing Profile'

    if (name)
      presenceData.state = name

    if (!privacy) {
      const profileImage = document.querySelector<HTMLImageElement>(
        'img[alt="User avatar"]',
      )?.src

      if (profileImage)
        presenceData.largeImageKey = profileImage

      presenceData.buttons = [
        {
          label: 'View Profile',
          url: href,
        },
      ]
    }
  }

  // =========================
  // SEIYUU
  // =========================
  else if (pathname.startsWith('/seiyuu/')) {
    const name = document.querySelector('h1')?.textContent?.trim()

    presenceData.details = 'Viewing Voice Actor'

    if (name)
      presenceData.state = name

    if (!privacy) {
      const seiyuuImage = [...document.querySelectorAll<HTMLImageElement>('img')]
        .find(img => img.alt === name)
        ?.src

      if (seiyuuImage)
        presenceData.largeImageKey = seiyuuImage

      // Número de favoritos
      const favoriteText = [...document.querySelectorAll('*')]
        .map(element => element.textContent?.trim())
        .find(text => text && /^\d[\d,.]*\s+favorites$/i.test(text))

      if (name && favoriteText)
        presenceData.state = `${name} • ${favoriteText}`

      presenceData.buttons = [
        {
          label: 'View Voice Actor',
          url: href,
        },
      ]
    }
  }

  // =========================
  // STUDIO
  // =========================
  else if (pathname.startsWith('/studio/')) {
    const name = document.querySelector('h1')?.textContent?.trim()

    presenceData.details = 'Viewing Anime Studio'

    if (name)
      presenceData.state = name

    if (!privacy) {
      const studioImage = [...document.querySelectorAll<HTMLImageElement>('img')]
        .find(img => img.alt === name)
        ?.src

      if (studioImage)
        presenceData.largeImageKey = studioImage

      // Número de obras
      const worksMatch = (document.body.textContent ?? '').match(
        /Studio Works \((\d+)\)/i,
      )

      if (name && worksMatch)
        presenceData.state = `${name} • ${worksMatch[1]} works`

      presenceData.buttons = [
        {
          label: 'View Studio',
          url: href,
        },
      ]
    }
  }

  // =========================
  // POPULAR
  // =========================
  else if (pathname === '/popular') {
    presenceData.details = 'Browsing Popular Waifus'
    presenceData.state = 'Most voted characters of all time'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_waifus.png'
  }

  // =========================
  // BEST
  // =========================
  else if (pathname === '/best') {
    presenceData.details = 'Browsing Top Tier Waifus'
    presenceData.state = 'Best of the best by weighted votes'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_winner.png'
  }

  // =========================
  // TRASH
  // =========================
  else if (pathname === '/trash') {
    presenceData.details = 'Browsing Top Trash'
    presenceData.state = 'Most disliked characters'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_trash.png'
  }

  // =========================
  // CURRENT BEST
  // =========================
  else if (pathname === '/current/best') {
    presenceData.details = 'Browsing Seasonal Best Girls'
    presenceData.state = 'Top Waifus of the current season'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_winner.png'
  }

  // =========================
  // ADD WAIFU
  // =========================
  else if (pathname === '/add/waifu') {
    presenceData.details = 'Adding a Waifu'
    presenceData.state = 'Creating a new character entry'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_waifus.png'
  }

  // =========================
  // ADD SEIYUU
  // =========================
  else if (pathname === '/add/seiyuu') {
    presenceData.details = 'Adding a Voice Actor'
    presenceData.state = 'Creating a new voice actor entry'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_history.png'
  }

  // =========================
  // BROWSE SEIYUU
  // =========================
  else if (pathname === '/browse/seiyuu') {
    presenceData.details = 'Browsing Voice Actors'
    presenceData.state = 'Japanese anime voice actors'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_history.png'
  }

  // =========================
  // STUDIOS
  // =========================
  else if (pathname === '/studios') {
    presenceData.details = 'Browsing Anime Studios'
    presenceData.state = 'Discover animation studios'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_history.png'
  }

  // =========================
  // SERIES LIST
  // =========================
  else if (pathname === '/series') {
    presenceData.details = 'Browsing Anime Series'
    presenceData.state = 'Discover anime and manga series'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_series.png'
  }

  // =========================
  // HUSBANDOS
  // =========================
  else if (pathname === '/husbandos') {
    presenceData.details = 'Browsing Husbandos'
    presenceData.state = 'Find the best anime husbandos'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_husbandos.png'
  }

  // =========================
  // BROWSE WAIFUS
  // =========================
  else if (pathname === '/browse') {
    presenceData.details = 'Browsing Waifus'
    presenceData.state = 'Discover anime characters'
    presenceData.largeImageKey
      = 'https://mywaifulist.moe/images/thumb_waifus.png'
  }

  // =========================
  // EVERYTHING ELSE
  // =========================
  else {
    presenceData.details = 'Browsing MyWaifuList'
    presenceData.state = 'Anime Character Database'
  }

  presence.setActivity(presenceData)
})
