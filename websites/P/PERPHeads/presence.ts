import { Assets } from 'premid'

const presence = new Presence({
  clientId: '798312419260104705',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/PERPHeads/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname.includes('/threads/')) {
    const title = document.querySelector(
      'div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1',
    )
    if (title) {
      presenceData.state = title.textContent
      presenceData.details = 'Forums, viewing thread:'

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
  else if (document.location.pathname.includes('/forums/')) {
    const title = document.querySelector(
      'div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1',
    )
    if (title) {
      presenceData.state = title.textContent
      presenceData.details = 'Forums, viewing category:'

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
  else if (
    document.location.pathname.includes('/whats-new/')
    && document.location.pathname.includes('/profile-posts/')
  ) {
    presenceData.details = 'Forums, viewing the list of'
    presenceData.state = 'latest profile posts'
    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.pathname.includes('/whats-new/')
    && document.location.pathname.includes('/posts/')
  ) {
    presenceData.details = 'Forums, viewing the list of'
    presenceData.state = 'latest posts'

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/search/')) {
    const search = document.querySelector(
      'div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1 > a > em',
    )
    if (search) {
      presenceData.details = 'Forums, searching for:'
      presenceData.state = search.textContent

      presenceData.smallImageKey = Assets.Search

      presence.setActivity(presenceData)
    }
  }
  else if (document.location.pathname.includes('/members/')) {
    const user = document.querySelector(
      'div.p-body-content > div.block > div.block-container > div.block-body > div.memberHeader > div.memberProfileBanner > div.memberHeader-mainContent > div.memberHeader-content > h1 > span > span > span > span',
    )
    presenceData.details = 'Forums, viewing user:'
    presenceData.state = user?.textContent

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.location.pathname.includes('/account/')) {
    presenceData.details = 'Forums, account settings'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
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
  else if (document.location.pathname.includes('/conversations/')) {
    if (
      document.querySelector(
        'div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1',
      )
    ) {
      const title = document.querySelector(
        'div.p-body > div.p-body-inner > div.p-body-header > div.p-title > h1',
      )
      presenceData.state = title?.textContent
      presenceData.details = 'Forums, Reading a DM'
      presenceData.state = `${title}...`

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else {
      presenceData.details = 'Forums, Browsing'
      presenceData.state = 'through DMs'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
  }
  else if (document.location.hostname === 'help.perpheads.com') {
    presenceData.details = 'PERPHeads Help'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.pathname.includes('/pages/')
    && document.location.pathname.includes('/donate/')
  ) {
    presenceData.details = 'PERPHeads Donate'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity()
  }
})
