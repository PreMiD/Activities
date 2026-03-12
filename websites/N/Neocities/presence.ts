import { Assets } from 'premid'

const presence = new Presence({
  clientId: '945295281728159744',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Neocities/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname } = document.location
  const [image, buttons] = await Promise.all([
    presence.getSetting<boolean>('image'),
    presence.getSetting<boolean>('buttons'),
  ])
  const pageIcon = document.querySelector<HTMLLinkElement>('link[rel~=\'icon\']')
  const shortTitle = document.title.split(/-(.+)/)[1]

  if (hostname === 'neocities.org') {
    if (pathname === '/') {
      presenceData.details = 'Home page'
    }
    else if (pathname === '/browse') {
      presenceData.details = 'Browsing sites'
      presenceData.smallImageKey = Assets.Search
    }
    else if (pathname.startsWith('/site/')) {
      presenceData.details = 'Viewing a site:'
      presenceData.state = document.querySelector<HTMLSpanElement>('h2 > span')?.textContent
      presenceData.smallImageKey = Assets.Reading
      presenceData.buttons = [{ label: 'View site', url: document.URL }]
    }
    else if (pathname === '/activity') {
      presenceData.details = 'Viewing Recent Activities'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (pathname.startsWith('/tutorial')) {
      presenceData.smallImageKey = Assets.Reading
      if (pathname === '/tutorials' || pathname === '/tutorial') {
        presenceData.details = 'Looking through tutorials'
      }
      else {
        presenceData.details = 'In a course:'
        presenceData.state = shortTitle
      }
    }
    else if (pathname === '/dashboard') {
      presenceData.details = 'Viewing their site'
    }
    else if (pathname.includes('/text_editor')) {
      presenceData.details = 'In the Text Editor'
      presenceData.state = shortTitle
      presenceData.smallImageKey = Assets.Writing
    }
  }
  else if (hostname === 'blog.neocities.org') {
    presenceData.details = 'Reading blogs'
    presenceData.smallImageKey = Assets.Reading
    if (pathname.startsWith('/blog')) {
      presenceData.details = 'Reading a blog:'
      presenceData.state = document.title
      presenceData.buttons = [{ label: 'Read blog', url: document.URL }]
    }
  }
  else {
    presenceData.details = document.title
    presenceData.state = `by ${hostname.split('.')[0]}`
    if (image && pageIcon)
      presenceData.largeImageKey = pageIcon.href
    presenceData.buttons = [
      { label: 'View Page', url: document.location.origin },
    ]
  }
  if (!buttons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})
