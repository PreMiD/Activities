const presence = new Presence({
  clientId: '1017489991930232902',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MetaBrainz/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { hostname, pathname, search } = window.location
  switch (hostname) {
    case 'metabrainz.org': {
      presenceData.details = 'Browsing...'
      switch (pathname) {
        case '/': {
          presenceData.state = 'Home page'
          break
        }
        case '/profile': {
          presenceData.details = 'Viewing MetaBrainz profile'
          presenceData.state = new URLSearchParams(search).get(
            'musicbrainz_id',
          )
          break
        }
        default: {
          presenceData.state = document.title.split(
            ' - MetaBrainz Foundation',
          )[0]
        }
      }
      break
    }
    case 'blog.metabrainz.org': {
      presenceData.details = 'Reading blog'
      if (pathname === '/') {
        presenceData.state = 'Home page'
      }
      else if (pathname.startsWith('/author/')) {
        presenceData.state = `Viewing articles by ${
          pathname.match(/^\/author\/(.*?)\//)?.[1]
        }`
      }
      else if (pathname.startsWith('/tag/')) {
        presenceData.state = `Viewing articles tagged '${
          document.querySelector<HTMLSpanElement>('.page-title > span')
            ?.textContent || pathname.match(/^\/tag\/(.*?)\//)?.[1]
        }'`
      }
      else if (pathname.startsWith('/category/')) {
        presenceData.state = `Viewing category '${
          document.querySelector<HTMLSpanElement>('.page-title > span')
            ?.textContent || pathname.match(/^\/category\/(.*?)\//)?.[1]
        }'`
      }
      else if (/^\/\d+\/(?:\d+\/)?$/.test(pathname)) {
        presenceData.state = `Viewing articles created in ${
          document.querySelector<HTMLSpanElement>('.page-title > span')
            ?.textContent
        }`
      }
      else {
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '.entry-title',
        )?.textContent
      }
      break
    }
    case 'community.metabrainz.org': {
      presenceData.details = 'Browsing forum'
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/MetaBrainz/assets/0.png'
      if (pathname === '/') {
        presenceData.state = 'Home page'
      }
      else if (pathname.startsWith('/c/') || /^\/tags\/c\/.+/.test(pathname)) {
        presenceData.state = `Viewing category '${
          document.querySelector<HTMLSpanElement>('.category-name')?.textContent
        }'`
      }
      else if (pathname.startsWith('/t/')) {
        presenceData.state = document.querySelector<HTMLAnchorElement>('.fancy-title')?.textContent
      }
      else if (/^\/g\/.+/.test(pathname)) {
        presenceData.state = `Viewing group '${
          document.querySelector<HTMLSpanElement>('.group-info-name')
            ?.textContent
        }'`
      }
      else if (/^\/categories\/?/.test(pathname)) {
        presenceData.state = 'Viewing categories'
      }
      else if (pathname === '/login-preferences') {
        presenceData.state = 'Logging in'
      }
      else if (pathname.startsWith('/u/')) {
        presenceData.state = `Viewing profile of ${
          document.querySelector<HTMLHeadingElement>('.username')?.textContent
        }`
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
          '.user-profile-avatar > img',
        )?.src
        presenceData.smallImageText = document.querySelector<HTMLHeadingElement>('.full-name')?.textContent
      }
      else {
        presenceData.state = document.title.split(
          ' - MetaBrainz Community Discourse',
        )[0]
      }
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
