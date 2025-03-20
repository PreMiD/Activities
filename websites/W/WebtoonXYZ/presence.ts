import { Assets } from 'premid'

const presence = new Presence({
  clientId: '836962986451140609',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/WebtoonXYZ/assets/0.png',
  View = 'https://cdn.rcd.gg/PreMiD/websites/W/WebtoonXYZ/assets/1.png',
  Logo2 = 'https://cdn.rcd.gg/PreMiD/websites/W/WebtoonXYZ/assets/2.png',
  Settings = 'https://cdn.rcd.gg/PreMiD/websites/W/WebtoonXYZ/assets/3.png',
  Solo = 'https://cdn.rcd.gg/PreMiD/websites/W/WebtoonXYZ/assets/4.png',
}

presence.on('UpdateData', async () => {
  const [logo, buttons] = await Promise.all([
    presence.getSetting<number>('logo'),
    presence.getSetting<boolean>('buttons'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: !logo ? ActivityAssets.Logo : ActivityAssets.Logo2,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location

  if (pathname === '/' && search.substring(0, 2) === '?s') {
    presenceData.details = 'Searching:'
    presenceData.state = `'${new URLSearchParams(search).get('s')}' 🔸 ${
      document.querySelector('.c-blog__heading > .h4')?.textContent?.split(' ')[0]
    } results`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (pathname.endsWith('/webtoons/')) {
    presenceData.details = 'Browsing all webtoons'
    presenceData.state = document.querySelector(
      '.c-blog__heading > .h4',
    )?.textContent
  }
  else if (pathname.startsWith('/webtoon-genre/')) {
    presenceData.details = `Browsing ${
      document.querySelector('.item-title')?.textContent
    } webtoons`
    presenceData.state = `📋 ${
      document.querySelector('.c-blog__heading > .h4')?.textContent
    }`
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname === '/completed-webtoons/') {
    presenceData.details = 'Browsing:'
    presenceData.state = 'Completed webtoons'
    presenceData.smallImageKey = Assets.Search
  }
  else if (pathname.startsWith('/read') && pathname.indexOf('/chapter') > 0) {
    const [title, chapter] = document
      .querySelector('#chapter-heading')
      ?.textContent
      ?.split('-') ?? []
    const isAdult = !!document.querySelector('.btn-adult-confirm')
    let progress = (document.documentElement.scrollTop
      / ((document.querySelector('.reading-content')?.scrollHeight ?? 0)
        - window.innerHeight))
      * 100
    progress = Math.ceil(progress) > 100 ? 100 : Math.ceil(progress)
    presenceData.details = isAdult ? 'Reading a webtoon' : title
    presenceData.state = `📖 ${chapter} 🔸 ${progress}%`
    presenceData.largeImageKey = title?.includes('Solo Leveling')
      ? ActivityAssets.Solo
      : logo === 0
        ? ActivityAssets.Logo
        : ActivityAssets.Logo2
    presenceData.smallImageKey = Assets.Reading
    if (buttons && !isAdult) {
      presenceData.buttons = [
        {
          label: 'Read Webtoon',
          url: href,
        },
      ]
    }
  }
  else if (pathname.startsWith('/read')) {
    if (document.querySelector('.manga-title-badges.adult')) {
      presenceData.details = 'Viewing a webtoon'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.largeImageKey = logo === 0 ? ActivityAssets.Logo : ActivityAssets.Logo2
    }
    else {
      const title = document.querySelector('.post-title')?.textContent
      presenceData.details = 'Viewing:'
      presenceData.state = title
      presenceData.smallImageKey = Assets.Viewing
      presenceData.largeImageKey = title?.includes('Solo Leveling')
        ? ActivityAssets.Solo
        : logo === 0
          ? ActivityAssets.Logo
          : ActivityAssets.Logo2
      if (buttons) {
        presenceData.buttons = [
          {
            label: 'View Webtoon',
            url: href,
          },
        ]
      }
    }
  }
  else if (pathname === '/user-settings/') {
    presenceData.smallImageKey = ActivityAssets.Settings
    switch (search) {
      case '?tab=history':
        presenceData.details = 'User settings:'
        presenceData.state = 'History'
        break
      case '?tab=bookmark':
        presenceData.details = 'User settings:'
        presenceData.state = 'Bookmarks'
        break
      case '?tab=account-settings':
        presenceData.details = 'User settings:'
        presenceData.state = 'Account settings'
        break
      default:
        presenceData.details = 'User settings:'
        presenceData.state = 'Bookmarks'
    }
  }
  presence.setActivity(presenceData)
})
