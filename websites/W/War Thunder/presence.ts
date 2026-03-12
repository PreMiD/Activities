const presence = new Presence({
  clientId: '1015299454292725760',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/War%20Thunder/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { hostname, pathname, search, href } = window.location
  switch (hostname) {
    case 'warthunder.com': {
      presenceData.details = 'Browsing...'
      if (/^\/[a-z]{2}\/?$/i.test(pathname)) {
        presenceData.state = 'Viewing home page'
      }
      else if (pathname.substring(3) === '/game/about') {
        presenceData.state = 'About War Thunder'
      }
      else {
        presenceData.state = document.querySelector('.content__title')?.textContent
          || document.title.match(/(.*?)(?: - War Thunder$|$)/)?.[1]
      }
      break
    }
    case 'forum.warthunder.com': {
      presenceData.details = 'Viewing forums'
      const searchPath = search.match(/\?(.*?)(?:&.*|$)/)
        ? search.match(/\?(.*?)(?:&.*|$)/)?.[1]
        : ''
      const searchParams = new URLSearchParams(search)
      const pageTitle = document.querySelector<HTMLHeadingElement>(
        '.ipsType_pageTitle',
      )?.textContent
      if (searchPath === '') {
        presenceData.state = 'Viewing home page'
      }
      else if (searchPath?.startsWith('/calendar/')) {
        presenceData.state = 'Viewing calendar'
      }
      else if (searchPath?.startsWith('/search/')) {
        if (searchParams.get('q'))
          presenceData.state = `Searching for: ${searchParams.get('q')}`
        else presenceData.state = 'Searching'
      }
      else if (searchPath?.startsWith('/forum/')) {
        presenceData.state = `Viewing category: ${pageTitle}`
      }
      else if (searchPath?.startsWith('/topic/')) {
        presenceData.state = `Viewing thread: ${pageTitle}`
      }
      else if (searchPath?.startsWith('/profile/')) {
        presenceData.state = `Viewing profile of: ${document
          .querySelector<HTMLHeadingElement>('.ipsPageHead_barText')
          ?.textContent
          ?.replace(/^\s*|\s*$/g, '')}`
      }
      else if (searchPath?.startsWith('/submit')) {
        presenceData.state = 'Creating new thread'
      }
      else if (searchPath?.startsWith('/messenger/')) {
        if (/^\d+/.test(searchPath.substring(11)))
          presenceData.state = `Reading DM: ${pageTitle}`
        else if (searchPath.startsWith('/messenger/compose'))
          presenceData.state = 'Composing new message'
        else presenceData.state = 'Viewing private messages'
      }
      else {
        presenceData.state = pageTitle
          || document.title.match(
            /(.*?)(?: - War Thunder - Official Forum$|$)/,
          )?.[1]
      }
      break
    }
    case 'live.warthunder.com': {
      presenceData.details = 'Browsing War Thunder Live'
      if (pathname.startsWith('/feed/')) {
        presenceData.state = document.title.match(/WT Live \/\/ (.*)/)?.[1]
      }
      else if (pathname.startsWith('/post/')) {
        presenceData.state = `Reading post: ${
          document.title.match(/WT Live \/\/ (.*)/)?.[1]
        }`
        presenceData.buttons = [
          {
            label: 'View Post',
            url: href,
          },
        ]
      }
      else if (pathname.startsWith('/subscribes/')) {
        presenceData.state = 'Viewing subscriptions'
      }
      else if (pathname.startsWith('/user/')) {
        presenceData.state = `Viewing profile of: ${
          document.querySelector<HTMLSpanElement>('.nickname > span')
            ?.textContent
        }`
      }
      else {
        presenceData.state = document.title
      }
      break
    }
    case 'tss.warthunder.com': {
      presenceData.details = 'Browsing War Thunder Tournament Service'
      switch (new URLSearchParams(search).get('action')) {
        case 'rating': {
          presenceData.state = 'Viewing a list of: player ratings'
          break
        }
        case 'current_tournaments': {
          presenceData.state = 'Viewing a list of: active tournaments'
          break
        }
        case 'tournament': {
          presenceData.details = 'Viewing a tournament'
          presenceData.state = document.querySelector<HTMLSpanElement>(
            '.txt_name_tournament',
          )?.textContent
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.img_tournament')?.src
          presenceData.smallImageText = `Teams: ${
            document.querySelector<HTMLSpanElement>('#all_teams_param_tour')
              ?.textContent
          } | Prize: ${
            document.querySelector('[id-tss=\'prize_pool\']')?.textContent
          }`
          presenceData.buttons = [
            {
              label: 'View Tournament',
              url: href,
            },
          ]
          break
        }
        default: {
          presenceData.state = document.title
        }
      }
      break
    }
    case 'wiki.warthunder.com': {
      presenceData.details = 'Browsing the wiki'
      const searchParams = new URLSearchParams(search)
      const title = searchParams.get('title')
        || document.querySelector<HTMLHeadingElement>('#firstHeading')
          ?.textContent
      const action = searchParams.get('action')
      if (action === 'edit')
        presenceData.state = `Editing ${title}`
      else if (action === 'history')
        presenceData.state = `Viewing revision history of: ${title}`
      else presenceData.state = title
      break
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
