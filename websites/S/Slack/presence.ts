import { Assets } from 'premid'

const presence = new Presence({
  clientId: '617113314572369973', // CLIENT ID FOR YOUR PRESENCE
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Slack/assets/logo.png',
  }

  presenceData.startTimestamp = browsingTimestamp

  if (document.location.hostname === 'app.slack.com') {
    const group = document.querySelector(
      '#team-menu-trigger > div.p-classic_nav__team_header__team > div.p-classic_nav__team_header__team__name',
    )
    const user = document.querySelector(
      'body > div.p-client_container > div > div > div.p-workspace__top_nav > div > div.p-classic_nav__channel_header.p-classic_nav__model_header > div.p-classic_nav__model__title > div.p-classic_nav__model__title__name.p-classic_nav__no_drag > button > span:nth-child(1)',
    )
    const chat = document.querySelector(
      'body > div.p-client_container > div > div > div.p-workspace__top_nav > div > div.p-classic_nav__channel_header.p-classic_nav__model_header > div.p-classic_nav__model__title > div.p-classic_nav__model__title__name.p-classic_nav__no_drag > button',
    )
    const typing = document.querySelector('#undefined')
    if (user) {
      if (!typing?.className.includes('ql-blank')) {
        presenceData.details = 'Typing in DMs to:'
        presenceData.state = `${user.textContent} (Workspace: ${group?.textContent})`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Reading DMs from:'
        presenceData.state = `${user.textContent} (Workspace: ${group?.textContent})`

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
    }
    else if (chat) {
      if (!typing?.className.includes('ql-blank')) {
        presenceData.details = 'Typing in channel:'
        presenceData.state = `#${chat.textContent} (Workspace: ${group?.textContent})`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Reading channel messages:'
        presenceData.state = `#${chat.textContent} (Workspace: ${group?.textContent})`

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
    }
    else {
      presence.setActivity()
    }
  }
  else if (
    document.location.hostname === 'slackhq.com'
    && document.location.pathname.includes('/search/')
  ) {
    const path = document.location.pathname.split('/', 7)
    presenceData.details = 'Slack Blog'
    presenceData.state = `Searching for: ${path[2]}`

    presenceData.smallImageKey = Assets.Search

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slackhq.com'
    && document.location.pathname.includes('/role/')
  ) {
    const path = document.location.pathname.split('/', 7)
    presenceData.details = 'Slack Blog'
    presenceData.state = `Searching with role: ${path[2]}`

    presenceData.smallImageKey = Assets.Search

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slackhq.com'
    && document.location.pathname.includes('/tags/')
  ) {
    const path = document.location.pathname.split('/', 7)
    presenceData.details = 'Slack Blog'
    presenceData.state = `Searching with tag: ${path[2]}`

    presenceData.smallImageKey = Assets.Search

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slackhq.com'
    && document.location.pathname.includes('/categories/')
  ) {
    const path = document.location.pathname.split('/', 7)
    presenceData.details = 'Slack Blog'
    presenceData.state = `Searching with category: ${path[2]}`

    presenceData.smallImageKey = Assets.Search

    presence.setActivity(presenceData)
  }
  else if (document.location.hostname === 'slackhq.com') {
    const group = document.querySelector(
      '#main > article > header > div > div > div > h1',
    )
    if (group) {
      presenceData.details = 'Slack Blog'
      presenceData.state = `Reading article: ${group.textContent}`

      presenceData.smallImageKey = Assets.Reading

      presence.setActivity(presenceData)
    }
    else {
      presenceData.details = 'Slack Blog'
      presenceData.state = 'Home page'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
  }
  else if (
    document.location.hostname === 'get.slack.help'
    && document.location.pathname.includes('/categories/')
  ) {
    const search = document.querySelector(
      'body > main > section > div.banner_container > h1',
    )
    presenceData.details = 'Slack Help Center'
    presenceData.state = `Browsing through category: ${search?.textContent}`

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'get.slack.help'
    && document.location.pathname.includes('/articles/')
  ) {
    const search = document.querySelector(
      'body > main > div.article_page.has_sidenav > div.article_container > div.content_col > h1',
    )
    presenceData.details = 'Slack Help Center'
    presenceData.state = `Reading article: ${search?.textContent}`

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'get.slack.help'
    && document.location.pathname.includes('/search')
  ) {
    const search = document.querySelector(
      'body > main > section.banner.banner_search_results > div > h1 > span.hidden.query_val',
    )
    presenceData.details = 'Slack Help Center'
    presenceData.state = `Searching for: ${search?.textContent}`

    presenceData.smallImageKey = Assets.Search

    presence.setActivity(presenceData)
  }
  else if (document.location.hostname === 'get.slack.help') {
    presenceData.details = 'Slack Help Center'
    presenceData.state = 'Home page'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'api.slack.com'
    && document.location.pathname.includes('/apps')
  ) {
    presenceData.details = 'Slack api'
    presenceData.state = 'Browsing through their apps'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.location.hostname === 'api.slack.com') {
    const group = document.querySelector('#api_main_content > h1')
    if (group) {
      presenceData.details = 'Slack api'
      presenceData.state = `Reading article: ${group.textContent}`

      presenceData.smallImageKey = Assets.Reading

      presence.setActivity(presenceData)
    }
    else {
      presenceData.details = 'Slack api'
      presenceData.state = 'Home page'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
  }
  else if (document.location.hostname === 'slackdemo.com') {
    presenceData.details = 'Slack Demo'
    presenceData.state = 'Trying out Slack'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/pricing')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the pricing'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/enterprise')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the enterprise plan'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/resources')
  ) {
    const path = document.location.pathname.split('/', 9)
    if (path[4]) {
      const group = document.querySelector('#main > div:nth-child(1) > h1')
      presenceData.details = 'Slack'
      presenceData.state = `Reading article: ${group?.textContent}`

      presenceData.smallImageKey = Assets.Reading

      presence.setActivity(presenceData)
    }
    else {
      presence.setActivity()
    }
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/slack-tips')
  ) {
    const path = document.location.pathname.split('/', 9)
    if (path[4]) {
      const group = document.querySelector('#main > section > div > header > h1')
      presenceData.details = 'Slack'
      presenceData.state = `Reading article: ${group?.textContent}`

      presenceData.smallImageKey = Assets.Reading

      presence.setActivity(presenceData)
    }
    else {
      presence.setActivity()
    }
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/solutions')
  ) {
    const path = document.location.pathname.split('/', 9)
    if (path[4]) {
      const group = document.querySelector(
        '#main > section.c-billboard > div > header > h1',
      )
      presenceData.details = 'Slack'
      presenceData.state = `Reading article: ${group?.textContent}`

      presenceData.smallImageKey = Assets.Reading

      presence.setActivity(presenceData)
    }
    else {
      presence.setActivity()
    }
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/features')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the features'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/security')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the security'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/customer-stories')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the customer stories'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/about')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the about page'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/partners')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the partners'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/newsroom')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the latest news'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/media-kit')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the media kit'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/careers')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Checking the careers'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'slack.com'
    && document.location.pathname.includes('/intl')
  ) {
    presenceData.details = 'Slack'
    presenceData.state = 'Home page'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.querySelector('#header_team_name > a')) {
    const group = document.querySelector('#header_team_name > a')
    presenceData.details = 'Viewing admin pages for:'
    presenceData.state = group?.textContent

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.querySelector(
      '#apps-page-app-element > header > nav > div.menu_actions > ul > li.left_margin.float_right > div > div > div > div > div.c-menu_select__label',
    )
  ) {
    const group = document.querySelector(
      '#apps-page-app-element > header > nav > div.menu_actions > ul > li.left_margin.float_right > div > div > div > div > div.c-menu_select__label',
    )
    presenceData.details = 'Viewing admin pages for:'
    presenceData.state = group?.textContent

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.querySelector(
      '#apps-page-app-element > header > nav > div.menu_actions > ul > li.left_margin.float_right > span',
    )
  ) {
    const group = document.querySelector(
      '#apps-page-app-element > header > nav > div.menu_actions > ul > li.left_margin.float_right > span',
    )
    presenceData.details = 'Viewing admin pages for:'
    presenceData.state = group?.textContent

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
