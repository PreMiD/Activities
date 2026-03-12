import { Assets } from 'premid'

const presence = new Presence({
  clientId: '623229289864626195', // CLIENT ID FOR YOUR PRESENCE
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/ESL/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  const admin = document.querySelector('#adminEnableLink > div')
  switch (document.location.hostname) {
    case 'fantasy.eslgaming.com': {
      presenceData.details = 'ESL Fantasy'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'pro.eslgaming.com': {
      if (document.location.pathname.includes('/standings/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} standings, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.location.pathname.includes('/scores-schedule/')
        || document.location.pathname.includes('/matches/')
      ) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} scores & schedule, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/top-player-stats/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} statistics, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/teams/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} teams, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/brackets/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} brackets, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/partners/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} partners, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/sponsors/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} sponsors, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/rules/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} rules, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/contact/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} contact, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/videos/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} videos, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/players/')) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = `${item?.textContent} players, ${item2?.textContent}`

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.location.pathname.includes('/news/')
        || document.location.pathname.includes('/news-2/')
      ) {
        const item = document.querySelector(
          '#site-navigation-wrap > nav > ul > li > a > span > span',
        )
        const item2 = document.querySelector(
          '#networkbar > esl-div > esl-div > esl-span',
        )
        presenceData.details = 'ESL Pros, reading:'
        presenceData.state = `${item?.textContent} news, ${item2?.textContent}`

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector('#content > article > header > h2') !== null
      ) {
        const item = document.querySelector('#content > article > header > h2')
        presenceData.details = 'ESL Pros, reading:'
        if (item?.textContent && item.textContent.length > 128)
          presenceData.state = `${item.textContent.substring(0, 125)}...`
        else presenceData.state = item?.textContent

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/tour/')) {
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = 'ESL Pro Tour'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'ESL Pros, viewing:'
        presenceData.state = 'Pro Tournament Overview'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'intelgrandslam.eslgaming.com': {
      if (document.location.pathname.includes('/rules/')) {
        presenceData.details = 'ESL Intel Grand Slam'
        presenceData.state = 'Reading the rules'

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/history/')) {
        presenceData.details = 'ESL Intel Grand Slam'
        presenceData.state = 'Viewing the history'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector(
          '#content > div > div > div > section > div > div > div > div > div > div > div > h1',
        ) !== null
      ) {
        const item = document.querySelector(
          '#content > div > div > div > section > div > div > div > div > div > div > div > h1',
        )
        presenceData.details = 'ESL Intel Grand Slam, reading:'
        if (item?.textContent && item.textContent.length > 128)
          presenceData.state = `${item.textContent.substring(0, 125)}...`
        else presenceData.state = item?.textContent

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'ESL Intel Grand Slam'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'www.intelextrememasters.com': {
      if (document.location.pathname.includes('/season-')) {
        const item3 = document.querySelector<HTMLImageElement>('#site-logo-inner > a > img')
        if (item3) {
          presenceData.details = 'ESL Intel Extreme Masters'
          presenceData.state = `Viewing: ${item3.alt}`

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
        else {
          presenceData.details = 'ESL Intel Extreme Masters'
          delete presenceData.state

          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
      }
      else if (document.location.pathname.includes('/tickets/')) {
        presenceData.details = 'ESL Intel Extreme Masters'
        presenceData.state = 'Viewing ticket sale'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/iempc/')) {
        presenceData.details = 'ESL Intel Extreme Masters'
        presenceData.state = 'Viewing IEM PC'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/news/')) {
        presenceData.details = 'ESL Intel Extreme Masters'
        presenceData.state = 'Viewing the latest news'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/video/')) {
        presenceData.details = 'ESL Intel Extreme Masters'
        presenceData.state = 'Browsing through video\'s'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/legacy/')) {
        presenceData.details = 'ESL Intel Extreme Masters'
        presenceData.state = 'Viewing the legacy'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/about/')) {
        presenceData.details = 'ESL Intel Extreme Masters'
        presenceData.state = 'Viewing the about page'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/sponsors/')) {
        presenceData.details = 'ESL Intel Extreme Masters'
        presenceData.state = 'Viewing the sponsors'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/contact/')) {
        presenceData.details = 'ESL Intel Extreme Masters'
        presenceData.state = 'Viewing the contact form'

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector('#content > article > header > h2') !== null
      ) {
        const item = document.querySelector('#content > article > header > h2')
        presenceData.details = 'ESL Intel Extreme Masters, reading:'
        if (item?.textContent && item.textContent.length > 128)
          presenceData.state = `${item.textContent.substring(0, 125)}...`
        else presenceData.state = item?.textContent

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'ESL Intel Extreme Masters'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'www.esl-one.com': {
      if (document.location.pathname.includes('/legal/')) {
        presenceData.details = 'ESL ONE'
        presenceData.state = 'Reading legal stuff'

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else if (
        document.querySelector('#content > article > header > h2') !== null
      ) {
        const item = document.querySelector('#content > article > header > h2')
        presenceData.details = 'ESL ONE, reading:'
        if (item?.textContent && item.textContent.length > 128)
          presenceData.state = `${item.textContent.substring(0, 125)}...`
        else presenceData.state = item?.textContent

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else {
        presence.setActivity()
      }

      break
    }
    case 'photos.eslgaming.com': {
      presenceData.details = 'ESL Photos'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'brand.eslgaming.com': {
      presenceData.details = 'ESL Brand'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'about.eslgaming.com': {
      presenceData.details = 'ESL About'
      delete presenceData.state

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)

      break
    }
    case 'shop.eslgaming.com': {
      if (document.location.pathname.includes('/products/')) {
        const item = document.querySelector(
          '#shopify-section-product-template > div > div > div > div > div:nth-child(2) > div > h1',
        )
        presenceData.details = 'ESL Shop, viewing product:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/collections/')) {
        const item = document.querySelector(
          '#shopify-section-collection-header > div > header > h1',
        )
        presenceData.details = 'ESL Shop, viewing collection:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/cart')) {
        presenceData.details = 'ESL Shop, viewing cart'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/search')) {
        const item = document.querySelector<HTMLInputElement>(
          '#MainContent > div > div > div > form > input.input-group-field',
        )
        presenceData.details = 'ESL Shop, searching for:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'ESL Shop'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'tv.eslgaming.com': {
      if (
        document.querySelector(
          '#videoplayer_embed_container > div.videoplayer_embed_inner.ng-scope > h3',
        ) !== null
      ) {
        const item = document.querySelector(
          '#videoplayer_embed_container > div.videoplayer_embed_inner.ng-scope > h3',
        )
        presenceData.details = 'ESL TV, watching:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'ESL TV'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'play.eslgaming.com': {
      if (document.location.pathname.includes('/games')) {
        presenceData.details = 'Browsing through games'
        delete presenceData.state

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/help')) {
        presenceData.details = 'Viewing customer support'
        delete presenceData.state

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/team/')) {
        const item = document.querySelector(
          'body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(3) > table.playerprofile_stammdaten > tbody > tr:nth-child(1) > td:nth-child(2)',
        )
        presenceData.details = 'ESL Play, viewing team:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/player/')) {
        const item = document.querySelector(
          'body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(2) > div:nth-child(4) > table > tbody > tr:nth-child(2) > td:nth-child(2)',
        )
        presenceData.details = 'ESL Play, viewing player:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/search/')) {
        const item = document.querySelector(
          'body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(1) > div:nth-child(1) > form > input[type=text]:nth-child(6)',
        )
        presenceData.details = 'ESL Play, searching for:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/search')) {
        presenceData.details = 'ESL Play - Search'
        delete presenceData.state

        delete presenceData.smallImageKey
        // disable Presence on admin settings
        presence.setActivity(presenceData)
      }
      else if (admin) {
        if (admin.textContent === 'Admin') {
          presence.setActivity()
        }
        else {
          const item = document.querySelector('head > title')
          presenceData.details = 'ESL Play, viewing:';
          [presenceData.state] = item?.textContent?.split(' | ESL Play') ?? []
          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
      }
      else {
        presence.setActivity()
      }

      break
    }
    case 'www.eslgaming.com': {
      if (document.location.pathname.includes('/article/')) {
        const item = document.querySelector('#content > article > header > h2')
        presenceData.details = 'ESL News, reading:'
        if (item?.textContent && item.textContent.length > 128)
          presenceData.state = `${item.textContent.substring(0, 125)}...`
        else presenceData.state = item?.textContent

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/category/')) {
        presenceData.details = 'Browsing category:';
        [presenceData.state] = document.location.pathname.split('category/')

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presence.setActivity()
      }

      break
    }
    case 'forum.eslgaming.com': {
      if (document.location.pathname.includes('/discussion/')) {
        const item = document.querySelector(
          '#vanilla_discussion_index > section > div > main > div.MessageList.Discussion > div > h1',
        )
        presenceData.details = 'ESL Forums, reading:'
        if (item?.textContent && item.textContent.length > 128)
          presenceData.state = `${item.textContent.substring(0, 125)}...`
        else presenceData.state = item?.textContent

        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/categories/')) {
        presenceData.details = 'ESL Forums, Browsing category:';
        [, presenceData.state] = document.location.pathname.split('categories/')

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/categories')) {
        presenceData.details = 'ESL Forums, viewing:'
        presenceData.state = 'all categories'
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/profile/comments')) {
        presenceData.details = 'ESL Forums, viewing profile:'
        presenceData.state = document.location.pathname.split('/')[4]
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/profile/discussions')) {
        presenceData.details = 'ESL Forums, viewing profile:'
        presenceData.state = document.location.pathname.split('/')[4]
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/profile')) {
        presenceData.details = 'ESL Forums, viewing profile:'
        presenceData.state = document.location.pathname.split('/')[4]
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/discussions')) {
        presenceData.details = 'ESL Forums, viewing:'
        presenceData.state = 'the lastest discussions'
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else {
        presenceData.details = 'ESL Forums'
        delete presenceData.state
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    case 'www.schulmeisterschaft.de': {
      if (document.location.pathname.includes('/news')) {
        const item = document.querySelector(
          'body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > table > tbody > tr:nth-child(2) > td > div.TitleNews',
        )
        presenceData.details = 'ESL - Schulmeisterschaft'
        presenceData.state = `Reading: ${item?.textContent}`
        presenceData.smallImageKey = Assets.Reading

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/team/')) {
        const item = document.querySelector(
          'body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(3) > table.playerprofile_stammdaten > tbody > tr:nth-child(1) > td:nth-child(2)',
        )
        presenceData.details = 'ESL Schulmeisterschaft, viewing team:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/player/')) {
        const item = document.querySelector(
          'body > div.l-page > div.l-main > div > div.l-content > article > div > div > div > div > div > div:nth-child(2) > div:nth-child(4) > table > tbody > tr:nth-child(2) > td:nth-child(2)',
        )
        presenceData.details = 'ESL Schulmeisterschaft, viewing player:'
        presenceData.state = item?.textContent

        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/streams')) {
        presenceData.details = 'ESL - Schulmeisterschaft'
        presenceData.state = 'Viewing stream page'
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/about')) {
        presenceData.details = 'ESL - Schulmeisterschaft'
        presenceData.state = 'Viewing about page'
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/support')) {
        presenceData.details = 'ESL - Schulmeisterschaft'
        presenceData.state = 'Viewing support page'
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('/games')) {
        presenceData.details = 'ESL - Schulmeisterschaft'
        presenceData.state = 'Viewing all games'
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (document.location.pathname.includes('play-es')) {
        presenceData.details = 'ESL - Schulmeisterschaft'
        presenceData.state = 'Viewing: play-eS'
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }
      else if (admin) {
        if (admin.textContent === 'Admin') {
          presence.setActivity()
        }
        else {
          const item = document.querySelector('head > title')
          presenceData.details = 'ESL - Schulmeisterschaft'
          presenceData.state = `Viewing: ${
            item?.textContent?.split(' | Schulmeisterschaft')[0]
          }`
          delete presenceData.smallImageKey

          presence.setActivity(presenceData)
        }
      }
      else {
        const item = document.querySelector('head > title')
        presenceData.details = 'ESL - Schulmeisterschaft'
        presenceData.state = `Viewing: ${
          item?.textContent?.split(' | Schulmeisterschaft')[0]
        }`
        delete presenceData.smallImageKey

        presence.setActivity(presenceData)
      }

      break
    }
    default:
      presence.setActivity()
  }
})
