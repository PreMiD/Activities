const presence = new Presence({
  clientId: '1007688410875564062',
})

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {}

  const showButtons = await presence.getSetting('showButtons')
  const { hostname, pathname, origin, href, search } = document.location
  const searchParams = new URLSearchParams(search)

  if (hostname === 'jojowiki.com') {
    presenceData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/JoJo%27s%20Bizarre%20Encyclopedia/assets/0.png',
      smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/JoJo%27s%20Bizarre%20Encyclopedia/assets/1.png',
      smallImageText: 'jojowiki.com',
    }
    presenceData.details = 'Browsing JoJoWiki'

    if (
      pathname === ''
      || pathname === '/'
      || pathname === '/JoJo_Wiki'
      || (pathname === '/index.php' && !searchParams.get('action'))
    ) {
      presenceData.state = 'Viewing homepage'
    }
    else if (pathname.toLowerCase().includes('/index.php')) {
      const search = searchParams.get('search')
      const action = searchParams.get('action')

      let title
      if (searchParams.get('title'))
        title = urlToTitle(searchParams.get('title')!)
      else title = 'Homepage'

      if (search && search.length > 0) {
        presenceData.state = `Searching "${search}"`
      }
      else if (action === 'history') {
        presenceData.state = `Viewing history: ${title}`
        presenceData.buttons = [
          {
            label: 'View Page',
            url: `${origin}/${titleToUrl(title)}`,
          },
        ]
      }
      else if (action === 'purge') {
        presenceData.state = `Purging: ${title}`
        presenceData.buttons = [
          {
            label: 'View Page',
            url: `${origin}/${titleToUrl(title)}`,
          },
        ]
      }
    }
    else if (pathname.toLowerCase().startsWith('/user:')) {
      presenceData.state = `Viewing User: ${pathname.match(/\/user:(.*)/i)?.[1]}`
      presenceData.buttons = [
        {
          label: 'View User',
          url: href,
        },
      ]
    }
    else if (pathname.toLowerCase().startsWith('/category:')) {
      presenceData.state = `Viewing Category: ${urlToTitle(
        pathname.match(/\/category:(.*)/i)?.[1] ?? '',
      )}`
      presenceData.buttons = [
        {
          label: 'View Category',
          url: href,
        },
      ]
    }
    else if (pathname.toLowerCase().startsWith('/file:')) {
      presenceData.state = `Viewing File: ${pathname.match(/\/file:(.*)/i)?.[1]}`
      presenceData.buttons = [
        {
          label: 'View File',
          url: href,
        },
      ]
    }
    else if (pathname.toLowerCase().startsWith('/special:')) {
      if (pathname.toLowerCase().startsWith('/special:movepage/')) {
        const title = urlToTitle(pathname.substring(18))
        presenceData.state = `Moving: ${title}`
        presenceData.buttons = [
          {
            label: 'View Page',
            url: `${origin}/${titleToUrl(title)}`,
          },
        ]
      }
      else if (pathname.toLowerCase().startsWith('/special:notifications')) {
        presenceData.state = 'Checking Notifications'
      }
      else if (pathname.toLowerCase().startsWith('/special:preferences')) {
        presenceData.state = 'Viewing Settings'
      }
    }
    else if (
      pathname.toLowerCase().startsWith('/user_talk:')
      || pathname.toLowerCase().startsWith('/userwiki:')
      || pathname.toLowerCase().startsWith('/jojo_wiki:')
    ) {
      // nothing here, just used to ignore these as long as no functionality is applied to them.
    }
    else if (
      pathname.toLowerCase().startsWith('/list_of_references_to_jojo')
    ) {
      presenceData.state = 'Browsing JoJo References 👀'
      presenceData.buttons = [
        {
          label: 'Join The Fun!',
          url: href,
        },
      ]
    }
    else if (pathname.toLowerCase().startsWith('/talk:')) {
      presenceData.state = `Discussing: ${document
        .querySelector('#firstHeading')
        ?.innerHTML
        .replace(/^Talk:/, '')}`
      presenceData.buttons = [
        {
          label: 'Join The Discussion!',
          url: href,
        },
      ]
    }
    else {
      const title = urlToTitle(location.pathname.substring(1))

      if (
        searchParams.get('veswitched')?.length
        || searchParams.get('veaction') === 'edit'
      ) {
        presenceData.state = `Editing: ${title}`
        presenceData.buttons = [
          {
            label: 'View Page',
            url: `${origin}/${titleToUrl(title)}`,
          },
        ]
      }
      else {
        presenceData.state = `Reading: ${title}`
        presenceData.buttons = [
          {
            label: 'View Page',
            url: href,
          },
        ]
      }
    }
  }
  if (hostname === 'jojo-news.com') {
    presenceData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/JoJo%27s%20Bizarre%20Encyclopedia/assets/0.png',
      smallImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/JoJo%27s%20Bizarre%20Encyclopedia/assets/2.png',
      smallImageText: 'jojo-news.com',
    }
    presenceData.details = 'Browsing News'

    if (pathname === '' || pathname === '/' || pathname === '/JoJo_Wiki') {
      presenceData.state = 'Viewing: Homepage'
    }
    else if (pathname.match(/^\/\d+\/\d+\/\d+\//)) {
      presenceData.state = `Reading ${
        document.querySelectorAll('.entry-title.entry--item.h2')[0]?.innerHTML
      }`
      presenceData.buttons = [
        {
          label: 'Read Article',
          url: href,
        },
      ]
    }
    else if (pathname.toLowerCase() === '/fun/jojodle/') {
      presenceData.state = 'Playing JoJodle!'
      presenceData.buttons = [
        {
          label: 'Play Along!',
          url: href,
        },
      ]
    }
    else if (pathname.toLowerCase().includes('/category')) {
      let category = pathname.toLowerCase().match(/^\/category\/(.+)/)?.[1]

      category = newsUrlToCategory(category ?? '')

      presenceData.state = `Browsing category: ${category}`
    }
  }
  if (!showButtons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})

function titleToUrl(title: string) {
  return encodeURI(title.replace(/\s/g, '_'))
}
function urlToTitle(url: string) {
  return decodeURI(url.replaceAll('_', ' '))
}
function toTitleCase(phrase: string) {
  return phrase
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
function newsUrlToCategory(url: string) {
  url = url.replace(/(^\/|\/$)/g, '')
  const urlSplit = url.split('/')
  // Get last sub category in category list
  if (urlSplit.length > 1)
    url = urlSplit[urlSplit.length - 1]!

  url = url.replaceAll('-', ' ')
  url = toTitleCase(url)

  url = url.replace(/\bjojos\b/i, 'JoJo\'s')
  url = url.replace(/^interview$/i, 'Interviews')
  url = url.replace(/^exclusive$/i, 'Exclusives')
  url = url.replace(/^analysis$/i, 'Analyses')

  return url
}
