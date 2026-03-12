const presence = new Presence({
  clientId: '729035228324298852',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

const assets: Record<string, string> = {
  dk: 'https://cdn.rcd.gg/PreMiD/websites/L/LabyMod/assets/0.png',
  en: 'https://cdn.rcd.gg/PreMiD/websites/L/LabyMod/assets/1.png',
  jp: 'https://cdn.rcd.gg/PreMiD/websites/L/LabyMod/assets/2.png',
  br: 'https://cdn.rcd.gg/PreMiD/websites/L/LabyMod/assets/3.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LabyMod/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  switch (document.location.hostname) {
    case 'www.labymod.net': {
      if (document.location.pathname.includes('/download')) {
        presenceData.details = 'Viewing downloads'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/ideas')) {
        presenceData.details = 'Ideas, Browsing...'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/idea')) {
        const item = document.querySelector(
          '#content > div > div:nth-child(1) > div > div:nth-child(2) > h3 > label',
        )
        let title = document.querySelector<HTMLElement>(
          '#content > div > div:nth-child(1) > div > div:nth-child(2) > h3',
        )?.textContent
        if (item?.textContent)
          title = title?.replace(item.textContent, '')

        presenceData.details = 'Ideas, Viewing:'
        presenceData.state = title

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/shop')) {
        const title = document.querySelector(
          '#variSection > div.contentWrapper > article.selectedProduct > table > tbody > tr > td:nth-child(2) > h3',
        )
        const user = document.querySelector<HTMLImageElement>('#renderoverlay')
        if (user?.width === 1) {
          presenceData.details = 'Shop, Ordering...'
          delete presenceData.state

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
        else {
          presenceData.details = 'Shop, Viewing:'
          presenceData.state = title?.textContent?.replace('LABYMOD', '')

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
      }
      else if (document.location.pathname.includes('/dashboard')) {
        presenceData.details = 'Viewing their dashboard'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/coins')) {
        presenceData.details = 'Viewing their coins'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/impressum')) {
        presenceData.details = 'Viewing impressum'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/datenschutz')) {
        presenceData.details = 'Viewing datenschutz'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/tsverify')) {
        presenceData.details = 'Verify-ing their TeamSpeak'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presence.setActivity()
      }

      break
    }
    case 'faq.labymod.net': {
      presenceData.details = 'Viewing frequently'
      presenceData.state = 'asked questions'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'apply.labymod.net': {
      presenceData.details = 'Viewing Jobs'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'docs.labymod.net': {
      const title = document.querySelector(
        'body > div > main > div > div.md-content > article > h1',
      )
      const user = document.querySelector(
        'body > div > main > div > div.md-sidebar.md-sidebar--primary > div > div > nav > ul > li.md-nav__item.md-nav__item--active.md-nav__item--nested > label',
      )
      presenceData.details = 'Docs viewing:'
      presenceData.state = `${user?.textContent} - ${title?.textContent}`

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'translate.labymod.net': {
      presenceData.details = 'Translate site'
      if (document.location.pathname.includes('/users.php')) {
        presenceData.state = 'Watching Users'
        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/log.php')) {
        presenceData.state = 'Watching Log'
        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/errors.php')) {
        presenceData.state = 'Watching Errors'
        delete presenceData.smallImageKey
      }
      else if (document.location.pathname.includes('/translate/')) {
        let lang = null
        if (document.URL.includes('?project=website')) {
          lang = document.URL.replace(
            'https://translate.labymod.net/translate/?project=website&lang=',
            '',
          )
          if (document.URL.includes('#'))
            [lang] = lang.split('#')

          presenceData.smallImageKey = assets[lang!.toLowerCase()]
          presenceData.state = 'Translating Website'
        }
        else if (document.URL.includes('?project=notification')) {
          lang = document.URL.replace(
            'https://translate.labymod.net/translate/?project=website&lang=',
            '',
          )
          if (document.URL.includes('#'))
            [lang] = lang.split('#')

          presenceData.smallImageKey = assets[lang!.toLowerCase()]
          presenceData.state = 'Translating Notification'
        }
        else if (document.URL.includes('?project=client')) {
          lang = document.URL.replace(
            'https://translate.labymod.net/translate/?project=website&lang=',
            '',
          )
          if (document.URL.includes('#'))
            [lang] = lang.split('#')

          presenceData.smallImageKey = assets[lang!.toLowerCase()]
          presenceData.state = 'Translating Client'
        }
      }
      else {
        presenceData.state = 'On the Main page'
        delete presenceData.smallImageKey
      }
      presence.setActivity(presenceData)

      break
    }
    default:
      presence.setActivity()
  }
})
