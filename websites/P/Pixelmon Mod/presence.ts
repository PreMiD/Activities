import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/P/Pixelmon%20Mod/assets/logo.png',
}
const timestampCheck: {
  hash: string
  timestamp: number
} = {
  hash: '',
  timestamp: Math.floor(Date.now() / 1000),
}

function fullURL(host: string, url: string) {
  if (url === ActivityAssets.Logo)
    return ActivityAssets.Logo
  else if (url && host)
    return `https://${host}${url}`
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Pixelmon Mod',
  }
  const image = await presence.getSetting<number>('image')
  const { pathname, hostname, href } = document.location
  const title = document.querySelector('[class="side-segment"]')
    ?? document.querySelector(
      '#page-body > main > div > div.col-md-9 > div.side-segment > h3',
    )
  const firstChild = document.querySelector(
    '#content > div.contentHeader',
  )?.firstElementChild
  const search = document.querySelector<HTMLInputElement>('#searchInput')
  const hash: string = href
  if (timestampCheck.hash !== hash) {
    timestampCheck.hash = hash
    timestampCheck.timestamp = Math.floor(Date.now() / 1000)
  }
  switch (true) {
    case !!search?.value: {
      presenceData.smallImageKey = Assets.Search
      presenceData.details = 'Searching for'
      presenceData.state = search.value
      break
    }
    case !!document.querySelector('#firstHeading-h2csdq87lb'): {
      presenceData.details = 'Search results for'
      presenceData.state = document.querySelector('#ooui-php-1')?.textContent
      break
    }
    case document.querySelector('#siteSub')?.textContent?.includes('Wiki'): {
      if (firstChild?.className.includes('firstHeading')) {
        presenceData.state = firstChild.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.details = 'Reading wiki page'
        const matchingElement = document.evaluate(
          '//b[contains(text(),\'#\')]',
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        )?.singleNodeValue?.textContent
        const img = matchingElement
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
            Number(matchingElement?.split('#')[1]?.at(0)) === 0
              ? matchingElement?.split('#')[1]?.slice(1)
              : matchingElement?.split('#')[1]
          }.png`
          : fullURL(
              hostname,
              document
                .querySelector('[class="image"] > img')
                ?.getAttribute('src') ?? ActivityAssets.Logo,
            )
        presenceData.largeImageKey = image === 0 ? img : ActivityAssets.Logo
        presenceData.smallImageKey = image === 0 || image === 2 ? Assets.Reading : img ?? Assets.Reading

        presenceData.buttons = [{ label: 'Read Wiki Page', url: href }]
      }
      else {
        presenceData.details = 'Reading the wiki'
      }
      break
    }
    case pathname.includes('index.php'): {
      presenceData.details = 'Viewing the forum'
      break
    }
    case pathname.includes('viewforum.php'): {
      presenceData.details = `${title?.textContent} Forum`
      break
    }
    case pathname.includes('viewtopic.php'): {
      presenceData.details = 'Viewing post'
      presenceData.state = title?.textContent
      presenceData.buttons = [{ label: 'Read Post', url: href }]
      break
    }
    case pathname.includes('team.php'): {
      presenceData.details = `Pixelmon's ${
        document.querySelector('li[class=\'team-nav-active\']')?.textContent
      } Team`
      break
    }
    case pathname.includes('ucp.php?mode='): {
      presenceData.details = title?.textContent
      presenceData.smallImageKey = Assets.Reading
      break
    }
    case pathname.includes('downloads.php'): {
      presenceData.details = 'Viewing all available downloads'
      break
    }
    case pathname.includes('donation.php'): {
      presenceData.details = 'Viewing the donations page'
      break
    }
    case pathname.includes('tracker.php'): {
      presenceData.details = title?.textContent === 'Bugs'
        ? 'Viewing known bugs'
        : title?.textContent
      presenceData.state = document.querySelectorAll('[class="side-segment"]')?.[1]?.textContent
        ?? ''
      presenceData.buttons = [{ label: 'View Bug Report', url: href }]
      break
    }
    case !!document.querySelector(
      '#page-body > main > div > div.col-sm-8 > div:nth-child(2)',
    ): {
      presenceData.details = 'Viewing the homepage'
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
