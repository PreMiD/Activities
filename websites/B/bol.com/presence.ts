import { Assets } from 'premid'

const presence = new Presence({
  clientId: '813110347165728849',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/bol.com/assets/logo.png',
}

function lowerCase(str: string, capitalFirstLetter?: boolean) {
  if (!str)
    return
  if (!capitalFirstLetter)
    return str.trim().toLowerCase()
  else return str.trim().charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    buttons: [{ label: 'Pagina bekijken', url: document.location.href }],
  }
  const { pathname, href } = document.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  const search = document.querySelector<HTMLInputElement>('#searchfor')?.value
  const product = {
    title: document.querySelector('#product_title')?.textContent,
    edition: document.querySelector('.feature-list__text')?.textContent,
  }
  const zoekCategorie = document.querySelector('.h1.bol_header')?.textContent
  presenceData.details = 'Bladert op bol.com'

  switch (true) {
    case !!search: {
      presenceData.details = privacy ? 'Zoekt voor een product' : 'Zoekt voor:'
      presenceData.state = search
      presenceData.smallImageKey = Assets.Search
      break
    }
    case !!product?.title: {
      const categorie = document.querySelectorAll('.breadcrumbs__item')
      presenceData.largeImageKey = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
        ?.content ?? ActivityAssets.Logo
      presenceData.details = privacy
        ? 'Bekijkt een product'
        : `Bekijkt '${lowerCase(product?.title)}'`
      presenceData.state = !product?.edition
        ? `In ${lowerCase(
          categorie[categorie.length - 1]?.textContent
          ?? 'een onbekende categorie',
        )}`
        : lowerCase(
            `Editie ${product.edition} | In ${
              categorie[categorie.length - 1]?.textContent
              ?? 'een onbekende categorie'
            }`,
            true,
          )
      presenceData.buttons = [{ label: 'Product bekijken', url: href }]

      break
    }
    case pathname.includes('/l/') && !!zoekCategorie: {
      presenceData.details = privacy
        ? 'Bekijkt producten in een categorie'
        : `Bekijkt ${lowerCase(zoekCategorie)}`
      presenceData.buttons = [{ label: 'Categorie bekijken', url: href }]
      break
    }
    case pathname === '/':
    case pathname === '/nl/': {
      presenceData.state = 'Startpagina'
      break
    }
    case pathname.includes('/bestellingen/'): {
      presenceData.details = 'Bekijkt hun bestellingen'
      break
    }
    case pathname.includes('/order_details/'): {
      const bestelDetails = JSON.parse(
        document.querySelector('wsp-review-modal-application > script')
          ?.textContent ?? '',
      )
      presenceData.details = privacy
        ? 'Bekijkt een bestelling'
        : 'Bekijkst bestel details van'
      presenceData.state = bestelDetails?.productTitle
      break
    }
    case pathname.includes('/account/'): {
      presenceData.details = 'Bekijkt hun account'
      break
    }
    default: {
      presenceData.state = `Pagina '${
        document.title.replace('| ', '|').replace(' |', '|').split('|')[1]
      }'`
    }
  }

  if ((!buttons || privacy) && presenceData.buttons)
    delete presenceData.buttons
  if (privacy && presenceData.state)
    delete presenceData.state
  if (!covers && presenceData.largeImageKey !== ActivityAssets.Logo)
    presenceData.largeImageKey = ActivityAssets.Logo

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
