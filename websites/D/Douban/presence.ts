const presence = new Presence({
  clientId: '1341778656762134538',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://litomore.me/images/douban-512.png',
}

function getTitle() {
  return document.title.replace(/ \| 豆瓣阅读$/, '')
}

presence.on('UpdateData', async () => {
  const { href, pathname, hostname } = document.location
  const args = pathname.split('/')

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  /**
   * Home
   */
  if (hostname === 'douban.com' || hostname === 'www.douban.com') {
    presenceData.details = 'Exploring Douban'
    if (pathname.startsWith('/podcast_episode')) {
      presenceData.details = 'Listening to Podcast Episode'
      presenceData.state = getTitle()
    }
    else if (pathname.startsWith('/podcast')) {
      presenceData.details = 'Exploring Podcast'
      presenceData.state = getTitle()
    }
    else if (pathname.startsWith('/location')) {
      presenceData.details = 'Viewing Douban Location'
      presenceData.state = getTitle()
    }
    else if (pathname.startsWith('/event')) {
      presenceData.details = 'Viewing Douban Location Event'
      presenceData.state = getTitle()
    }
    else if (pathname.startsWith('/group')) {
      presenceData.details = 'Exploring Douban Group'
      if (args[2] === 'topic') {
        presenceData.state = 'Viewing Group Topic'
        if (args[3]) {
          presenceData.state = getTitle()
        }
      }
      else if (args[2] === 'discussion') {
        presenceData.state = 'Viewing Group Discussion'
        if (args[3]) {
          presenceData.state += getTitle()
        }
      }
      else {
        presenceData.state = getTitle()
      }
    }
  }

  /**
   * Book
   */
  else if (hostname === 'book.douban.com') {
    presenceData.details = 'Exploring Douban Book'
    if (pathname.startsWith('/subject') && args[2]) {
      presenceData.details = 'Viewing Book Item'
      if (args[3] === 'blockquotes') {
        presenceData.state = 'Viewing Book Blockquotes'
      }
      else if (args[3] === 'comments') {
        presenceData.state = 'Exploring Book Comments'
      }
      presenceData.state = getTitle()
      presenceData.buttons = [{ label: 'View Book', url: href }]
    }
    else if (pathname.startsWith('/tag')) {
      presenceData.details = 'Exploring Book Tags'
      presenceData.state = args[2] ? `Tag: ${args[2]}` : getTitle()
      if (args[2]) {
        presenceData.buttons = [{ label: 'View Tag', url: href }]
      }
    }
    else if (pathname.startsWith('/updates')) {
      presenceData.details = 'Exploring Book Updates'
      presenceData.state = getTitle()
    }
    else if (pathname.startsWith('/annual')) {
      presenceData.details = 'Viewing Annual Book List'
      presenceData.state = getTitle()
    }
  }

  /**
   * Movie
   */
  else if (hostname === 'moive.douban.com') {
    presenceData.details = 'Exploring Douban Movie'
    if (pathname.startsWith('/subject') && args[2]) {
      presenceData.details = 'Viewing Movie Item'
      if (args[3] === 'reviews') {
        presenceData.state = 'Exploring Movie Reviews'
      }
      else if (args[3] === 'comments') {
        presenceData.state = 'Exploring Movie Comments'
      }
      else if (args[3] === 'discussion') {
        presenceData.state = 'Exploring Movie Discussions'
        if (args[4]) {
          presenceData.state += `: ${args[4]}`
        }
      }
      presenceData.state = getTitle()
      presenceData.buttons = [{ label: 'View Movie', url: href }]
    }
    else if (pathname.startsWith('/mine')) {
      presenceData.details = 'Viewing My Movie List'
      presenceData.state = getTitle()
    }
    else if (pathname.startsWith('/tv')) {
      presenceData.details = 'Viewing TV Series'
      presenceData.state = getTitle()
    }
    else if (pathname.startsWith('/trend')) {
      presenceData.details = 'Viewing Movie Trends'
      presenceData.state = getTitle()
    }
    else if (pathname.startsWith('/review')) {
      presenceData.details = 'Viewing Movie Review'
      presenceData.state = getTitle()
      presenceData.buttons = [{ label: 'View Review', url: href }]
    }
  }

  /**
   * Music
   */
  else if (hostname === 'music.douban.com') {
    presenceData.details = 'Exploring Douban Music'
    if (pathname.startsWith('/subject') && args[2]) {
      presenceData.details = 'Viewing Music Item'
      if (args[3] === 'reviews') {
        presenceData.details = 'Exploring Music Reviews'
        presenceData.state = getTitle()
      }
      else if (args[3] === 'comments') {
        presenceData.details = 'Exploring Music Comments'
        presenceData.state = getTitle()
      }
      else if (args[3] === 'discussion') {
        presenceData.state = 'Exploring Music Discussions'
        presenceData.state = getTitle()
      }
      presenceData.state = getTitle()
      presenceData.buttons = [{ label: 'View Music', url: href }]
    }
  }

  /**
   * Market
   */
  else if (hostname === 'market.douban.com') {
    presenceData.details = 'Exploring Douban Market'
    if (pathname.startsWith('/detail')) {
      presenceData.details = 'Viewing Douban Market Item'
      presenceData.state = getTitle()
      presenceData.buttons = [{ label: 'View Item', url: href }]
    }
  }

  presence.setActivity(presenceData)
})
