const presence = new Presence({
  clientId: '468420510632509473',
})

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const [privacy, cover] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('cover'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MyAnimeList/assets/logo.png',
  }
  if (pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (
    pathname === '/anime.php'
    || pathname.startsWith('/topanime')
    || pathname.startsWith('/watch')
  ) {
    presenceData.details = 'Looking for anime'
  }
  else if (
    pathname === '/manga.php'
    || pathname.startsWith('/topmanga')
    || pathname.startsWith('/store')
  ) {
    presenceData.details = 'Looking for manga'
  }
  else if (pathname.startsWith('/reviews.php')) {
    presenceData.details = 'Viewing Reviews'
  }
  else if (pathname.startsWith('/watch/episode')) {
    presenceData.details = 'Viewing Episode Videos'
  }
  else if (pathname.startsWith('/recommendations.php')) {
    presenceData.details = 'Viewing Recommendations'
    const type = new URLSearchParams(document.location.search).get('t')
    if (type) {
      presenceData.state = `For ${type.charAt(0).toUpperCase() + type.slice(1)}`
    }
  }
  else if (pathname.startsWith('/stacks')) {
    presenceData.details = 'Browsing Interest Stacks'
  }
  else if (pathname.startsWith('/forum')) {
    presenceData.details = 'Viewing the forums'
    if (!privacy) {
      presenceData.state = document
        .querySelector('meta[property=\'og:title\']')
        ?.getAttribute('content')
    }
  }
  else if (pathname.startsWith('/clubs.php')) {
    if (document.querySelectorAll('.normal_header')[1]) {
      presenceData.details = 'Viewing a club'
      if (!privacy) {
        presenceData.state = document.querySelector('.h1')?.textContent
        presenceData.buttons = [{ label: 'View Club', url: href }]
      }
    }
    else if (
      document.querySelector('.h1-title')?.textContent === 'Invitations'
    ) {
      presenceData.details = 'Viewing club Invitations'
    }
    else if (document.querySelector('.h1-title')?.textContent === 'My Clubs') {
      presenceData.details = 'Viewing my clubs'
    }
    else {
      presenceData.details = 'Looking for clubs'
    }
  }
  else if (pathname.startsWith('/blog.php')) {
    presenceData.details = 'Viewing the blog'
  }
  else if (pathname.startsWith('/users.php')) {
    presenceData.details = 'Searching for users'
  }
  else if (pathname.startsWith('/news')) {
    presenceData.details = 'Viewing the news'
  }
  else if (pathname.startsWith('/featured')) {
    if (
      document
        .querySelector('meta[property=\'og:title\']')
        ?.getAttribute('content')
        ?.includes('Featured Articles')
    ) {
      presenceData.details = 'Viewing featured articles'
    }
    else {
      presenceData.details = 'Viewing an article'
      if (!privacy) {
        presenceData.state = document.querySelector('.title')?.textContent
        presenceData.buttons = [{ label: 'Read Article', url: href }]
      }
    }
  }
  else if (pathname.startsWith('/people')) {
    if (document.querySelector('.h1')?.textContent === 'People') {
      presenceData.details = 'Viewing people'
    }
    else {
      presenceData.details = 'Viewing a person'
      if (!privacy) {
        presenceData.state = document
          .querySelector('.title-name')
          ?.textContent
          ?.replace(/<[^>]+>/g, '')
        presenceData.buttons = [{ label: 'View Person', url: href }]
      }
    }
  }
  else if (pathname.startsWith('/character')) {
    if (document.querySelector('.h1')?.textContent === 'Characters') {
      presenceData.details = 'Looking for characters'
    }
    else {
      presenceData.details = 'Viewing a character'
      if (!privacy) {
        presenceData.state = document
          .querySelectorAll('.normal_header')[2]
          ?.textContent
          ?.replace(/<[^>]+>/g, '')
        presenceData.buttons = [{ label: 'View Character', url: href }]
      }
    }
  }
  else if (pathname.startsWith('/profile')) {
    presenceData.details = 'Viewing a profile'
    if (!privacy) {
      presenceData.state = pathname.split('/')[2]
      presenceData.buttons = [{ label: 'View Profile', url: href }]

      if (cover) {
        const userImage = document.querySelector<HTMLImageElement>('.user-image img')
        const imgSrc = userImage?.src || userImage?.getAttribute('data-src')
        if (imgSrc)
          presenceData.largeImageKey = imgSrc
      }
    }
  }
  else if (pathname.startsWith('/animelist')) {
    presenceData.details = 'Viewing an anime list'
    if (!privacy) {
      presenceData.state = pathname.split('/')[2]
      presenceData.buttons = [{ label: 'View List', url: href }]
    }
  }
  else if (pathname.startsWith('/mangalist')) {
    presenceData.details = 'Viewing a manga list'
    if (!privacy) {
      presenceData.state = pathname.split('/')[2]
      presenceData.buttons = [{ label: 'View List', url: href }]
    }
  }
  else if (pathname.startsWith('/anime')) {
    // TODO: The if loop to check if the user is really on the page of an anime is currently always true for some reason which results in the presence going away when the user is for example in the anime directory
    if (document.querySelector('.js-anime-edit-info-button')) {
      presenceData.details = 'Viewing an anime'
      if (!privacy) {
        const englishTitle = document.querySelector('.title-english')?.textContent
        presenceData.state = `${
          document.querySelector('.title-name')?.textContent
        } ${englishTitle ? `| ${englishTitle}` : ''}`.trim()
        presenceData.buttons = [{ label: 'View Anime', url: href }]

        if (cover) {
          const coverImg = document.querySelector<HTMLImageElement>('img[itemprop="image"]')?.src
          if (coverImg)
            presenceData.largeImageKey = coverImg
        }
      }
    }
    else {
      presenceData.details = 'Looking for anime'
    }
  }
  else if (pathname.startsWith('/manga')) {
    // TODO: The if loop to check if the user is really on the page of an anime is currently always true for some reason which results in the presence going away when the user is for example in the anime directory
    if (document.querySelector('.js-manga-edit-info-button')) {
      presenceData.details = 'Viewing a manga'
      if (!privacy) {
        const englishTitle = document.querySelector('.title-english')?.textContent
        presenceData.state = `${
          document.querySelector('span[itemprop="name"]')?.firstChild?.textContent
        } ${englishTitle ? ` | ${englishTitle}` : ''}`.trim()
        presenceData.buttons = [{ label: 'View Manga', url: href }]

        if (cover) {
          const coverImg = document.querySelector<HTMLImageElement>('img[itemprop="image"]')?.src
          if (coverImg)
            presenceData.largeImageKey = coverImg
        }
      }
    }
    else {
      presenceData.details = 'Looking for manga'
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
