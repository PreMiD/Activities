import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1212508565802192936',
})

// Other default assets can be found at index.d.ts
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/Library%20of%20Babel/assets/logo.png',
}

enum Pages {
  homepage = '/',
  about = '/about.html',
  search = '/search.html',
  sRes = '/search.cgi',
  book = '/book.cgi',
  browse = '/browse.cgi',
  bookmark = '/bookmark.cgi',
  anglishized = '/anglishize.cgi',
  theory = '/theory.html',
  images = '/slideshow.html',
  imgsearch = '/imagesearch.html',
  imgSRes = '/imagesearch.cgi',
  coloroscopy = '/coloroscopy.html',
  refhex = '/referencehex.html',
}

presence.on('UpdateData', async () => {
  if (!document.location.toString())
    return

  let base = document.location.pathname
  if (base.includes('theory'))
    base = '/theory.html'

  const title = document.title
    .replace('Anglishized', '')
    .replace('Theory - ', '')
    .replace('Image Search: ', '')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'hex802',
    name: 'Library of Babel',
    type: ActivityType.Watching,
  }
  const pageInp = document.querySelector<HTMLInputElement>('#page')?.value

  switch (base) {
    case Pages.homepage:
      presenceData.details = 'In the lobby (home)'
      break

    case Pages.about:
      presenceData.details = 'Learning about the archives'
      break

    case Pages.search:
      presenceData.details = 'Searching through the archives'
      break

    case Pages.imgsearch:
      presenceData.details = 'Searching through the image archives'
      break

    case Pages.imgSRes:
      presenceData.details = `Viewing image ${title}`
      break

    case Pages.sRes: {
      presenceData.details = 'Searching the archives for:'
      presenceData.state = document.querySelector<HTMLTextAreaElement>('#find')?.value
      break
    }

    case Pages.anglishized: {
      presenceData.details = `Reading ${title.replace(
        ` ${pageInp}`,
        '',
      )} (page ${pageInp})`
      presenceData.details = `Reading ${
        document.querySelector('.bookcont > h3')?.textContent
      } (page ${pageInp}, Anglishized)`
      break
    }

    case Pages.book:
    case Pages.bookmark:
      presenceData.details = `Reading Bookmark ${title.replace(
        ` ${pageInp}`,
        '',
      )}`
      break

    case Pages.browse:
      {
        presenceData.details = 'Browsing the archives'

        const hexVal = document.querySelector<HTMLTextAreaElement>('#hexer')?.value
        const wall = document.querySelector<HTMLSelectElement>('#inside1')
        const wallVal = wall?.value?.slice(1)
        const shelf = document.querySelector<HTMLSelectElement>('#inside2')
        const shelfVal = shelf?.value?.slice(1)
        const vol = document.querySelector<HTMLSelectElement>('#inside3')
        const volVal = vol?.value?.slice(1)

        presenceData.state = ''

        // hex will always be visible
        if (hexVal)
          presenceData.state += `Hex ${hexVal}`
        if (wall?.style.display && wallVal)
          presenceData.state += `, Wall ${wallVal}`
        if (shelf?.style.display && shelfVal)
          presenceData.state += `, Shelf ${shelfVal}`
        if (vol?.style.display && volVal)
          presenceData.state += `, Volume ${volVal}`
      }
      break

    case Pages.theory:
    case Pages.refhex:
      presenceData.details = `Learning about ${title}`
      break

    case Pages.images:
      presenceData.details = 'Viewing images'
      break

    case Pages.coloroscopy:
      presenceData.details = 'Undergoing coloroscopy'
      break

    default:
      presenceData.details = 'Navigating the site'
      break
  }

  presence.setActivity(presenceData)
})
