import { Assets } from 'premid'

const presence = new Presence({
  clientId: '612299892764966923',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const subsection = new URL(document.location.href).searchParams.get('subsection')

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Unknown page',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Steam/assets/logo.png',
  }

  if (document.location.hostname === 'steamcommunity.com') {
    presenceData.details = 'Steam Community'

    if (document.location.pathname === '/' || !document.location.pathname) {
      if (subsection) {
        presenceData.state = `Browsing ${subsection}.`

        presenceData.startTimestamp = browsingTimestamp
      }
      else {
        presenceData.state = 'Home'

        presenceData.startTimestamp = browsingTimestamp
      }
    }
    else if (document.location.pathname.includes('/followedgames')) {
      presenceData.state = 'Browsing follwing games.'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname === '/discussions/') {
      presenceData.state = 'Browsing discussions.'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/discussions/forum')) {
      const topicTitle = document.querySelector('div.topic')
      const topicAuthor = document.querySelector('div.authorline > a')

      if (topicTitle && topicAuthor) {
        presenceData.details = `Topic: ${topicTitle.textContent}`

        presenceData.state = `Author: ${topicAuthor.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else {
        presenceData.state = 'Browsing Steam Forums.'

        presenceData.startTimestamp = browsingTimestamp
      }
    }
    else if (document.location.pathname.includes('/search/users')) {
      presenceData.details = 'Searching for a user: '

      presenceData.state = `Username: ${
        document.querySelector<HTMLInputElement>('#search_text_box')?.value
      }`

      presenceData.startTimestamp = browsingTimestamp

      presenceData.smallImageKey = Assets.Search
    }
    else if (document.location.pathname.includes('/app/')) {
      if (document.location.pathname.includes('/workshop/')) {
        const AppName = document.querySelector(
          'div.apphub_HeaderTop.workshop > div.apphub_AppName.ellipsis',
        )

        presenceData.details = 'Steam Workshop'

        presenceData.state = `Home - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/discussions')) {
        const AppName = document.querySelector(
          'div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = `Discussions - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/screenshots')) {
        const AppName = document.querySelector(
          'div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = `Screenshots - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/images')) {
        const AppName = document.querySelector(
          'div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = `Artwork - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/broadcasts')) {
        const AppName = document.querySelector(
          'div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = `Broadcasts - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/videos')) {
        const AppName = document.querySelector(
          'div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = `Videos - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/allnews')) {
        const AppName = document.querySelector(
          'div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = `News - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/guides')) {
        const AppName = document.querySelector(
          'div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = `Guides - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/reviews')) {
        const AppName = document.querySelector(
          'div.apphub_HomeHeaderContent > div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = `Reviews - ${AppName?.textContent}`

        presenceData.startTimestamp = browsingTimestamp
      }
      else {
        const AppName = document.querySelector(
          'div.apphub_HeaderTop > div.apphub_AppName.ellipsis',
        )

        presenceData.state = AppName?.textContent

        presenceData.startTimestamp = browsingTimestamp
      }
    }
    else if (document.location.pathname.includes('/broadcast/watch/')) {
      const broadcastTitle = document.querySelector('#BroadcastGame')

      const broadcaster = document.querySelector(
        '#BroadcastInfo > div.BroadcastPersonaRow > span.BroadcastProfileName > a',
      )

      presenceData.details = 'Watching a broadcast.'

      presenceData.state = `${broadcastTitle?.textContent} - ${broadcaster?.textContent}`

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname === '/market') {
      presenceData.state = 'Community Market.'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/market/listings')) {
      const itemName = document.querySelector('#largeiteminfo_item_name')

      const itemPrice = document.querySelector(
        '#market_commodity_forsale > span:nth-child(2)',
      )

      presenceData.details = 'Community Market.'

      presenceData.state = `${itemName?.textContent} (${itemPrice?.textContent}).`

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname === '/workshop/') {
      presenceData.details = 'Steam Workshop'

      presenceData.state = 'Home'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/workshop/filedetails')) {
      const workshop = document.querySelector(
        '#mainContents > div.workshopItemDetailsHeader > div.workshopItemTitle',
      )

      presenceData.details = 'Steam Workshop'

      presenceData.state = workshop?.textContent

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/workshop/discussions')) {
      const AppName = document.querySelector(
        'div.apphub_HeaderTop.workshop > div.apphub_AppName.ellipsis',
      )

      presenceData.details = 'Steam Workshop'

      presenceData.state = `Discussions - ${AppName?.textContent}`

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/workshop/about')) {
      const AppName = document.querySelector(
        'div.apphub_HeaderTop.workshop > div.apphub_AppName.ellipsis',
      )

      presenceData.details = 'Steam Workshop'

      presenceData.state = `About - ${AppName?.textContent}`

      presenceData.startTimestamp = browsingTimestamp
    }
  }
  else if (document.location.hostname === 'store.steampowered.com') {
    presenceData.details = 'Steam Store'

    if (document.location.pathname === '/' || !document.location.pathname) {
      presenceData.state = 'Home'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/app/')) {
      const AppName = document.querySelector(
        'div.page_title_area.game_title_area.page_content > div.apphub_HomeHeaderContent > div > div.apphub_AppName',
      )

      presenceData.state = AppName?.textContent

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/cart')) {
      presenceData.state = 'Cart'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/checkout')) {
      presenceData.state = 'Checkout'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/wishlist')) {
      presenceData.state = 'Looking at a wishlist.'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/games')) {
      presenceData.state = 'Browsing games...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/genre')) {
      const parts = document.location.href.split('/')

      presenceData.state = `Genre: ${parts[parts.length - 2]?.replaceAll(
        '%20',
        ' ',
      )}`

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/demos')) {
      presenceData.state = 'Browsing demos...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/vr')) {
      presenceData.state = 'Browsing VR games...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/pccafe')) {
      presenceData.state = 'Browsing PC Cafe games...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/tags')) {
      const parts = document.location.href.split('/')

      presenceData.state = parts[parts.length - 2]
        ?.replaceAll('%20', ' ')
        .replaceAll('%26', '&')

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/macos')) {
      presenceData.state = 'Browsing Mac OS X games...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/linux')) {
      presenceData.state = 'Browsing Linux + Steam OS games...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/software')) {
      presenceData.state = 'Software'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/controller')) {
      presenceData.state = 'Steam Controller friendly games.'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/valveindex')) {
      presenceData.state = 'Browsing Steam Controllers...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/steamlink')) {
      presenceData.state = 'Steam Link'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/news')) {
      presenceData.state = 'Reading the news...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/about')) {
      presenceData.state = 'About'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/recommended')) {
      presenceData.state = 'Browsing recommended games...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/explore')) {
      presenceData.state = 'Exploring games...'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/updated')) {
      presenceData.state = 'Recently updated games.'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/stats')) {
      presenceData.state = 'Steam & Games Stats.'

      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/search')) {
      presenceData.state = `Searching for ${new URL(
        document.location.href,
      ).searchParams.get('term')}`

      presenceData.startTimestamp = browsingTimestamp

      presenceData.smallImageKey = Assets.Search
    }
  }

  presence.setActivity(presenceData)
})
