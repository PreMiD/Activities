import { Assets } from 'premid'

const presence = new Presence({
  clientId: '626496186496450570',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/SpongePowered/assets/logo.png',
  }

  presenceData.startTimestamp = browsingTimestamp
  switch (document.location.hostname) {
    case 'forums.spongepowered.org': {
      if (document.location.pathname.includes('/t/')) {
        const title = document.querySelector(
          '#topic-title > div > div > h1 > a.fancy-title',
        ) ?? document.querySelector(
          '#ember6 > header > div > div > div.extra-info-wrapper > div > div > h1 > a > span',
        )

        presenceData.details = 'Forums, viewing thread:'
        if (title?.textContent && title.textContent.length > 128)
          presenceData.state = `${title.textContent.substring(0, 125)}...`
        else presenceData.state = title?.textContent

        delete presenceData.smallImageKey
        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/c/')) {
        const title = document.querySelector('head > title')
        presenceData.details = 'Forums, viewing category:';
        [, presenceData.state] = title?.textContent
          ?.split('topics')[0]
          ?.split('Latest') ?? []

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/search')) {
        const search = document.querySelector(
          '#ember14 > div.search-advanced > div.search-info > div.result-count > span.term',
        )
        if (search) {
          presenceData.details = 'Forums, Searching for:'
          presenceData.state = search.textContent

          presenceData.smallImageKey = Assets.Search

          presence.setActivity(presenceData)
        }
        else {
          presenceData.details = 'Forums, Going to search'
          presenceData.state = 'something up'

          presenceData.smallImageKey = Assets.Search

          presence.setActivity(presenceData)
        }
      }
      else if (document.location.pathname.includes('/u/')) {
        const user = document.querySelector(
          '#main-outlet > div:nth-child(3) > section > section > div.details > div.primary > div.primary-textual > h1',
        )
        presenceData.details = 'Forums, viewing user:'
        presenceData.state = user?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/accounts/')) {
        presenceData.details = 'Forums, account settings'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Forums, Browsing...'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'docs.spongepowered.org': {
      const title = document.querySelector(
        'body > div.wy-grid-for-nav > section > div > div > div.document > div > div > h1',
      )
      if (title) {
        presenceData.details = 'Docs, reading:'
        presenceData.state = title.textContent

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Docs, Browsing...'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'jd.spongepowered.org': {
      const title = document.querySelector('head > title')
      const [title2] = title?.textContent?.split(' (') ?? []
      presenceData.details = 'Java Docs, viewing:'
      if (title2 && title2.length > 128)
        presenceData.state = `${title2.substring(0, 125)}...`
      else presenceData.state = title2

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'www.spongepowered.org': {
      if (document.location.pathname.includes('/downloads/')) {
        presenceData.details = 'Viewing downloads'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/chat')) {
        presenceData.details = 'Viewing chat'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/sponsors')) {
        presenceData.details = 'Viewing sponsors'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presence.setActivity()
      }

      break
    }
    case 'ore.spongepowered.org': {
      if (document.URL.includes('?categories=')) {
        const title = document.querySelector(
          'body > div > div > div.row.project-content > div.col-md-3 > div:nth-child(3) > table > tbody > tr.selected > td:nth-child(2) > strong',
        )
        presenceData.details = 'Ore, viewing category:'
        presenceData.state = title?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector(
          'body > div > div > div.project-header-container',
        )
      ) {
        const title = document.querySelector(
          'body > div > div > div.project-header-container > div:nth-child(1) > div > div > h1 > strong > a',
        )
        presenceData.details = 'Ore, Viewing resource:'
        if (title?.textContent && title.textContent.length > 128)
          presenceData.state = `${title.textContent.substring(0, 125)}...`
        else presenceData.state = title?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector(
          'body > div > div > div.row.user-header > div > span > span > h1',
        )
      ) {
        const user = document.querySelector(
          'body > div > div > div.row.user-header > div > span > span > h1',
        )
        presenceData.details = 'Ore, Viewing author:'
        presenceData.state = user?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.URL.includes('?q=')) {
        const search = document.querySelector(
          'body > div > div > div.row.project-content > div.col-md-9 > li > span.pull-left > i',
        )
        presenceData.details = 'Ore, searching for:'
        presenceData.state = search?.textContent

        presenceData.smallImageKey = Assets.Search

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'Ore, Browsing...'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    default:
      presence.setActivity()
  }
})
