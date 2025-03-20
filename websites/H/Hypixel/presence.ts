import { Assets } from 'premid'

const presence = new Presence({
  clientId: '629093766170411014',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hypixel/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  switch (document.location.hostname) {
    case 'hypixel.net': {
      const title = document.querySelector<HTMLElement>('.p-title  h1.p-title-value')
      if (document.location.pathname.includes('/threads/')) {
        presenceData.details = 'Forums, viewing thread:'
        if (title?.textContent && title.textContent.length > 128)
          presenceData.state = `${title.textContent.substring(0, 125)}...`
        else presenceData.state = title?.textContent

        delete presenceData.smallImageKey
        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/forums/')) {
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
      else if (
        document.location.pathname.includes('/find-new/')
        && document.location.pathname.includes('/profile-posts')
      ) {
        presenceData.details = 'Forums, Viewing the list of'
        presenceData.state = 'latest profile posts'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.location.pathname.includes('/find-new/')
        && document.location.pathname.includes('/posts')
      ) {
        presenceData.details = 'Forums, Viewing the list of'
        presenceData.state = 'latest posts'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.location.pathname.includes('/find-new/')
        && document.location.pathname.includes('/media')
      ) {
        presenceData.details = 'Forums, Viewing the list of'
        presenceData.state = 'latest media posts'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/search/')) {
        const search = document.querySelector<HTMLInputElement>(
          '#headerFix > div.hypixel_titleWrapper > div > div > h1 > a > em',
        )
        if (search) {
          presenceData.details = 'Forums, searching for:'
          presenceData.state = search.value

          presenceData.smallImageKey = Assets.Search

          presence.setActivity(presenceData)
        }
        else {
          presenceData.details = 'Forums, about to search'
          presenceData.state = 'something up'

          presenceData.smallImageKey = Assets.Search

          presence.setActivity(presenceData)
        }
      }
      else if (document.location.pathname.includes('/members/')) {
        const user = document.querySelector<HTMLElement>(
          '.p-title h1.p-title-value playerWrapper',
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
      else if (document.location.pathname.includes('/media/')) {
        if (
          document.querySelector(
            '#content > div > div > div.uix_contentFix > div > div > div.mediaAttribution > h1',
          )
        ) {
          const title = document.querySelector<HTMLElement>(
            '#content > div > div > div.uix_contentFix > div > div > div.mediaAttribution > h1',
          )
          presenceData.details = 'Media, Viewing post:'
          presenceData.state = title?.textContent

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
        else if (document.location.pathname.includes('/categories/')) {
          const title = document.querySelector<HTMLElement>(
            '#headerFix > div.hypixel_titleWrapper > div > div > h1',
          )
          const search = document.querySelector<HTMLInputElement>(
            '#headerFix > div.hypixel_titleWrapper > div > div > h1 > nav',
          )
          presenceData.details = 'Media, Viewing category:'
          presenceData.state = title?.textContent?.replace(search?.value ?? '', '').replace('»', '')

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
        else {
          presenceData.details = 'Media, Browsing...'
          delete presenceData.state

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
      }
      else if (document.location.pathname.includes('/conversations/')) {
        if (
          document.querySelector(
            '#headerFix > div.hypixel_titleWrapper > div > div > h1',
          )
        ) {
          const title = document.querySelector<HTMLElement>(
            '#headerFix > div.hypixel_titleWrapper > div > div > h1',
          )
          const search = document.querySelector(
            '#headerFix > div.hypixel_titleWrapper > div > div > h1 > nav',
          )
          const text = title?.textContent?.replace(search?.textContent ?? '', '')
            .replace('»', '')
          presenceData.details = 'Forums, Reading DM:'
          if (text && text.length > 128)
            presenceData.state = `${text.substring(0, 125)}...`
          else presenceData.state = text

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
      else if (document.location.pathname.includes('/players/')) {
        presenceData.details = 'Leaderboards, Browsing...'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/player/')) {
        presenceData.details = 'Players, Viewing:'
        presenceData.state = document.location.pathname.split('/').pop()

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/play/')) {
        presenceData.details = 'At: Play on Hypixel'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/rules/')) {
        presenceData.details = 'Viewing the rules'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/jobs/')) {
        presenceData.details = 'Viewing the jobs'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/help/')) {
        presenceData.details = 'Help, viewing:'
        const title = document.querySelector<HTMLElement>(
          '#headerFix > div.hypixel_titleWrapper > div > div > h1',
        )
        const search = document.querySelector(
          '#headerFix > div.hypixel_titleWrapper > div > div > h1 > nav',
        )
        const text = title?.textContent?.replace(search?.textContent ?? '', '')
          .replace('»', '')
        presenceData.state = text

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/leaderboard')) {
        const title = document.querySelector<HTMLElement>(
          '#headerFix > div.hypixel_titleWrapper > div > div > h1',
        )
        const search = document.querySelector(
          '#headerFix > div.hypixel_titleWrapper > div > div > h1 > nav',
        )
        const text = title?.textContent
          ?.replace(search?.textContent ?? '', '')
          .replace('»', '')
          .replace(' - Leaderboard', '')
        presenceData.details = 'Leaderboards, Viewing:'
        presenceData.state = text

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (title && title.textContent === 'Games') {
        const title = document.querySelector<HTMLElement>(
          '#headerFix > div.hypixel_titleWrapper > div > div > h1',
        )
        const search = document.querySelector(
          '#headerFix > div.hypixel_titleWrapper > div > div > h1 > nav',
        )
        const text = title?.textContent
          ?.replace(search?.textContent ?? '', '')
          .replace('»', '')
        presenceData.details = 'Viewing game:'
        presenceData.state = text

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presence.setActivity()
      }

      break
    }
    case 'support.hypixel.net': {
      presenceData.details = 'Support Center'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'store.hypixel.net': {
      const title = document.querySelector<HTMLElement>('head > title')
      presenceData.details = 'Store, viewing:'
      presenceData.state = title?.textContent?.replace('Hypixel Store | ', '')

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    default:
      presence.setActivity()
  }
})
