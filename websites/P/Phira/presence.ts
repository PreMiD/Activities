const presence = new Presence({
  clientId: '1328129220655972412',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Phira/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href } = document.location
  const pathArr = pathname.split('/')

  switch (pathArr[1]) {
    case '': {
      presenceData.details = 'Viewing homepage'
      break
    }
    case 'chart': {
      if (!pathArr[2]) {
        const selector = document.querySelector<HTMLSelectElement>('.select')
        presenceData.details = 'Browsing charts'
        presenceData.state = selector?.options[selector?.options.selectedIndex]?.textContent
        if (!presenceData.state)
          return
      }
      else {
        presenceData.details = document.querySelector('h1.text-5xl')
        presenceData.state = document.querySelector('h1')
        presenceData.largeImageKey = document
          .querySelector<HTMLDivElement>('.illustration')
          ?.style
          .backgroundImage
          .slice(5, -2)
        presenceData.buttons = [
          {
            label: 'View Page',
            url: href,
          },
          {
            label: 'View Uploader',
            url: document.querySelector<HTMLAnchorElement>('a[href*=\'/user/\']')
              ?.href ?? '',
          },
        ]
        if (!presenceData.details)
          return
      }
      break
    }
    case 'user': {
      if (!pathArr[2]) {
        presenceData.details = 'Browsing users'
      }
      else {
        presenceData.details = 'Viewing profile'
        presenceData.state = document.querySelector('span.text-3xl > span')
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.mask-squircle img')
        presenceData.buttons = [
          {
            label: 'View Page',
            url: href,
          },
        ]
        if (!presenceData.state)
          return
      }
      break
    }
    default: {
      presenceData.details = `Viewing ${document.querySelector('h1')}`
      if (!document.querySelector('h1'))
        return
    }
  }

  presence.setActivity(presenceData)
})
