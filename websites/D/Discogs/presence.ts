const presence = new Presence({
  clientId: '1042567470738837534',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = presence.createSlideshow()
const shortenedURLs: Record<string, string> = {}

async function getShortURL(url: string) {
  if (url.length < 256)
    return url
  if (shortenedURLs[url])
    return shortenedURLs[url]
  try {
    const pdURL = await (
      await fetch(`https://pd.premid.app/create/${url}`)
    ).text()
    shortenedURLs[url] = pdURL
    return pdURL
  }
  catch (err) {
    presence.error(err as string)
    return url
  }
}

function combineChildTexts(parent: HTMLElement) {
  return [...parent.childNodes]
    .map(node => node.textContent?.replace(/\n/g, '').trim())
    .join(' ')
    .replace(/(?<=\s)\s+/g, ' ')
}

async function createImageSlideshow(type: string) {
  for (const [i, image] of document
    .querySelectorAll<HTMLImageElement>('#view_images img')
    .entries()) {
    slideshow.addSlide(
      i.toString(),
      {
        details: `Viewing ${type} images`,
        state: document.querySelector('#page_content h2 > a')?.textContent,
        largeImageKey: await getShortURL(image.src),
      },
      5000,
    )
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Discogs/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname, hash } = window.location
  const pathSplit = pathname.split('/').filter(Boolean)
  const lastPath = pathSplit[pathSplit.length - 1]
  const pageTitle = document.querySelector('h1')

  switch (pathSplit[0] ?? '') {
    case '': {
      presenceData.details = 'Browsing home page'
      break
    }
    case 'artist': {
      if (lastPath === 'images') {
        await createImageSlideshow('artist')
      }
      else {
        presenceData.details = 'Viewing an artist'
        presenceData.state = pageTitle?.textContent
        presenceData.largeImageKey = await getShortURL(
          document.querySelector<HTMLImageElement>('.thumbnail_link img')!.src,
        )
        presenceData.buttons = [{ label: 'View Artist', url: href }]
      }
      break
    }
    case 'developer': {
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      const [, currentPage, currentHeader] = hash.match(/page:([^,]+).*?header:([^,]+)/) ?? []
      let state = ''
      presenceData.details = 'Viewing API documentation'
      if (currentPage) {
        state += document.querySelector<HTMLHeadingElement>(
          `#${currentPage}`,
        )?.textContent
        if (currentHeader) {
          state += ` - ${
            document.querySelector<HTMLHeadingElement>(`#${currentHeader}`)
              ?.textContent
          }`
        }
      }
      if (state)
        presenceData.state = state
      break
    }
    case 'digs': {
      if (pathSplit[2]) {
        presenceData.details = 'Viewing a dig'
        presenceData.state = pageTitle?.textContent
        presenceData.buttons = [{ label: 'View Dig', url: href }]
      }
      else if (pathSplit[1]) {
        presenceData.details = 'Browsing digs'
        presenceData.state = pageTitle?.textContent
      }
      else {
        presenceData.details = 'Browsing digs'
      }
      break
    }
    case 'forum': {
      switch (pathSplit[1] ?? '') {
        case '': {
          presenceData.details = 'Browsing the forums'
          break
        }
        case 'thread': {
          if (pathSplit[2] === 'new') {
            presenceData.details = 'Creating a new forum thread'
          }
          else {
            presenceData.details = 'Viewing a forum thread'
            presenceData.state = pageTitle?.textContent
            presenceData.buttons = [{ label: 'View Thread', url: href }]
          }
          break
        }
        case 'topic': {
          presenceData.details = 'Viewing a forum topic'
          presenceData.state = pageTitle?.textContent?.trim()
          break
        }
        case 'search': {
          presenceData.details = 'Searching the forums'
          presenceData.state = document.querySelector<HTMLInputElement>(
            '.search_table_field',
          )?.value
          break
        }
      }
      break
    }
    case 'genre': {
      presenceData.details = 'Viewing a genre'
      const title = pageTitle?.textContent?.trim().split(' ')
      presenceData.state = title?.slice(0, title.length - 1).join(' ')
      presenceData.buttons = [{ label: 'View Genre', url: href }]
      break
    }
    case 'group': {
      switch (pathSplit[1] ?? '') {
        case '':
        case 'browse': {
          presenceData.details = 'Browsing groups'
          break
        }
        case 'create': {
          presenceData.details = 'Creating a group'
          break
        }
        case 'posted': {
          presenceData.details = 'Viewing threads they posted in'
          break
        }
        case 'recent': {
          presenceData.details = 'Viewing recent group activity'
          break
        }
        case 'saved': {
          presenceData.details = 'Viewing saved threads'
          break
        }
        case 'search': {
          presenceData.details = 'Searching groups'
          presenceData.state = document.querySelector<HTMLInputElement>(
            '.search_table_field',
          )?.value
          break
        }
        case 'started': {
          presenceData.details = 'Viewing threads they started'
          break
        }
        case 'thread': {
          presenceData.details = 'Viewing a group thread'
          presenceData.state = pageTitle?.textContent
          presenceData.buttons = [{ label: 'View Thread', url: href }]
          break
        }
        case 'watched': {
          presenceData.details = 'Viewing watched threads'
          break
        }
        default: {
          if (lastPath === 'admin') {
            presenceData.details = 'Managing a group'
          }
          else if (lastPath === 'members') {
            presenceData.details = 'Viewing group members'
          }
          else {
            presenceData.details = 'Viewing a group'
            presenceData.buttons = [{ label: 'View Group', url: href }]
          }
          presenceData.state = document
            .querySelector('h1')
            ?.firstChild
            ?.textContent
            ?.trim()
        }
      }
      break
    }
    case 'hc': {
      switch (pathSplit[2] ?? '') {
        case '': {
          presenceData.details = 'Browsing the help center'
          break
        }
        case 'articles': {
          presenceData.details = 'Reading a help article'
          presenceData.state = pageTitle?.textContent
          presenceData.buttons = [{ label: 'Read Article', url: href }]
          break
        }
        case 'categories':
        case 'sections': {
          presenceData.details = 'Browsing a help center category'
          presenceData.state = pageTitle?.textContent
          break
        }
        case 'search': {
          presenceData.details = 'Searching the help center'
          presenceData.state = document.querySelector<HTMLInputElement>('#query')?.value
          break
        }
      }
      break
    }
    case 'label': {
      if (lastPath === 'images') {
        await createImageSlideshow('label')
      }
      else {
        presenceData.details = 'Viewing a label'
        presenceData.state = pageTitle?.textContent
        presenceData.largeImageKey = await getShortURL(
          document.querySelector<HTMLImageElement>('.thumbnail_link img')!.src,
        )
        presenceData.buttons = [{ label: 'View Label', url: href }]
      }
      break
    }
    case 'leaderboard': {
      presenceData.details = 'Viewing the leaderboard'
      break
    }
    case 'marketplace': {
      if (pathSplit[1] === 'offers')
        presenceData.details = 'Viewing their offers'
      else presenceData.details = 'Browsing the marketplace'
      break
    }
    case 'master': {
      if (pathSplit[1] === 'stats') {
        presenceData.details = 'Viewing stats for a master release'
        presenceData.state = document.querySelector('h1 > a')?.textContent
      }
      else if (pathSplit[1] === 'create') {
        presenceData.details = 'Creating a master release'
      }
      else if (lastPath === 'images') {
        await createImageSlideshow('master')
      }
      else {
        presenceData.details = 'Viewing a master release'
        presenceData.state = pageTitle?.textContent
        presenceData.largeImageKey = await getShortURL(
          document.querySelector<HTMLImageElement>('picture > img')!.src,
        )
        presenceData.buttons = [{ label: 'View Release', url: href }]
      }
      break
    }
    case 'messages': {
      if (pathSplit[1] === 'compose')
        presenceData.details = 'Composing a message'
      else presenceData.details = 'Viewing messages'
      break
    }
    case 'my': {
      presenceData.details = 'Viewing dashboard'
      break
    }
    case 'release': {
      if (pathSplit[1] === 'stats') {
        presenceData.details = 'Viewing stats for release'
        presenceData.state = document.querySelector('h1 > a')?.textContent
      }
      else if (pathSplit[2] === 'videos') {
        presenceData.details = 'Editing videos for release'
        presenceData.state = combineChildTexts(pageTitle!)
      }
      else if (lastPath === 'images') {
        await createImageSlideshow('release')
      }
      else {
        presenceData.details = 'Viewing a release'
        presenceData.state = pageTitle?.textContent
        presenceData.largeImageKey = await getShortURL(
          document.querySelector<HTMLImageElement>('picture > img')!.src,
        )
        presenceData.buttons = [{ label: 'View Release', url: href }]
      }
      break
    }
    case 'sell': {
      switch (pathSplit[1] ?? '') {
        case '': {
          presenceData.details = 'Searching for an item to sell'
          break
        }
        case 'billing': {
          presenceData.details = 'Viewing billing information'
          break
        }
        case 'cart': {
          presenceData.details = 'Viewing their cart'
          break
        }
        case 'history': {
          presenceData.details = 'Viewing price history'
          presenceData.state = document.querySelector('h3')?.textContent?.trim()
          break
        }
        case 'inventory': {
          presenceData.details = 'Viewing their inventory'
          break
        }
        case 'mywants': {
          presenceData.details = 'Viewing their wishlist'
          break
        }
        case 'list': {
          presenceData.details = 'Viewing items for sale'
          presenceData.state = pageTitle?.textContent
          break
        }
        case 'orders': {
          presenceData.details = 'Viewing their orders'
          break
        }
        case 'post': {
          presenceData.details = 'Posting an item for sale'
          presenceData.state = combineChildTexts(document.querySelector('h2')!)
          break
        }
        case 'purchases': {
          presenceData.details = 'Viewing their purchases'
          break
        }
        case 'seller_feedback': {
          presenceData.details = 'Viewing seller feedback'
          presenceData.state = pageTitle?.textContent?.trim()
          break
        }
        default: {
          presenceData.details = 'Viewing an item'
          presenceData.state = combineChildTexts(pageTitle!)
          presenceData.largeImageKey = await getShortURL(
            document.querySelector<HTMLImageElement>('.thumbnail_link img')!.src,
          )
          presenceData.buttons = [{ label: 'View Item', url: href }]
          break
        }
      }
      break
    }
    case 'settings': {
      presenceData.details = `Managing ${document
        .querySelector<HTMLLIElement>('.menu-item.current')
        ?.textContent
        ?.trim()} settings`
      break
    }
    case 'style': {
      presenceData.details = 'Viewing a style'
      const title = pageTitle?.textContent?.trim().split(' ')
      presenceData.state = title?.slice(0, title.length - 1).join(' ')
      presenceData.buttons = [{ label: 'View Style', url: href }]
      break
    }
    case 'submissions': {
      presenceData.details = 'Browsing submissions'
      break
    }
    case 'user': {
      switch (lastPath) {
        case 'reviews': {
          presenceData.details = 'Viewing reviews by user'
          break
        }
        case 'collection': {
          presenceData.details = 'Viewing user collection'
          break
        }
        case 'drafts': {
          presenceData.details = 'Viewing user drafts'
          break
        }
        case 'export': {
          presenceData.details = 'Viewing user export options'
          break
        }
        default: {
          presenceData.details = 'Viewing a user'
          presenceData.state = pageTitle?.textContent?.trim()
          presenceData.smallImageKey = await getShortURL(
            document.querySelector<HTMLImageElement>('.user_avatar > img')!.src,
          )
          presenceData.buttons = [{ label: 'View User', url: href }]
        }
      }
      break
    }
    case 'users': {
      presenceData.details = 'Viewing their friends'
      break
    }
    case 'wantlist': {
      presenceData.details = 'Viewing their wantlist'
      break
    }
    default: {
      presenceData.details = 'Browsing'
      presenceData.state = document.title?.match(/^(.*?)( \| Discogs)?$/)?.[1]
    }
  }

  if (presenceData.details) {
    slideshow.deleteAllSlides()
    presence.setActivity(presenceData)
  }
  else if (slideshow.getSlides().length) {
    presence.setActivity(slideshow)
  }
  else {
    slideshow.deleteAllSlides()
    presence.setActivity()
  }
})
