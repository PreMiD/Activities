import { Assets } from 'premid'

const presence = new Presence({
  clientId: '625795936286932993',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Spigot/assets/logo.png',
  }

  presenceData.startTimestamp = browsingTimestamp
  switch (document.location.hostname) {
    case 'www.spigotmc.org': {
      if (document.location.pathname.includes('/threads/')) {
        const title = document.querySelector(
          '#content > div > div > div.mainContainer_noSidebar > div > div.titleBar > h1',
        )
        if (title === null) {
          const title = document.querySelector(
            '#content > div > div > div.mainContainer_noSidebar > div > div.resourceInfo > h1',
          )
          presenceData.details = 'Forums, viewing thread:'
          if (title?.textContent && title.textContent.length > 128)
            presenceData.state = `${title.textContent.substring(0, 125)}...`
          else presenceData.state = title?.textContent

          delete presenceData.smallImageKey
          presence.setActivity(presenceData)
        }
        else {
          presenceData.details = 'Forums, viewing thread:'
          if (title?.textContent && title.textContent.length > 128)
            presenceData.state = `${title.textContent.substring(0, 125)}...`
          else presenceData.state = title?.textContent

          delete presenceData.smallImageKey
          presence.setActivity(presenceData)
        }
      }
      else if (document.location.pathname.includes('/forums/')) {
        const title = document.querySelector(
          '#content > div > div > div.mainContainer_noSidebar > div > div.titleBar > h1',
        )
        if (title) {
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
      else if (document.location.pathname.includes('/search/')) {
        const search = document.querySelector(
          '#content > div > div > div.uix_contentFix > div > div > div.titleBar > h1 > a > em',
        )
        presenceData.details = 'Forums, searching for:'
        presenceData.state = search?.textContent

        presenceData.smallImageKey = Assets.Search

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/members/')) {
        const user = document.querySelector(
          '#content > div > div > div.mainContainer_noSidebar > div > div > div.mainProfileColumn > div > div > h1',
        )
        presenceData.details = 'Forums, viewing user:'
        presenceData.state = user?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/XenStaff/')) {
        presenceData.details = 'Forums, viewing staff list'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/account/')) {
        presenceData.details = 'Forums, account settings'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/wiki/')) {
        const title = document.querySelector(
          '#content > div > div > div.uix_contentFix > div > div > div.titleBar > h1',
        )
        presenceData.details = 'Wiki, viewing:'
        presenceData.state = title?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/irc/')) {
        presenceData.details = 'Spigot IRC'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/resources/')) {
        if (document.querySelector('#divResourcesFround')) {
          const search = document.querySelector('#divResourcesFround')
          if (search?.textContent !== 'Resources Found: 0') {
            presenceData.details = 'Using SpigotSearchEngine:'
            presenceData.state = search?.textContent

            presenceData.smallImageKey = Assets.Search

            presence.setActivity(presenceData)
          }
          else {
            presenceData.details = 'Resources, Browsing...'
            delete presenceData.state

            delete presenceData.smallImageKey

            presence.setActivity(presenceData)
          }
        }
        else if (document.location.pathname.includes('/authors/')) {
          const title = document.querySelector(
            '#authorStats > div > dl.authorName > dd > a',
          )
          presenceData.details = 'Resources, Viewing author:'
          presenceData.state = title?.textContent

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
        else if (document.location.pathname.includes('/categories/')) {
          const title = document.querySelector(
            '#content > div > div > div.mainContainer_noSidebar > div > div.titleBar > h1',
          )
          presenceData.details = 'Resources, Viewing category:'
          presenceData.state = title?.textContent

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
        else if (
          document.querySelector(
            '#content > div > div > div.uix_contentFix > div > div > div.resourceInfo > h1',
          )
        ) {
          const title = document.querySelector(
            '#content > div > div > div.uix_contentFix > div > div > div.resourceInfo > h1',
          )
          presenceData.details = 'Resources, Viewing:'
          if (title?.textContent && title.textContent.length > 128)
            presenceData.state = `${title.textContent.substring(0, 125)}...`
          else presenceData.state = title?.textContent

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
        else if (document.location.pathname.includes('/edit')) {
          presenceData.details = 'Resources, Doing an edit...'
          delete presenceData.state

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
        else {
          presenceData.details = 'Resources, Browsing...'
          delete presenceData.state

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
      }
      else if (document.location.pathname.includes('/conversations/')) {
        if (
          document.querySelector(
            '#content > div > div > div.uix_contentFix > div > div > div.titleBar > h1',
          )
        ) {
          const title = document.querySelector(
            '#content > div > div > div.uix_contentFix > div > div > div.titleBar > h1',
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
      else {
        presence.setActivity()
      }

      break
    }
    case 'irc.spi.gt': {
      presenceData.details = 'Spigot IRC'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'hub.spigotmc.org': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Spigot Developer Hub'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        const title = document.querySelector('head > title')
        presenceData.details = 'Spigot Developer Hub'
        presenceData.state = title?.textContent?.replace(
          ' · hub.spigotmc.org',
          '',
        )

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    default:
      presence.setActivity()
  }
})
