const presence = new Presence({
  clientId: '644645903973482536',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let language: string

// TODO: Convert to Presences#getStrings()
/**
 * Get Translation
 * @param stringName Name of string you want to get
 */
function getTranslation(stringName: string): string {
  switch (stringName) {
    case 'HomePage':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt de startpagina'
        default:
          return 'Viewing the homepage '
      }
    case 'Browsing':
      switch (language) {
        case 'nl-NL':
          return 'Aan het bladeren'
        default:
          return 'Browsing '
      }
    case 'ViewProductButton':
      switch (language) {
        case 'nl-NL':
          return 'Bekijk Product'
        default:
          return 'View Item'
      }
    case 'ProductView':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt product:'
        default:
          return 'Viewing product:'
      }
    case 'BrandView':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt merk:'
        default:
          return 'Viewing brand:'
      }
    case 'TypeView':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt {type}'
        default:
          return 'Viewing {type}'
      }
    case 'ViewBrandButton':
      switch (language) {
        case 'nl-NL':
          return 'Bekijk Merk'
        default:
          return 'View Brand'
      }
    case 'Cart':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt zijn winkelwagen'
        default:
          return 'Viewing their cart'
      }
    case 'Wishlist':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt zijn verlanglijstje'
        default:
          return 'Viewing their wishlist'
      }
    case 'AccountSettings':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt zijn account'
        default:
          return 'Viewing their account'
      }
    case 'FAQ':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt de veel gestelde vragen'
        default:
          return 'Viewing the FAQ'
      }
    case 'Collections':
      switch (language) {
        case 'nl-NL':
          return 'Bekijkt de collectie van {collection}'
        default:
          return 'Viewing the collection of {collection}'
      }
    default:
      presence.error(
        'Unknown StringName please contact the Developer of this presence!\nYou can contact them in the PreMiD Discord (discord.premid.app)',
      )
      return 'Unknown stringName'
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Z/Zalando/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = document.location
  const elements = {
    navigation: document.querySelector('[aria-label="Breadcrumb"]'),
    brand: document.querySelector('h1 > div > a'),
  }
  const buttons = await presence.getSetting<boolean>('buttons')
  if (
    !language
    || language !== document.querySelector('html')?.getAttribute('lang')
  ) {
    language = document.querySelector('html')?.getAttribute('lang') ?? ''
  }

  // other = English
  // nl-NL = Nederlands

  switch (true) {
    case pathname === '/':
    case pathname.includes('home/'): {
      presenceData.details = getTranslation('HomePage')
      break
    }
    case pathname.includes('/cart/'): {
      presenceData.details = getTranslation('Cart')
      break
    }
    case pathname.includes('/wishlist/'): {
      presenceData.details = getTranslation('Wishlist')
      break
    }
    case pathname.includes('/myaccount/'): {
      presenceData.details = getTranslation('AccountSettings')
      break
    }
    case pathname.includes('/faq/'): {
      presenceData.details = getTranslation('FAQ')
      break
    }
    case pathname.includes('/collections/'): {
      // When you're viewing a collection with collection in url
      presenceData.details = getTranslation('Collections').replace(
        '{collection}',
        document.querySelector('#title-wrapper > div > h1')?.textContent ?? '',
      )
      break
    }
    case pathname.endsWith('.html'): {
      // When you're viewing a product
      presenceData.details = getTranslation('ProductView')
      presenceData.state = document.querySelector('h1')?.textContent // Product name & brand
      presenceData.buttons = [
        {
          label: getTranslation('ViewProductButton'),
          url: href,
        },
      ]
      break
    }
    case !!elements?.brand?.getAttribute('title'): {
      // When you're viewing a brand
      presenceData.details = getTranslation('BrandView')
      presenceData.state = elements.brand?.getAttribute('title')
      presenceData.buttons = [
        {
          label: getTranslation('ViewBrandButton'),
          url: href,
        },
      ]
      break
    }
    case !!elements?.navigation: {
      // When you're viewing a collection without collection in url
      presenceData.details = getTranslation('TypeView').replace(
        '{type}',
        document.querySelector('h1')?.textContent?.toLowerCase() ?? '',
      )
      presenceData.state = Array.from(
        document
          .querySelector('[aria-label="Breadcrumb"]')
          ?.querySelectorAll('li') || [],
      )
        ?.map(x => x?.textContent)
        ?.join(' => ')
      break
    }
    default: {
      presenceData.details = getTranslation('Browsing')
      break
    }
  }

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
