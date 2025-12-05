const presence = new Presence({
  clientId: '1439639102302453780',
})

enum ActivityAssets {
  Logo = 'https://cdn.iknow13.de/3672-6fa138b8-large_512x512.png',
}

// --- HELPER FUNCTIONS ---

function getTitle(): string | undefined {
  return document.querySelector('h1.contentTitle')?.textContent?.trim()
}

function getAuthor(): string | undefined {
  // FIX: Redundanten Selektor zu '#wcf1' vereinfacht
  return (document.querySelector('#wcf1') || document.querySelector('.contentHeader .userLink'))?.textContent?.trim()
}

function getAvatar(): string | undefined {
  try {
    const imgElement = document.querySelector('.messageGroupContentHeader img.userAvatarImage')
      || document.querySelector('.filebasePreviewImage img')

    if (!imgElement)
      return undefined

    let src = imgElement.getAttribute('src')
    if (!src)
      return undefined

    // Relative URLs zu absoluten URLs machen
    if (src.startsWith('/')) {
      src = document.location.origin + src
    }

    // WICHTIG: SVGs und Data-URIs filtern, da Discord diese nicht unterstützt
    if (src.includes('.svg') || src.startsWith('data:')) {
      return undefined
    }

    return src
  }
  catch (error: unknown) { // FIX: 'unknown' Typisierung für bessere TypeScript Sicherheit
    console.error('Error getting avatar:', error)
    return undefined
  }
}

// --- MAIN LOGIC ---

// Track last pathname and browsing timestamp
let lastPathname: string | undefined = undefined;
let browsingTimestamp: number = Math.floor(Date.now() / 1000);

