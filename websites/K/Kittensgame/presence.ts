import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Advice = 'https://cdn.rcd.gg/PreMiD/websites/K/Kittensgame/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Kittensgame/assets/logo.png',
  Loading = 'https://cdn.rcd.gg/PreMiD/websites/K/Kittensgame/assets/1.gif',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Kittensgame',
  }
  const { pathname, href, hostname } = document.location

  switch (hostname) {
    case 'kittensgame.com': {
      if (
        document.querySelector<HTMLProgressElement>('#loadingProgressBar')
          ?.value !== 100
      ) {
        presenceData.details = 'Loading...'
        presenceData.smallImageKey = ActivityAssets.Loading
      }
      else {
        const mainData = await presence.getPageVariable(
          'gamePage.calendar.day',
          'gamePage.calendar.season',
          'gamePage.calendar.year',
          'gamePage.calendar.cycle',
        )
        const advice = document.querySelector<HTMLDivElement>('#advisorsContainer')
        presenceData.details = `Day ${mainData['gamePage.calendar.day']} - Season ${mainData['gamePage.calendar.season']}`
        presenceData.state = `Year ${mainData['gamePage.calendar.year']} - Cycle ${mainData['gamePage.calendar.cycle']}`

        if (
          advice?.textContent
          && advice.getAttribute('style')?.includes('display: block')
        ) {
          presenceData.smallImageKey = ActivityAssets.Advice
          presenceData.smallImageText = advice?.textContent
        }

        presenceData.buttons = [{ label: 'Play Game', url: href }]
      }
      break
    }
    case 'forum.kittensgame.com': {
      const username = document.querySelector('h5.mb-0')?.textContent
      const userTag = document.querySelector('.text-muted')?.textContent
      switch (true) {
        case pathname.includes('home'):
        case pathname === '/': {
          presenceData.details = `Forum - Viewing all ${document
            .querySelector('label[class*="active"]')
            ?.textContent
            ?.toLowerCase()} on the homepage`
          break
        }
        case pathname.includes('/u/'): {
          presenceData.details = `Forum - Viewing the profile of: ${
            username && userTag ? `${username} (${userTag})` : userTag
          }`
          presenceData.state = `Tab: ${document
            .querySelector('[class*="  active"]')
            ?.textContent
            ?.toLowerCase()}`
          presenceData.buttons = [{ label: 'View Profile', url: href }]
          break
        }
        case pathname.includes('/post/'): {
          presenceData.details = 'Forum - Reading post about:'
          presenceData.state = document.querySelector('[title="Comments"]')?.textContent
          presenceData.smallImageKey = Assets.Reading
          presenceData.buttons = [
            { label: 'View Post', url: href },
            {
              label: 'View Author\'s Profile',
              url: document.querySelector<HTMLAnchorElement>('.text-info')
                ?.href ?? '',
            },
          ]
          break
        }
        case pathname === '/communities': {
          presenceData.details = 'Forum - Viewing all communities'
          break
        }
      }

      break
    }
    case 'wiki.kittensgame.com': {
      const rPathname = pathname.replace(
        `/${document.querySelector('html')?.getAttribute('lang')}`,
        '',
      )
      const search = document
        .querySelector('.v-input__control')
        ?.querySelector<HTMLInputElement>('input')
      if (search?.value) {
        presenceData.details = 'Searching for:'
        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
        return presence.setActivity(presenceData)
      }

      if (rPathname === '/home') {
        presenceData.details = 'Wiki - Viewing the homepage'
      }
      else if (rPathname === '/login') {
        presenceData.details = 'Wiki - Login page'
      }
      else {
        presenceData.details = 'Wiki - Reading help article titled:'
        presenceData.state = document.querySelector<HTMLMetaElement>(
          'meta[property="og:title"]',
        )?.content
        presenceData.smallImageKey = Assets.Reading
        presenceData.buttons = [{ label: 'Read Article', url: href }]
        break
      }

      break
    }
  }

  presence.setActivity(presenceData)
})
