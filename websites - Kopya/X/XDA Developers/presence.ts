import { Assets } from 'premid'

const presence = new Presence({
  clientId: '926847727894138901',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/X/XDA%20Developers/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  if (document.location.hostname === 'www.xda-developers.com') {
    if (path.startsWith('/author')) {
      presenceData.details = 'Viewing an author:'
      presenceData.state = document.querySelector<HTMLSpanElement>(
        'body > section > div > div > div.col.main-content.col_9_of_12 > div.author_box > div > a.bio > span',
      )?.textContent
    }
    else if (path.startsWith('/search')) {
      const searchContext = document.querySelector<HTMLHeadingElement>(
        'body > section > div > div > div.col.main-content.col_9_of_12 > div.page_title > h1',
      )
      presenceData.details = 'Searching for:'
      presenceData.state = searchContext?.textContent?.substring(
        searchContext.textContent.indexOf('"') + 1,
        searchContext.textContent.lastIndexOf('"'),
      )
    }
    else if (document.location.href === 'https://www.xda-developers.com/') {
      presenceData.details = 'Home page'
    }
    else if (path.startsWith('/tag')) {
      presenceData.details = 'Browsing a tag:'
      presenceData.state = document.querySelector<HTMLHeadingElement>(
        'body > section > div > div > div.col.main-content.col_9_of_12 > div.page_title > h1',
      )?.textContent
    }
    else {
      presenceData.details = 'Reading an article:'
      presenceData.state = document.title
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
      presenceData.buttons = [{ label: 'Read article', url: document.URL }]
    }
  }
  else if (document.location.hostname === 'forum.xda-developers.com') {
    if (document.location.href === 'https://forum.xda-developers.com/') {
      presenceData.details = 'At Forum home page'
    }
    else if (path.startsWith('/conversations')) {
      presenceData.details = 'Reading conversations'
    }
    else if (path.includes('post-thread')) {
      presenceData.details = 'Writing a thread'
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Writing'
    }
    else if (path.startsWith('/c')) {
      presenceData.details = 'Browsing a category:'
      presenceData.state = document.querySelector<HTMLHeadingElement>(
        '#top > div.p-body > div.p-body-inner > div > div.p-body-main.p-body-main--withSidebar > div.p-body-content > div.p-body-header > div > div > div > h1',
      )?.textContent
    }
    else if (path.startsWith('/f')) {
      const phonePage = document.querySelector<HTMLHeadingElement>(
        '#top > div.p-body > div.p-body-inner > div > div.p-body-main.p-body-main--withSidebar > div.p-body-content > div.p-body-header > div > div.uix_headerInner > div > div.contentRow-main > div.p-title > h1',
      )
      presenceData.details = 'Viewing a forum:'
      if (phonePage) {
        presenceData.state = phonePage.textContent
      }
      else {
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '#top > div.p-body > div.p-body-inner > div > div.p-body-main.p-body-main--withSidebar > div.p-body-content > div.p-body-header > div > div.uix_headerInner > div > div > div > h1',
        )?.textContent
      }
    }
    else if (path.startsWith('/t')) {
      presenceData.details = 'Viewing a thread:'
      presenceData.state = document.querySelector<HTMLHeadingElement>(
        '#top > div.p-body > div.p-body-inner > div > div.p-body-main.p-body-main--withSidebar > div.p-body-content > div.p-body-header > div > div > div.p-title > h1',
      )?.textContent
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Reading'
    }
    else if (path.startsWith('/m')) {
      if (path === '/m/') {
        presenceData.details = 'Browsing members list'
      }
      else {
        presenceData.details = 'Viewing a member:';
        [presenceData.state] = document.title.split('|', 1)
      }
    }
    else if (path.startsWith('/whats-new')) {
      presenceData.details = 'Browsing What\'s New'
      if (path.includes('posts'))
        presenceData.state = 'Viewing new posts'
      else if (path.includes('profile-posts'))
        presenceData.state = 'Viewing new profile posts'
      else if (path.includes('latest-activity'))
        presenceData.state = 'Viewing latest activies'
    }
    else if (path.startsWith('/search')) {
      const searchContent = document.querySelector<HTMLAnchorElement>(
        '#top > div.p-body > div.p-body-inner > div > div.p-body-main.p-body-main--withSidebar > div.p-body-content > div.p-body-header > div > div > div > h1 > a > em',
      )
      if (!searchContent) {
        presenceData.details = 'Searching...'
      }
      else {
        presenceData.details = 'Searching for:'
        presenceData.state = searchContent.textContent
      }
    }
    else if (path.startsWith('/login')) {
      presenceData.details = 'Logging in'
    }
    else if (path.startsWith('/register')) {
      presenceData.details = 'Registering an account'
    }
    else if (path.startsWith('/account')) {
      presenceData.details = 'Viewing account settings'
    }
  }
  presence.setActivity(presenceData)
})
