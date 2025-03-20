import { Assets } from 'premid'

const presence = new Presence({
  clientId: '631990024719695901', // CLIENT ID FOR YOUR PRESENCE
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/The%20Archon/assets/logo.png',
  }

  presenceData.startTimestamp = browsingTimestamp
  if (document.location.hostname === 'thearchon.net') {
    if (document.location.pathname.includes('/threads/')) {
      const title = document.querySelector(
        '#top > div.p-body > div > div.p-body-header > div.p-title > h1',
      )
      presenceData.details = 'Forums, viewing thread:'
      if (title?.textContent && title.textContent.length > 128)
        presenceData.state = `${title.textContent.substring(0, 125)}...`
      else presenceData.state = title?.textContent

      presenceData.smallImageKey = Assets.Reading
      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/trending/')) {
      presenceData.details = 'Forums, Viewing the list of'
      presenceData.state = 'trending threads'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/play')) {
      presenceData.details = 'Play, Viewing the servers'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/vote')) {
      presenceData.details = 'Vote, Viewing the voting websites'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/bans')) {
      presenceData.details = 'Viewing the ban page'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/profile')) {
      const user = document.querySelector(
        'body > div.pagewrapper > div.container > div > div.col-md-2 > div > h2',
      )
      presenceData.details = 'Viewing the history of:'
      presenceData.state = user?.textContent

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (
      document.location.pathname.includes('/whats-new/')
      && document.location.pathname.includes('/profile-posts')
    ) {
      presenceData.details = 'Forums, Viewing the list of'
      presenceData.state = 'latest profile posts'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (
      document.location.pathname.includes('/whats-new/')
      && document.location.pathname.includes('/posts')
    ) {
      presenceData.details = 'Forums, Viewing the list of'
      presenceData.state = 'latest posts'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (
      document.location.pathname.includes('/whats-new/')
      && document.location.pathname.includes('/news-feed')
    ) {
      presenceData.details = 'Forums, Viewing the'
      presenceData.state = 'news feed'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/whats-new/')) {
      presenceData.details = 'Forums, Viewing whats new'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/conversations/')) {
      if (document.location.pathname.split('/')[4]) {
        const title = document.querySelector(
          '#top > div.p-body > div > div.uix_titlebar > div > div > div.p-title > h1',
        )
        presenceData.details = 'Forums, Reading DM:'
        if (title?.textContent && title.textContent.length > 128)
          presenceData.state = `${title.textContent.substring(0, 125)}...`
        else presenceData.state = title?.textContent

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Forums, Browsing'
        presenceData.state = 'through their DMs'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
    }
    else if (document.location.pathname.includes('/watched/')) {
      if (document.location.pathname.includes('/threads')) {
        presenceData.details = 'Forums, Viewing their'
        presenceData.state = 'watched threads'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Forums, Viewing their'
        presenceData.state = 'watched forums'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
    }
    else if (document.location.pathname.includes('/search/')) {
      const search = document.querySelector(
        '#top > div.p-body > div > div.uix_titlebar > div > div > div > h1 > a > em',
      )
      if (search) {
        presenceData.details = 'Forums, searching for:'
        presenceData.state = search.textContent

        presenceData.smallImageKey = Assets.Search

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Forums, about to search'
        presenceData.state = 'something up'

        presenceData.smallImageKey = Assets.Search

        presence.setActivity(presenceData)
      }
    }
    else if (document.location.pathname.includes('/account/')) {
      presenceData.details = 'Forums, account settings'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/members/')) {
      if (document.URL.includes('key=staff_members')) {
        presenceData.details = 'Viewing the list'
        presenceData.state = 'of staff members'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.URL.includes('key=todays_birthdays')) {
        presenceData.details = 'Viewing list of members'
        presenceData.state = 'with today as their birthday'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.URL.includes('key=highest_reaction_score')) {
        presenceData.details = 'Viewing list of members'
        presenceData.state = 'with the highest ratings'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/banned')) {
        presenceData.details = 'Viewing the list'
        presenceData.state = 'of banned users'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/list')) {
        presenceData.details = 'Viewing the list'
        presenceData.state = 'of all users'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.URL.includes('key=most_likes')) {
        presenceData.details = 'Viewing list of members'
        presenceData.state = 'with the most reactions'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.URL.includes('key=most_messages')) {
        presenceData.details = 'Viewing list of members'
        presenceData.state = 'with the most messages'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector(
          '#top > div.p-body > div > div.p-body-main > div > div > div > div > div > div > div.memberHeader-main > div > h1 > span > span',
        )
      ) {
        const user = document.querySelector(
          '#top > div.p-body > div > div.p-body-main > div > div > div > div > div > div > div.memberHeader-main > div > h1 > span > span',
        )
        presenceData.details = 'Viewing user:'
        presenceData.state = user?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector(
          '#top > div.p-body > div > div.p-body-main > div > div > div > div > div > div > div.memberHeader-main > div > h1 > span',
        )
      ) {
        const user = document.querySelector(
          '#top > div.p-body > div > div.p-body-main > div > div > div > div > div > div > div.memberHeader-main > div > h1 > span',
        )
        presenceData.details = 'Viewing user:'
        presenceData.state = user?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Viewing overview of members'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
    }
    else if (document.location.pathname.includes('/forums/')) {
      const title = document.querySelector(
        '#top > div.p-body > div > div.p-body-header > div.p-title > h1',
      )
      if (title && title.textContent !== 'THEARCHON') {
        presenceData.details = 'Forums, viewing category:'
        presenceData.state = title.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Forums, Browsing...'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
    }
    else if (document.location.pathname.includes('/staff')) {
      presenceData.details = 'Viewing the list'
      presenceData.state = 'of staff members'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/community/')) {
      presenceData.details = 'Forums, Browsing...'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname === '/') {
      presenceData.details = 'Viewing home page'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else {
      presence.setActivity()
    }
  }
  else if (document.location.hostname === 'shop.thearchon.net') {
    const title = document.querySelector('head > title')
    presenceData.details = 'Store, viewing:'
    presenceData.state = title?.textContent?.replace('TheArchon Store | ', '')

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
