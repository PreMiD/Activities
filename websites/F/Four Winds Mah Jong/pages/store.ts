export default function handler(
  pathList: string[],
  presenceData: PresenceData,
): void {
  const { href, search, pathname } = document.location
  const mainPath = pathList[0] ?? '/'
  const title = document.querySelector('h1')
  switch (mainPath) {
    case '/': {
      if (new URLSearchParams(search).get('s')) {
        presenceData.details = 'Searching the store'
        presenceData.state = title?.querySelector('span')
      }
      else {
        presenceData.details = 'Browsing the store'
      }
      break
    }
    case 'product': {
      presenceData.details = 'Viewing a product'
      presenceData.state = title
      presenceData.buttons = [{ label: 'View Product', url: href }]
      break
    }
    case 'product-category': {
      presenceData.details = 'Viewing a product category'
      presenceData.state = title
      break
    }
    case 'cart':
    case 'checkout': {
      presenceData.details = 'Viewing the cart'
      break
    }
    case 'about': {
      presenceData.details = 'Reading about Four Winds Mah Jong'
      break
    }
    case 'category': {
      presenceData.details = 'Viewing a category'
      presenceData.state = title?.querySelector('span')
      break
    }
    case 'author': {
      presenceData.details = 'Viewing posts by an author'
      presenceData.state = title?.querySelector('span')
      break
    }
    default:
      if (/^\/store\/\d{4}\/(?:\d{2}\/)?\d*/.test(pathname)) {
        presenceData.details = 'Browsing posts by date'
        presenceData.state = title
      }
      else if (document.querySelector<HTMLSpanElement>('.posted-on')) {
        presenceData.details = 'Reading a post'
        presenceData.state = title
        presenceData.buttons = [{ label: 'Read Post', url: href }]
      }
  }
}
