import { Assets } from 'premid'

const presence = new Presence({
  clientId: '908721185863397426',
})
const browsingTimestamp = Math.floor(Date.now() / 1e3)

presence.on('UpdateData', () => {
  const { pathname, origin } = window.location
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Wuxiaworld/assets/logo.png',
  }
  if (document.querySelector('.navbar-form input') === document.activeElement) {
    presenceData.details = 'Searching:'
    presenceData.state = (
      document.querySelector('.navbar-form input') as HTMLInputElement
    ).value
    presenceData.smallImageKey = Assets.Search
  }
  else {
    if (pathname.includes('emperors-domination')) {
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/W/Wuxiaworld/assets/0.png'
    }
    if (/^\/$/.test(pathname)) {
      presenceData.details = 'Viewing Home Page'
    }
    else if (/^\/novels\/?$/.test(pathname)) {
      // Counting comics
      presenceData.details = 'Viewing Novels List'
      presenceData.state = `📋 ${
        document.querySelectorAll('.novel-item').length
      } novels found`
    }
    else if (/^\/novel\/[0-9a-z-]+\/?$/i.test(pathname)) {
      presenceData.details = 'Viewing Novel'
      presenceData.state = document.querySelector('.novel-body h2')?.textContent
      presenceData.smallImageKey = Assets.Viewing
      presenceData.buttons = [
        {
          label: 'Visit Novel Page',
          url: origin + pathname,
        },
      ]
    }
    else if (
      /^\/novel\/[^;]*\/[a-z]+-chapter-\d+\/?/i.test(pathname)
    ) {
      let progress = (document.documentElement.scrollTop
        / (document.querySelector('#chapter-outer')!.scrollHeight
          - window.innerHeight))
        * 100
      progress = Math.ceil(progress) > 100 ? 100 : Math.ceil(progress)

      presenceData.details = document.querySelector('.caption a h4')?.textContent
      presenceData.state = `📖 ${
        document.querySelector('#chapter-outer .caption h4')?.textContent
      } 🔸 ${progress}%`
      presenceData.smallImageKey = Assets.Reading
      presenceData.buttons = [
        {
          label: 'Visit Novel Page',
          url: origin
            + (document.querySelector('.caption a') as HTMLAnchorElement).href,
        },
        {
          label: 'Visit Chapter',
          url: origin + pathname,
        },
      ]
    }
    else {
      presenceData.details = 'Browsing Wuxiaworld'
      presenceData.state = document.title
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
})