presence.on('UpdateData', async () => {
  const showButtons = await presence.getSetting<boolean>('showButtons')
  const privacy = await presence.getSetting<boolean>('privacy')

  const pathname = document.location.pathname
  const href = document.location.href

  // Update timestamp only if pathname changes
  if (lastPathname !== pathname) {
    lastPathname = pathname;
    browsingTimestamp = Math.floor(Date.now() / 1000);
  }
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const pathname = document.location.pathname
  const href = document.location.href

  // --- SEKTION: DOCUMENTATION ---
  if (document.URL.startsWith('https://docs')) {
    const categoryMap: Record<string, string> = {
      'rust': 'Rust',
      'plugin-api': 'Plugin-API',
      'lotus-sc': 'Lotus-SC',
      'wasm': 'WASM',
      'reference': 'Reference',
    }

    const foundCategory = Object.keys(categoryMap).find(key => pathname.includes(key))
    const categoryName = foundCategory ? categoryMap[foundCategory] : 'General'

    presenceData.details = `Reading Docs: ${categoryName}`
    presenceData.state = document.querySelector('h1#_top.astro-j6tvhyss')?.textContent?.trim()

    presence.setActivity(presenceData)
    return
  }

  // --- SEKTION: HAUPTSEITE ---

  // Default fallback
  presenceData.details = 'Browsing Website'

  // 1. FORUM
  if (pathname.startsWith('/forum')) {
    presenceData.state = 'Browsing Forum'

    if (!privacy) {
      const title = getTitle()

      if (href.includes('board') && title) {
        if (!title.startsWith('LOTUS-Simulator') && !title.startsWith('Forum')) {
          presenceData.details = 'Browsing Board'
          presenceData.state = title
        }
      }
      else if (href.includes('unread-thread-list')) {
        presenceData.details = 'Forum'
        presenceData.state = 'Checking unread posts'
      }
      else if (href.includes('thread') && title) {
        presenceData.details = 'Reading Thread'
        presenceData.state = title

        if (showButtons) {
          presenceData.buttons = [{ label: 'View Post', url: href }]
        }
      }
      else if (href.includes('features-de')) {
        presenceData.details = 'Forum'
        presenceData.state = 'Viewing Features Overview'
      }
    }
  }

  // 2. GALLERY
  else if (pathname.startsWith('/gallery')) {
    presenceData.state = 'Browsing Gallery'

    if (!privacy) {
      if (href.includes('my-image-list')) {
        presenceData.details = 'Gallery'
        presenceData.state = 'Managing own images'
      }
      else if (href.includes('image-add')) {
        presenceData.details = 'Gallery'
        presenceData.state = 'Uploading an image'
      }
      else {
        // Prüfen, ob wir ein Bild ansehen (Titel vorhanden)
        const imageTitle = getTitle()

        if (imageTitle) {
          presenceData.details = 'Viewing Image'

          const imageAuthor = getAuthor()
          presenceData.state = imageAuthor ? `${imageTitle} by ${imageAuthor}` : imageTitle

          if (showButtons) {
            presenceData.buttons = [{ label: 'View Image', url: href }]
          }

          // Bild setzen (SVGs werden von der Funktion ignoriert)
          const avatarUrl = getAvatar()
          if (avatarUrl) {
            presenceData.largeImageKey = avatarUrl
          }
        }
      }
    }
  }

  // 3. LEXIKON
  else if (pathname.startsWith('/lexikon')) {
    presenceData.state = 'Reading Lexicon'

    if (!privacy) {
      const entryTitle = getTitle()
      if (entryTitle && !entryTitle.startsWith('Lexikon')) {
        presenceData.details = 'Reading Entry'
        presenceData.state = entryTitle
      }
    }
  }

  // 4. ROADMAP & BUGS
  else if (pathname.startsWith('/roadmap')) {
    presenceData.state = 'Checking Roadmap'
  }
  else if (pathname.startsWith('/known-bugs')) {
    presenceData.state = 'Checking Known Bugs'
  }
  else if (pathname.startsWith('/recent-changes')) {
    presenceData.state = 'Checking Recent Updates'
  }

  // 5. BLOG
  else if (pathname.startsWith('/blog')) {
    presenceData.state = 'Reading Blog'

    if (!privacy) {
      const blogTitle = getTitle()
      if (blogTitle && !blogTitle.startsWith('Artikel')) {
        presenceData.details = 'Reading Article'
        presenceData.state = blogTitle
      }
      else {
        presenceData.state = 'Browsing Blog List'
      }
    }
  }

  // 6. FILEBASE
  else if (pathname.startsWith('/filebase')) {
    presenceData.state = 'Browsing Filebase'

    if (!privacy) {
      const fileTitle = getTitle()

      if (href.includes('?filebase') && fileTitle) {
        presenceData.details = 'Browsing Category'
        presenceData.state = fileTitle
      }
      else if (href.includes('entry') && fileTitle) {
        const fileAuthor = getAuthor()
        presenceData.details = 'Viewing File'
        presenceData.state = fileAuthor ? `${fileTitle} by ${fileAuthor}` : fileTitle

        if (showButtons) {
          presenceData.buttons = [{ label: 'View File', url: href }]
        }

        const previewImage = getAvatar()
        if (previewImage) {
          presenceData.largeImageKey = previewImage
        }
      }
    }
  }

  // 7. SHOP
  else if (pathname.startsWith('/shop')) {
    presenceData.state = 'Shopping'

    if (!privacy && href.includes('?product')) {
      const productTitle = getTitle()
      if (productTitle) {
        presenceData.details = 'Viewing Product'
        presenceData.state = productTitle

        if (showButtons) {
          presenceData.buttons = [{ label: 'View Product', url: href }]
        }
      }
    }
  }

  // 8. GENERAL / HOME / USER CP
  else {
    presenceData.state = 'Home Page'

    if (href.includes('members-list')) {
      presenceData.details = 'Community'
      presenceData.state = 'Browsing Members List'
    }
    else if (href.includes('team')) {
      presenceData.details = 'Team'
      presenceData.state = 'Browsing Members List'
    }
    else if (href.includes('user-search')) {
      presenceData.details = 'Community' // FIX: Leeren String vermieden
      presenceData.state = 'Searching a Member...'
    }
    else if (href.includes('notification-list')) {
      presenceData.details = 'User CP'
      presenceData.state = 'Checking Notifications'
    }
    else if (href.includes('conversation')) {
      presenceData.details = 'User CP'
      presenceData.state = 'Reading Conversations'
    }
    else if (href.includes('search-result')) {
      presenceData.details = 'Search'
      presenceData.state = 'Searching...'
    }
  }

  presence.setActivity(presenceData)
})
